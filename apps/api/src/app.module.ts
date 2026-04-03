import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramModule } from './telegram/telegram.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { MessengerModule } from './messenger/messenger.module';
import { FacebookModule } from './integrations/facebook/facebook.module';
import { EmailModule } from './email/email.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { AiAssistantModule } from './ai-assistant/ai-assistant.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { ConversationsModule } from './conversations/conversations.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TelegramModule,
    WhatsappModule,
    MessengerModule,
    FacebookModule,
    EmailModule,
    ChatModule,
    AiAssistantModule,
    KnowledgeBaseModule,
    ConversationsModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
