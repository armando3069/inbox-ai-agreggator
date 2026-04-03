import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { URLSearchParams } from 'url';
import type { FacebookPageOption } from './facebook.types';

interface FacebookApiError {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
  };
}

interface FacebookPagesResponse extends FacebookApiError {
  data?: Array<{
    id?: string;
    name?: string;
    access_token?: string;
    category?: string;
  }>;
}

@Injectable()
export class FacebookGraphClient {
  private readonly graphVersion: string;
  private readonly graphBase: string;
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly redirectUri: string;

  constructor(private readonly config: ConfigService) {
    this.graphVersion = this.config.get<string>('FACEBOOK_GRAPH_VERSION') ?? 'v22.0';
    this.graphBase = `https://graph.facebook.com/${this.graphVersion}`;
    this.appId = this.config.getOrThrow<string>('FACEBOOK_APP_ID');
    this.appSecret = this.config.getOrThrow<string>('FACEBOOK_APP_SECRET');
    this.redirectUri = this.config.getOrThrow<string>('FACEBOOK_REDIRECT_URI');
  }

  buildOAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: [
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_metadata',
        'pages_messaging',
      ].join(','),
      state,
    });

    return `https://www.facebook.com/${this.graphVersion}/dialog/oauth?${params.toString()}`;
  }

  async exchangeCodeForUserAccessToken(code: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.appId,
      client_secret: this.appSecret,
      redirect_uri: this.redirectUri,
      code,
    });

    const response = await fetch(`${this.graphBase}/oauth/access_token?${params.toString()}`);
    const payload = (await response.json().catch(() => ({}))) as
      | FacebookApiError
      | { access_token?: string };

    if (!response.ok || !('access_token' in payload) || !payload.access_token) {
      const message = this.mapOAuthError(payload);
      throw new BadRequestException(message);
    }

    return payload.access_token;
  }

  async fetchManagedPages(userAccessToken: string): Promise<FacebookPageOption[]> {
    const params = new URLSearchParams({
      fields: 'id,name,access_token,category',
      access_token: userAccessToken,
      limit: '100',
    });

    const response = await fetch(`${this.graphBase}/me/accounts?${params.toString()}`);
    const payload = (await response.json().catch(() => ({}))) as FacebookPagesResponse;

    if (!response.ok) {
      throw new BadGatewayException(this.mapGraphError(payload));
    }

    const pages = Array.isArray(payload.data) ? payload.data : [];

    return pages
      .filter((page) => page.id && page.name)
      .map((page) => ({
        pageId: page.id!,
        pageName: page.name!,
        pageAccessToken: page.access_token ?? '' ,
        category: page.category ?? null,
      }));
  }

  private mapOAuthError(payload: FacebookApiError | { access_token?: string }): string {
    if (!('error' in payload) || !payload.error) {
      return 'Facebook OAuth failed';
    }

    const code = payload.error.code;
    const subcode = payload.error.error_subcode;

    if (code === 100 && subcode === 36007) {
      return 'Facebook authorization code expired';
    }

    return payload.error.message ?? 'Facebook OAuth failed';
  }

  private mapGraphError(payload: FacebookPagesResponse): string {
    return payload.error?.message ?? 'Facebook Graph API request failed';
  }
}
