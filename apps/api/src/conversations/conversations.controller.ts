import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationsService } from './conversations.service';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';

interface AuthenticatedRequest extends Request {
  user: { id: number; email: string };
}

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get('contacts')
  getContacts(
    @Request() req: AuthenticatedRequest,
    @Query('platform') platform?: string,
    @Query('lifecycle') lifecycle?: string,
    @Query('search') search?: string,
  ) {
    return this.conversationsService.getContacts(req.user.id, { platform, lifecycle, search });
  }

  @Patch(':id/contact-info')
  @HttpCode(HttpStatus.OK)
  updateContactInfo(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactInfoDto,
  ) {
    return this.conversationsService.updateContactInfo(id, req.user.id, dto);
  }
}
