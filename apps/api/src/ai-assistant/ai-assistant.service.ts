import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { CLAUDE_DEFAULTS, SUGGESTIONS_CACHE_TTL_MS } from '../common/constants';
import { ResponseTone, UpdateConfigDto } from './dto/update-config.dto';
import { TranslateDto } from './dto/translate.dto';

// ── Tone-specific system prompts ──────────────────────────────────────────────

const TONE_PROMPTS: Record<ResponseTone, string> = {
  professional: 'You are a professional business assistant. Be clear, concise, and formal.',
  friendly:     'You are a friendly customer support assistant. Be warm and helpful.',
  casual:       'You are relaxed and conversational but still helpful.',
  strict:       'You are concise, direct, and minimal. Avoid unnecessary text.',
};

// ── Per-user config ───────────────────────────────────────────────────────────

export interface AiAssistantConfig {
  userId: number;
  autoReplyEnabled: boolean;
  responseTone: ResponseTone;
  confidenceThreshold: number; // 0–100
}

const DEFAULT_CONFIG: Omit<AiAssistantConfig, 'userId'> = {
  autoReplyEnabled: false,
  responseTone: 'professional',
  confidenceThreshold: 70,
};

// ── Cost constants (Claude 3.5 Haiku pricing) ─────────────────────────────────
const COST_PER_1K_IN  = 0.0008; // USD per 1K input  tokens
const COST_PER_1K_OUT = 0.004;  // USD per 1K output tokens

// ── Message shape ─────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ClaudeResult {
  text: string;
  tokensIn: number;
  tokensOut: number;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  private readonly configs = new Map<number, AiAssistantConfig>();

  private readonly suggestionsCache = new Map<
    string,
    { suggestions: string[]; expiresAt: number }
  >();

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly knowledgeBase: KnowledgeBaseService,
  ) {}

  // ── Claude client ──────────────────────────────────────────────────────────

  private getClient(): Anthropic {
    return new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY') ?? '',
    });
  }

  private getModelName(): string {
    return this.config.get<string>('CLAUDE_MODEL') ?? CLAUDE_DEFAULTS.model;
  }

  // ── Config management ──────────────────────────────────────────────────────

  getConfig(userId: number): AiAssistantConfig {
    return this.configs.get(userId) ?? { userId, ...DEFAULT_CONFIG };
  }

  updateConfig(userId: number, dto: UpdateConfigDto): AiAssistantConfig {
    const current = this.getConfig(userId);
    const updated: AiAssistantConfig = {
      ...current,
      ...(dto.responseTone        !== undefined && { responseTone:        dto.responseTone }),
      ...(dto.confidenceThreshold !== undefined && { confidenceThreshold: dto.confidenceThreshold }),
      ...(dto.autoReplyEnabled    !== undefined && { autoReplyEnabled:    dto.autoReplyEnabled }),
    };
    this.configs.set(userId, updated);
    this.logger.log(
      `[AI Config] user=${userId} tone=${updated.responseTone} ` +
      `threshold=${updated.confidenceThreshold} autoReply=${updated.autoReplyEnabled}`,
    );
    return updated;
  }

  isAutoReplyEnabled(userId: number): boolean {
    return this.getConfig(userId).autoReplyEnabled;
  }

  // ── Claude chat helper ─────────────────────────────────────────────────────

  private async callClaude(messages: ChatMessage[]): Promise<ClaudeResult> {
    const client    = this.getClient();
    const model     = this.getModelName();
    const maxTokens = CLAUDE_DEFAULTS.maxTokens;

    const systemMsg = messages.find((m) => m.role === 'system');
    const chatMsgs  = messages.filter((m) => m.role !== 'system');

    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      ...(systemMsg ? { system: systemMsg.content } : {}),
      messages: chatMsgs.map((m) => ({
        role:    m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const text      = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    const tokensIn  = response.usage.input_tokens;
    const tokensOut = response.usage.output_tokens;

    return { text, tokensIn, tokensOut };
  }

  // ── Log AI usage to DB ────────────────────────────────────────────────────

  private async logUsage(opts: {
    userId?: number;
    conversationId?: number;
    tokensIn: number;
    tokensOut: number;
  }): Promise<void> {
    const model   = this.getModelName();
    const costUsd =
      (opts.tokensIn  / 1000) * COST_PER_1K_IN +
      (opts.tokensOut / 1000) * COST_PER_1K_OUT;
    try {
      await this.prisma.ai_usage_logs.create({
        data: {
          user_id:         opts.userId ?? null,
          conversation_id: opts.conversationId ?? null,
          model,
          tokens_in:  opts.tokensIn,
          tokens_out: opts.tokensOut,
          cost_usd:   costUsd,
        },
      });
    } catch (e) {
      this.logger.warn('[AI] Failed to log usage', e);
    }
  }

  // ── Suggested replies ─────────────────────────────────────────────────────

  async getSuggestedReplies(conversationId: number, userId?: number): Promise<string[]> {
    const now = Date.now();

    const rows = await this.prisma.messages.findMany({
      where:   { conversation_id: conversationId },
      orderBy: { timestamp: 'desc' },
      take: 6,
    });

    if (rows.length === 0) return this.defaultSuggestions();

    const latestId = rows[0].id;
    const cacheKey = `${conversationId}:${latestId}`;
    const hit = this.suggestionsCache.get(cacheKey);
    if (hit && hit.expiresAt > now) return hit.suggestions;

    const lines = [...rows]
      .reverse()
      .filter((m) => m.text)
      .map((m) => `${m.sender_type === 'client' ? 'Customer' : 'Agent'}: ${m.text}`);

    const systemPrompt =
      'You are a customer support assistant. Based on the conversation context, generate 4 short professional reply suggestions the agent could send next. Replies must be concise, natural, and in Romanian.';

    const userPrompt =
      `Transcript:\n${lines.join('\n')}\n\n` +
      'Return ONLY valid JSON with no extra text:\n' +
      '{"suggestions": ["text", "text", "text", "text"]}';

    try {
      const { text: raw, tokensIn, tokensOut } = await this.callClaude([
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ]);

      void this.logUsage({ userId, conversationId, tokensIn, tokensOut });

      const jsonMatch = raw.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as { suggestions?: unknown };
        if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
          const suggestions = (parsed.suggestions as string[]).slice(0, 4);
          this.suggestionsCache.set(cacheKey, {
            suggestions,
            expiresAt: now + SUGGESTIONS_CACHE_TTL_MS,
          });
          this.logger.log(`[AI] suggested-replies for conversation=${conversationId}`);
          return suggestions;
        }
      }
    } catch (e) {
      this.logger.warn('[AI] getSuggestedReplies failed', e);
    }

    return this.defaultSuggestions();
  }

  // ── Translation ───────────────────────────────────────────────────────────

  async translateText(dto: TranslateDto, userId?: number): Promise<{
    translatedText: string;
    detectedSourceLanguage: string;
    confidence: number;
  }> {
    const text = dto.text?.trim();
    if (!text || text.length < 2) {
      return { translatedText: dto.text, detectedSourceLanguage: 'unknown', confidence: 100 };
    }

    const system =
      'You are a professional translator. Rules: ' +
      '1) Translate to the requested target language. ' +
      '2) Preserve meaning, tone, and style exactly. ' +
      '3) Keep emojis unchanged. ' +
      '4) Keep proper names and brand names unchanged. ' +
      '5) If the text is already in the target language, return it unchanged. ' +
      '6) Return ONLY valid JSON — no markdown, no explanation: ' +
      '{"translatedText":"...","detectedSourceLanguage":"...","confidence":0}';

    const user = `Translate to ${dto.targetLanguage}:\n${JSON.stringify(text)}`;

    try {
      const { text: raw, tokensIn, tokensOut } = await this.callClaude([
        { role: 'system', content: system },
        { role: 'user',   content: user },
      ]);

      void this.logUsage({ userId, tokensIn, tokensOut });

      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]) as {
          translatedText?: string;
          detectedSourceLanguage?: string;
          confidence?: number;
        };
        if (parsed.translatedText) {
          return {
            translatedText: parsed.translatedText,
            detectedSourceLanguage: parsed.detectedSourceLanguage ?? 'unknown',
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 80,
          };
        }
      }
    } catch (e) {
      this.logger.warn('[AI] translateText failed', e);
    }

    return { translatedText: text, detectedSourceLanguage: 'unknown', confidence: 0 };
  }

  private defaultSuggestions(): string[] {
    return [
      'Mulțumesc pentru mesaj. Verific imediat.',
      'Am primit solicitarea și revin în câteva minute.',
      'Înțeleg situația și mă ocup de rezolvare.',
      'Mulțumesc pentru informații. Revin cu un update.',
    ];
  }

  // ── Simple one-shot reply (test endpoint) ─────────────────────────────────

  async generateSimpleReply(text: string, userId?: number): Promise<string> {
    const tone = userId !== undefined ? this.getConfig(userId).responseTone : 'professional';
    const { text: reply, tokensIn, tokensOut } = await this.callClaude([
      { role: 'system', content: TONE_PROMPTS[tone] },
      { role: 'user',   content: text },
    ]);
    void this.logUsage({ userId, tokensIn, tokensOut });
    return reply;
  }

  // ── Reply with conversation history (+ optional KB RAG via Gemini PDF) ───

  async generateReplyFromMessage(input: {
    conversationId: number;
    latestUserMessage: string;
    userId?: number;
  }): Promise<{ reply: string; confidence: number }> {
    const { userId, latestUserMessage, conversationId } = input;
    const tone = userId !== undefined ? this.getConfig(userId).responseTone : 'professional';

    // ── Path 1: KB — Gemini reads PDFs, Claude composes the final reply ───────
    if (userId !== undefined) {
      const files = this.knowledgeBase.getFilesForUser(userId);
      if (files.length > 0) {
        try {
          const { answer } = await this.knowledgeBase.answerQuestionForUser(
            userId,
            latestUserMessage,
          );
          this.logger.log(
            `[AI] PDF-KB | user=${userId} conversation=${conversationId} tone=${tone}`,
          );
          return { reply: answer, confidence: 95 };
        } catch (e) {
          this.logger.warn('[AI] KB PDF answer failed, falling back to plain chat', e);
        }
      }
    }

    // ── Path 2: Plain chat with history via Claude ────────────────────────────
    const history = await this.prisma.messages.findMany({
      where:   { conversation_id: conversationId },
      orderBy: { timestamp: 'asc' },
      take: 10,
    });

    const messages: ChatMessage[] = [
      { role: 'system', content: TONE_PROMPTS[tone] },
    ];

    for (const msg of history) {
      if (!msg.text) continue;
      messages.push({
        role:    msg.sender_type === 'client' ? 'user' : 'assistant',
        content: msg.text,
      });
    }

    const lastMsg      = history[history.length - 1];
    const alreadyAtEnd = lastMsg?.sender_type === 'client' && lastMsg?.text === latestUserMessage;

    if (!alreadyAtEnd) {
      messages.push({ role: 'user', content: latestUserMessage });
    }

    const { text: reply, tokensIn, tokensOut } = await this.callClaude(messages);
    void this.logUsage({ userId, conversationId, tokensIn, tokensOut });
    return { reply, confidence: 80 };
  }
}
