import {
  BadRequestException,
  BadGatewayException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, platform_accounts } from '@prisma/client';
import { randomBytes } from 'crypto';
import { FRONTEND_URL } from '../../common/constants';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenCryptoService } from '../../common/security/token-crypto.service';
import {
  FacebookGraphClient,
  type FacebookGraphMutationResult,
} from './facebook-graph.client';
import type { FacebookPageOption, FacebookPageView } from './facebook.types';

type FacebookSettings = Prisma.JsonObject & {
  category?: string | null;
  pageName?: string | null;
  pageId?: string | null;
  tokenEncrypted?: boolean;
  connectedVia?: string;
  disconnectedAt?: string | null;
  lastSubscriptionSync?: {
    action: 'subscribe' | 'unsubscribe';
    ok: boolean;
    statusCode: number;
    syncedAt: string;
  } | null;
};

@Injectable()
export class FacebookService {
  private readonly logger = new Logger(FacebookService.name);
  private readonly frontendUrl: string;
  private readonly stateTtlMs = 10 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly tokenCrypto: TokenCryptoService,
    private readonly graphClient: FacebookGraphClient,
  ) {
    this.frontendUrl = this.config.get<string>('FRONTEND_URL') ?? FRONTEND_URL;
  }

  async createConnectUrl(userId: number): Promise<{ url: string }> {
    const state = randomBytes(32).toString('hex');
    const redirectTo = `${this.frontendUrl}/connect-platforms?manage=1`;

    await this.prisma.facebook_oauth_sessions.deleteMany({
      where: {
        user_id: userId,
        status: { in: ['pending', 'awaiting_selection'] },
      },
    });

    await this.prisma.facebook_oauth_sessions.create({
      data: {
        user_id: userId,
        state,
        redirect_to: redirectTo,
        expires_at: new Date(Date.now() + this.stateTtlMs),
      },
    });

    return { url: this.graphClient.buildOAuthUrl(state) };
  }

  async handleCallback(params: {
    code?: string;
    state?: string;
    error?: string;
    errorReason?: string;
    errorDescription?: string;
  }): Promise<string> {
    const session = await this.requireValidSessionByState(params.state);

    if (params.error) {
      await this.failSession(session.id);

      if (params.error === 'access_denied' || params.errorReason === 'user_denied') {
        return this.buildRedirect('error', 'permissions_denied', session.redirect_to);
      }

      return this.buildRedirect(
        'error',
        params.errorDescription ?? params.error,
        session.redirect_to,
      );
    }

    if (!params.code) {
      await this.failSession(session.id);
      return this.buildRedirect('error', 'missing_code', session.redirect_to);
    }

    try {
      const userAccessToken = await this.graphClient.exchangeCodeForUserAccessToken(
        params.code,
      );
      const pages = await this.graphClient.fetchManagedPages(userAccessToken);

      if (pages.length === 0) {
        await this.failSession(session.id);
        return this.buildRedirect('error', 'no_pages_found', session.redirect_to);
      }

      if (pages.some((page) => !page.pageAccessToken)) {
        await this.failSession(session.id);
        return this.buildRedirect('error', 'page_token_missing', session.redirect_to);
      }

      if (pages.length === 1) {
        await this.connectSelectedPage(session.user_id, pages[0]);
        await this.completeSession(session.id);

        this.logger.log(
          `Facebook page connected for user ${session.user_id} (page_id=${pages[0].pageId})`,
        );

        return this.buildRedirect(
          'connected',
          undefined,
          session.redirect_to,
          pages[0],
        );
      }

      await this.prisma.facebook_oauth_sessions.update({
        where: { id: session.id },
        data: {
          status: 'awaiting_selection',
          pages: pages as unknown as Prisma.InputJsonValue,
        },
      });

      return this.buildRedirect('select_page', undefined, session.redirect_to, undefined, {
        sessionId: session.id,
      });
    } catch (error) {
      await this.failSession(session.id);

      const message = this.getPublicErrorMessage(error);

      this.logger.warn(
        `[Facebook callback] failed ${JSON.stringify({
          userId: session.user_id,
          message,
          error:
            error instanceof Error ? error.message : 'unknown_error',
        })}`,
      );

      return this.buildRedirect('error', message, session.redirect_to);
    }
  }

  async getPendingPages(userId: number, sessionId: string): Promise<{ pages: FacebookPageView[] }> {
    const session = await this.requirePendingSelectionSession(userId, sessionId);
    const pages = this.readPages(session.pages).map((page) => ({
      pageId: page.pageId,
      pageName: page.pageName,
      category: page.category,
    }));

    return { pages };
  }

  async selectPage(userId: number, sessionId: string, selectedPageId: string) {
    const session = await this.requirePendingSelectionSession(userId, sessionId);
    const selectedPage = this.readPages(session.pages).find(
      (page) => page.pageId === selectedPageId,
    );

    if (!selectedPage) {
      throw new NotFoundException('Selected Facebook page was not found');
    }

    if (!selectedPage.pageAccessToken) {
      throw new BadRequestException('Facebook page access token is missing');
    }

    await this.connectSelectedPage(userId, selectedPage);
    await this.completeSession(session.id);

    this.logger.log(
      `Facebook page connected for user ${userId} (page_id=${selectedPage.pageId})`,
    );

    return {
      connected: true,
      page: {
        pageId: selectedPage.pageId,
        pageName: selectedPage.pageName,
        category: selectedPage.category,
      },
    };
  }

  async getStatus(userId: number) {
    const account = await this.prisma.platform_accounts.findFirst({
      where: { user_id: userId, platform: 'messenger', status: 'active' },
      orderBy: { updated_at: 'desc' },
    });

    if (!account) {
      return { connected: false };
    }

    const settings = this.readSettings(account);

    return {
      connected: true,
      provider: 'facebook_messenger',
      pageId: account.external_app_id,
      pageName: settings.pageName ?? null,
      category: settings.category ?? null,
      status: account.status,
      connectedAt: account.created_at,
      updatedAt: account.updated_at,
    };
  }

  async disconnect(userId: number) {
    const account = await this.prisma.platform_accounts.findFirst({
      where: {
        user_id: userId,
        platform: 'messenger',
        status: 'active',
      },
      orderBy: { updated_at: 'desc' },
    });

    if (!account) {
      throw new NotFoundException('No active Facebook Messenger connection found');
    }

    const pageId = account.external_app_id;
    const pageAccessToken = account.access_token
      ? this.tokenCrypto.decrypt(account.access_token)
      : '';

    let unsubscribeResult: FacebookGraphMutationResult | null = null;

    if (pageId && pageAccessToken) {
      try {
        unsubscribeResult = await this.graphClient.unsubscribePage(
          pageId,
          pageAccessToken,
        );

        this.logger.log(
          `[Facebook unsubscribe] ${JSON.stringify({
            userId,
            pageId,
            ok: unsubscribeResult.ok,
            statusCode: unsubscribeResult.statusCode,
            body: unsubscribeResult.body,
          })}`,
        );
      } catch (error) {
        this.logger.warn(
          `[Facebook unsubscribe] network_failure ${JSON.stringify({
            userId,
            pageId,
            message: error instanceof Error ? error.message : 'unknown_error',
          })}`,
        );
      }
    } else {
      this.logger.warn(
        `[Facebook disconnect] missing_page_credentials ${JSON.stringify({
          userId,
          pageId,
          hasToken: Boolean(pageAccessToken),
        })}`,
      );
    }

    if (unsubscribeResult && !unsubscribeResult.ok) {
      const level = unsubscribeResult.isTokenError ? 'warn' : 'error';
      this.logger[level](
        `[Facebook unsubscribe] api_failure ${JSON.stringify({
          userId,
          pageId,
          statusCode: unsubscribeResult.statusCode,
          isTokenError: unsubscribeResult.isTokenError,
          body: unsubscribeResult.body,
        })}`,
      );
    }

    const settings = this.readSettings(account);

    await this.prisma.platform_accounts.update({
      where: { id: account.id },
      data: {
        access_token: '',
        external_app_id: null,
        status: 'disconnected',
        settings: {
          ...settings,
          pageId: null,
          pageName: null,
          category: null,
          tokenEncrypted: false,
          disconnectedAt: new Date().toISOString(),
          lastSubscriptionSync: unsubscribeResult
            ? {
                action: 'unsubscribe',
                ok: unsubscribeResult.ok,
                statusCode: unsubscribeResult.statusCode,
                syncedAt: new Date().toISOString(),
              }
            : {
                action: 'unsubscribe',
                ok: false,
                statusCode: 0,
                syncedAt: new Date().toISOString(),
              },
        },
      },
    });

    await this.prisma.facebook_oauth_sessions.deleteMany({
      where: { user_id: userId, status: 'awaiting_selection' },
    });

    this.logger.log(
      `[Facebook disconnect] completed ${JSON.stringify({
        userId,
        pageId,
        unsubscribed: unsubscribeResult?.ok ?? false,
      })}`,
    );

    return {
      success: true,
      message: 'Facebook page disconnected successfully',
    };
  }

  async getPageAccessToken(account: platform_accounts): Promise<string> {
    return this.tokenCrypto.decrypt(account.access_token);
  }

  private async connectSelectedPage(userId: number, page: FacebookPageOption): Promise<void> {
    const subscribeResult = await this.graphClient.subscribePage(
      page.pageId,
      page.pageAccessToken,
    );

    this.logger.log(
      `[Facebook subscribe] ${JSON.stringify({
        userId,
        pageId: page.pageId,
        ok: subscribeResult.ok,
        statusCode: subscribeResult.statusCode,
        body: subscribeResult.body,
      })}`,
    );

    if (!subscribeResult.ok) {
      throw new BadGatewayException(
        this.getSubscriptionFailureMessage(subscribeResult, 'subscribe'),
      );
    }

    await this.prisma.platform_accounts.updateMany({
      where: {
        user_id: userId,
        platform: 'messenger',
        status: 'active',
        NOT: { external_app_id: page.pageId },
      },
      data: {
        status: 'disconnected',
        access_token: '',
      },
    });

    const settings: FacebookSettings = {
      pageId: page.pageId,
      pageName: page.pageName,
      category: page.category,
      tokenEncrypted: true,
      connectedVia: 'facebook_oauth',
      disconnectedAt: null,
      lastSubscriptionSync: {
        action: 'subscribe',
        ok: subscribeResult.ok,
        statusCode: subscribeResult.statusCode,
        syncedAt: new Date().toISOString(),
      },
    };

    const encryptedToken = this.tokenCrypto.encrypt(page.pageAccessToken);
    const exactAccount = await this.prisma.platform_accounts.findFirst({
      where: {
        user_id: userId,
        platform: 'messenger',
        external_app_id: page.pageId,
      },
      orderBy: { updated_at: 'desc' },
    });

    if (exactAccount) {
      await this.prisma.platform_accounts.update({
        where: { id: exactAccount.id },
        data: {
          access_token: encryptedToken,
          external_app_id: page.pageId,
          status: 'active',
          settings,
        },
      });
      return;
    }

    const reusableDisconnectedAccount = await this.prisma.platform_accounts.findFirst({
      where: {
        user_id: userId,
        platform: 'messenger',
        status: 'disconnected',
      },
      orderBy: { updated_at: 'desc' },
    });

    if (reusableDisconnectedAccount) {
      await this.prisma.platform_accounts.update({
        where: { id: reusableDisconnectedAccount.id },
        data: {
          access_token: encryptedToken,
          external_app_id: page.pageId,
          status: 'active',
          settings,
        },
      });

      this.logger.log(
        `[Facebook reconnect] reused_disconnected_record ${JSON.stringify({
          userId,
          pageId: page.pageId,
          integrationId: reusableDisconnectedAccount.id,
        })}`,
      );
      return;
    }

    await this.prisma.platform_accounts.create({
      data: {
        user_id: userId,
        platform: 'messenger',
        access_token: encryptedToken,
        external_app_id: page.pageId,
        status: 'active',
        settings,
      },
    });
  }

  private async requireValidSessionByState(state?: string) {
    if (!state) {
      throw new UnauthorizedException('Facebook OAuth state is missing');
    }

    const session = await this.prisma.facebook_oauth_sessions.findUnique({
      where: { state },
    });

    if (!session) {
      throw new UnauthorizedException('Facebook OAuth state is invalid');
    }

    if (session.consumed_at || session.expires_at.getTime() < Date.now()) {
      throw new UnauthorizedException('Facebook OAuth state is expired');
    }

    return session;
  }

  private async requirePendingSelectionSession(userId: number, sessionId: string) {
    const session = await this.prisma.facebook_oauth_sessions.findFirst({
      where: {
        id: sessionId,
        user_id: userId,
        status: 'awaiting_selection',
      },
    });

    if (!session) {
      throw new NotFoundException('Facebook page selection session was not found');
    }

    if (session.expires_at.getTime() < Date.now()) {
      await this.failSession(session.id);
      throw new UnauthorizedException('Facebook page selection session expired');
    }

    return session;
  }

  private async completeSession(sessionId: string): Promise<void> {
    await this.prisma.facebook_oauth_sessions.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        consumed_at: new Date(),
        pages: Prisma.JsonNull,
      },
    });
  }

  private async failSession(sessionId: string): Promise<void> {
    await this.prisma.facebook_oauth_sessions.updateMany({
      where: { id: sessionId, consumed_at: null },
      data: {
        status: 'failed',
        consumed_at: new Date(),
      },
    });
  }

  private readPages(pages: Prisma.JsonValue | null): FacebookPageOption[] {
    if (!Array.isArray(pages)) {
      return [];
    }

    return pages as unknown as FacebookPageOption[];
  }

  private readSettings(account: platform_accounts): FacebookSettings {
    return ((account.settings ?? {}) as Prisma.JsonObject) as FacebookSettings;
  }

  private getSubscriptionFailureMessage(
    result: FacebookGraphMutationResult,
    action: 'subscribe' | 'unsubscribe',
  ): string {
    const graphMessage =
      'error' in result.body &&
      result.body.error &&
      typeof result.body.error === 'object' &&
      'message' in result.body.error
        ? String(result.body.error.message)
        : undefined;

    return (
      graphMessage ??
      `Facebook ${action} request failed with status ${result.statusCode}`
    );
  }

  private buildRedirect(
    mode: 'connected' | 'select_page' | 'error',
    reason?: string,
    redirectTo?: string | null,
    page?: Pick<FacebookPageView, 'pageId' | 'pageName'>,
    extra?: Record<string, string>,
  ): string {
    const url = new URL(redirectTo ?? `${this.frontendUrl}/connect-platforms?manage=1`);
    url.searchParams.set('facebook', mode);

    if (reason) {
      url.searchParams.set('reason', reason);
    }

    if (page?.pageId) {
      url.searchParams.set('pageId', page.pageId);
    }

    if (page?.pageName) {
      url.searchParams.set('pageName', page.pageName);
    }

    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    return url.toString();
  }

  buildFrontendErrorRedirect(reason: string): string {
    return this.buildRedirect('error', reason);
  }

  getCallbackErrorReason(error: HttpException): string {
    return this.getHttpExceptionMessage(error);
  }

  private getExceptionMessage(error: BadRequestException): string {
    const response = error.getResponse();
    if (typeof response === 'string') {
      return response;
    }

    if (response && typeof response === 'object' && 'message' in response) {
      const message = (response as { message?: string | string[] }).message;
      return Array.isArray(message) ? message[0] : (message ?? 'bad_request');
    }

    return 'bad_request';
  }

  private getPublicErrorMessage(error: unknown): string {
    if (error instanceof HttpException) {
      return this.getHttpExceptionMessage(error);
    }

    return 'facebook_callback_failed';
  }

  private getHttpExceptionMessage(error: HttpException): string {
    const response = error.getResponse();
    if (typeof response === 'string') {
      return response;
    }

    if (response && typeof response === 'object' && 'message' in response) {
      const message = (response as { message?: string | string[] }).message;
      return Array.isArray(message) ? message[0] : (message ?? 'facebook_callback_failed');
    }

    return 'facebook_callback_failed';
  }
}
