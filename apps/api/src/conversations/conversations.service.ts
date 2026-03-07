import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getContacts(
    userId: number,
    filters: { platform?: string; lifecycle?: string; search?: string },
  ) {
    const where: Prisma.conversationsWhereInput = {
      platform_account: { user_id: userId },
    };

    if (filters.platform) where.platform = filters.platform;
    if (filters.lifecycle) where.lifecycle_status = filters.lifecycle;
    if (filters.search) {
      where.OR = [
        { contact_name: { contains: filters.search, mode: 'insensitive' } },
        { contact_username: { contains: filters.search, mode: 'insensitive' } },
        { contact_email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.conversations.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 500,
    });
  }

  /**
   * Fetch a conversation with ownership verification.
   * Throws NotFoundException if the conversation doesn't exist or doesn't belong to the user.
   */
  async getConversationForUser(
    conversationId: number,
    userId: number,
    include?: { platform_account?: boolean; messages?: boolean },
  ) {
    const conversation = await this.prisma.conversations.findFirst({
      where: { id: conversationId, platform_account: { user_id: userId } },
      include,
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async updateContactInfo(
    id: number,
    userId: number,
    dto: UpdateContactInfoDto,
  ) {
    await this.getConversationForUser(id, userId);

    const data: Prisma.conversationsUpdateInput = {};
    if (dto.lifecycleStatus !== undefined) data.lifecycle_status = dto.lifecycleStatus;
    if (dto.contactEmail    !== undefined) data.contact_email    = dto.contactEmail;
    if (dto.contactPhone    !== undefined) data.contact_phone    = dto.contactPhone;
    if (dto.contactCountry  !== undefined) data.contact_country  = dto.contactCountry;
    if (dto.contactLanguage !== undefined) data.contact_language = dto.contactLanguage;

    return this.prisma.conversations.update({ where: { id }, data });
  }
}
