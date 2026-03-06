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

  async updateContactInfo(
    id: number,
    userId: number,
    dto: UpdateContactInfoDto,
  ) {
    // Verify the conversation belongs to the authenticated user
    const existing = await this.prisma.conversations.findFirst({
      where: { id, platform_account: { user_id: userId } },
    });
    if (!existing) throw new NotFoundException('Conversation not found');

    const data: Prisma.conversationsUpdateInput = {};
    if (dto.lifecycleStatus !== undefined) data.lifecycle_status = dto.lifecycleStatus;
    if (dto.contactEmail    !== undefined) data.contact_email    = dto.contactEmail;
    if (dto.contactPhone    !== undefined) data.contact_phone    = dto.contactPhone;
    if (dto.contactCountry  !== undefined) data.contact_country  = dto.contactCountry;
    if (dto.contactLanguage !== undefined) data.contact_language = dto.contactLanguage;

    return this.prisma.conversations.update({ where: { id }, data });
  }
}
