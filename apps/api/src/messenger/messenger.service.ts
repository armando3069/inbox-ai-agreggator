import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../chat/chat.gateway';
import { AiAssistantService } from '../ai-assistant/ai-assistant.service';
import { updateConversationLastMessage } from '../common/conversation.helper';
import { ReplyDto } from '../common/dto/reply.dto';
import type { conversations, messages, platform_accounts } from '@prisma/client';
import { TokenCryptoService } from '../common/security/token-crypto.service';

// ── Facebook Messenger webhook payload shapes ──────────────────────────────────

interface MessengerSender {
  id: string;
}

interface MessengerMessage {
  mid: string;
  text?: string;
}

interface MessengerMessaging {
  sender: MessengerSender;
  recipient: { id: string };
  timestamp: number;
  message?: MessengerMessage;
}

interface MessengerEntry {
  id: string;
  time: number;
  messaging: MessengerMessaging[];
}

export interface MessengerWebhookPayload {
  object: string;
  entry: MessengerEntry[];
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class MessengerService {
  private readonly logger = new Logger(MessengerService.name);
  private readonly graphBase: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly tokenCrypto: TokenCryptoService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    @Inject(forwardRef(() => AiAssistantService))
    private readonly aiAssistantService: AiAssistantService,
  ) {
    this.graphBase =
      config.get<string>('MESSENGER_GRAPH_API_BASE') ??
      'https://graph.facebook.com/v20.0';
  }

  // ── Raw Graph API — send a text message via Messenger ────────────────────

  private async sendApi(
    pageAccessToken: string,
    recipientId: string,
    text: string,
  ): Promise<void> {
    const url = `${this.graphBase}/me/messages?access_token=${pageAccessToken}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text },
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new BadRequestException(
        `Messenger API error: ${JSON.stringify(body)}`,
      );
    }
  }

  // ── Reply to an existing conversation ────────────────────────────────────

  async reply(userId: number, dto: ReplyDto): Promise<messages> {
    const conversation = await this.prisma.conversations.findFirst({
      where: {
        id: dto.conversationId,
        platform_account: { user_id: userId, status: 'active' },
      },
      include: { platform_account: true },
    });

    if (!conversation) throw new NotFoundException('Conversation not found');

    const pageAccessToken = this.decryptAccessToken(
      conversation.platform_account.access_token,
    );

    await this.sendApi(pageAccessToken, conversation.external_chat_id, dto.text);

    const msg = await this.prisma.messages.create({
      data: {
        conversation_id: conversation.id,
        sender_type: 'bot',
        text: dto.text,
        platform: 'messenger',
        timestamp: new Date(),
      },
    });

    await updateConversationLastMessage(this.prisma, msg);
    this.chatGateway.emitNewMessage(userId, msg);
    return msg;
  }

  // ── Handle incoming webhook payload ──────────────────────────────────────

  async handleWebhookPayload(payload: MessengerWebhookPayload): Promise<void> {
    this.logger.debug(
      `[MESSENGER WEBHOOK] object=${payload.object} entries=${payload.entry?.length}`,
    );

    if (payload.object !== 'page') {
      this.logger.warn(`[MESSENGER WEBHOOK] unexpected object: ${payload.object}`);
      return;
    }

    for (const entry of payload.entry) {
      // entry.id is the Page ID that received the message
      const pageId = entry.id;

      const platformAccount = await this.prisma.platform_accounts.findFirst({
        where: {
          platform: 'messenger',
          external_app_id: pageId,
          status: 'active',
        },
      });

        if (!platformAccount) {
          this.logger.warn(
            `[MESSENGER WEBHOOK] No platform_account for page_id=${pageId}. ` +
            `Connect the page first via the Facebook OAuth flow.`,
          );
          continue;
        }

      for (const event of entry.messaging ?? []) {
        // Skip echo events (messages sent by the page itself)
        if (event.sender.id === pageId) continue;
        // Only handle standard text messages
        if (!event.message?.text) continue;

        await this.saveIncomingMessage(
          platformAccount,
          platformAccount.user_id,
          event.sender.id,
          event,
        );
      }
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async fetchMessengerProfile(
    psid: string,
    pageAccessToken: string,
  ): Promise<{ name: string | null; profilePic: string | null }> {
    try {
      const url = `${this.graphBase}/${psid}?fields=name,profile_pic&access_token=${pageAccessToken}`;
      const res = await fetch(url);
      if (!res.ok) return { name: null, profilePic: null };
      const data = (await res.json()) as { name?: string; profile_pic?: string };
      return { name: data.name ?? null, profilePic: data.profile_pic ?? null };
    } catch {
      return { name: null, profilePic: null };
    }
  }

  private async saveIncomingMessage(
    platformAccount: platform_accounts,
    userId: number,
    senderId: string,
    event: MessengerMessaging,
  ): Promise<void> {
    const text = event.message!.text!;
    const mid = event.message!.mid;

    let isNew = false;
    let conversation = await this.prisma.conversations.findFirst({
      where: {
        platform_account_id: platformAccount.id,
        external_chat_id: senderId,
      },
    });

    if (!conversation) {
      isNew = true;
      const profile = await this.fetchMessengerProfile(
        senderId,
        this.decryptAccessToken(platformAccount.access_token),
      );
      conversation = await this.prisma.conversations.create({
        data: {
          platform_account_id: platformAccount.id,
          external_chat_id: senderId,
          platform: 'messenger',
          contact_username: senderId,
          contact_name: profile.name,
          contact_avatar: profile.profilePic,
        },
      });
      this.logger.log(
        `[MESSENGER] New conversation ${conversation.id} — profile: name="${profile.name ?? 'unknown'}"`,
      );
    }

    const message = await this.prisma.messages.create({
      data: {
        conversation_id: conversation.id,
        sender_type: 'client',
        text,
        external_message_id: mid,
        platform: 'messenger',
        timestamp: new Date(event.timestamp),
      },
    });

    await updateConversationLastMessage(this.prisma, message);

    this.chatGateway.emitNewMessage(userId, message);
    if (isNew) this.chatGateway.emitNewConversation(userId, conversation);

    // Auto-reply if enabled for this user
    if (this.aiAssistantService.isAutoReplyEnabled(userId)) {
      this.triggerAutoReply(platformAccount, conversation, userId, text).catch(
        (e) =>
          this.logger.error(
            `[MESSENGER AUTO-REPLY] failed for conversation ${conversation!.id}`,
            e,
          ),
      );
    }
  }

  // ── Auto-reply helper ─────────────────────────────────────────────────────

  private async triggerAutoReply(
    platformAccount: platform_accounts,
    conversation: conversations,
    userId: number,
    userText: string,
  ): Promise<void> {
    const { reply, confidence } =
      await this.aiAssistantService.generateReplyFromMessage({
        conversationId: conversation.id,
        latestUserMessage: userText,
        userId,
      });

    const { confidenceThreshold } = this.aiAssistantService.getConfig(userId);

    this.logger.log(
      `[MESSENGER AUTO-REPLY] conversation=${conversation.id} confidence=${confidence}% threshold=${confidenceThreshold}%`,
    );

    if (confidence < confidenceThreshold) {
      this.logger.warn(
        `[MESSENGER AUTO-REPLY] skipped — confidence ${confidence}% below threshold ${confidenceThreshold}%`,
      );
      return;
    }

    await this.sendApi(
      platformAccount.access_token,
      conversation.external_chat_id,
      reply,
    );

    const message = await this.prisma.messages.create({
      data: {
        conversation_id: conversation.id,
        sender_type: 'bot',
        text: reply,
        platform: 'messenger',
        timestamp: new Date(),
      },
    });

    await updateConversationLastMessage(this.prisma, message);
    this.chatGateway.emitNewMessage(userId, message);
    this.logger.log(
      `[MESSENGER AUTO-REPLY] sent to conversation ${conversation.id}`,
    );
  }

  private decryptAccessToken(token: string): string {
    return this.tokenCrypto.decrypt(token);
  }
}
