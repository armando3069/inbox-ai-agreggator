import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/types';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('tokens')
  getTokenUsage(@Request() req: AuthenticatedRequest, @Query('days') days?: string) {
    return this.analyticsService.getTokenUsage(req.user.id, days ? Number(days) : 30);
  }

  @Get('cost')
  getCost(@Request() req: AuthenticatedRequest, @Query('days') days?: string) {
    return this.analyticsService.getCost(req.user.id, days ? Number(days) : 30);
  }

  @Get('messages')
  getMessageStats(@Request() req: AuthenticatedRequest, @Query('days') days?: string) {
    return this.analyticsService.getMessageStats(req.user.id, days ? Number(days) : 30);
  }
}
