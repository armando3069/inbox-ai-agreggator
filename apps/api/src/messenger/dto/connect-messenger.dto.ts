import { IsNotEmpty, IsString } from 'class-validator';

export class ConnectMessengerDto {
  /** Facebook Page ID (from Meta developer portal) */
  @IsString()
  @IsNotEmpty()
  pageId: string;

  /** Long-lived Page Access Token from Meta */
  @IsString()
  @IsNotEmpty()
  pageAccessToken: string;
}
