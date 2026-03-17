import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('tokens')
  getTokenUsage(@Req() req: Request, @Query('days') days?: string) {
    const userId = (req.user as { id: number }).id;
    return this.analyticsService.getTokenUsage(userId, days ? Number(days) : 30);
  }

  @Get('cost')
  getCost(@Req() req: Request, @Query('days') days?: string) {
    const userId = (req.user as { id: number }).id;
    return this.analyticsService.getCost(userId, days ? Number(days) : 30);
  }

  @Get('messages')
  getMessageStats(@Req() req: Request, @Query('days') days?: string) {
    const userId = (req.user as { id: number }).id;
    return this.analyticsService.getMessageStats(userId, days ? Number(days) : 30);
  }
}
