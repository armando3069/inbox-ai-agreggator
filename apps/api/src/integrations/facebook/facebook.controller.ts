import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpException,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
  Body,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types';
import { FacebookService } from './facebook.service';
import { FacebookSelectPageDto } from './dto/facebook-select-page.dto';

@Controller('integrations/facebook')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) {}

  @UseGuards(JwtAuthGuard)
  @Get('connect')
  async connect(@Request() req: AuthenticatedRequest) {
    return this.facebookService.createConnectUrl(req.user.id);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Query('error_reason') errorReason: string | undefined,
    @Query('error_description') errorDescription: string | undefined,
    @Res() res: Response,
  ) {
    let redirectUrl: string;

    try {
      redirectUrl = await this.facebookService.handleCallback({
        code,
        state,
        error,
        errorReason,
        errorDescription,
      });
    } catch (callbackError) {
      const reason =
        callbackError instanceof HttpException
          ? this.facebookService.getCallbackErrorReason(callbackError)
          : 'invalid_callback_state';
      redirectUrl = this.facebookService.buildFrontendErrorRedirect(reason);
    }

    return res.redirect(redirectUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pending-pages')
  async pendingPages(
    @Request() req: AuthenticatedRequest,
    @Query('sessionId') sessionId: string,
  ) {
    return this.facebookService.getPendingPages(req.user.id, sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('select-page')
  async selectPage(
    @Request() req: AuthenticatedRequest,
    @Body() dto: FacebookSelectPageDto,
  ) {
    return this.facebookService.selectPage(
      req.user.id,
      dto.sessionId,
      dto.selectedPageId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  async status(@Request() req: AuthenticatedRequest) {
    return this.facebookService.getStatus(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('disconnect')
  async disconnect(@Request() req: AuthenticatedRequest) {
    return this.facebookService.disconnect(req.user.id);
  }
}
