import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_PREFIX = 'enc:v1';

@Injectable()
export class TokenCryptoService {
  private readonly key: Buffer;

  constructor(private readonly config: ConfigService) {
    const rawKey = this.config.getOrThrow<string>('TOKENS_ENCRYPTION_KEY');
    this.key = this.parseKey(rawKey);
  }

  encrypt(plainText: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [
      ENCRYPTION_PREFIX,
      iv.toString('base64url'),
      authTag.toString('base64url'),
      encrypted.toString('base64url'),
    ].join(':');
  }

  decrypt(value: string): string {
    if (!this.isEncrypted(value)) {
      return value;
    }

    const [, , ivPart, authTagPart, encryptedPart] = value.split(':');
    if (!ivPart || !authTagPart || !encryptedPart) {
      throw new InternalServerErrorException('Stored token format is invalid');
    }

    try {
      const decipher = createDecipheriv(
        'aes-256-gcm',
        this.key,
        Buffer.from(ivPart, 'base64url'),
      );
      decipher.setAuthTag(Buffer.from(authTagPart, 'base64url'));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedPart, 'base64url')),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch {
      throw new InternalServerErrorException('Stored token could not be decrypted');
    }
  }

  isEncrypted(value: string): boolean {
    return value.startsWith(`${ENCRYPTION_PREFIX}:`);
  }

  private parseKey(rawKey: string): Buffer {
    const trimmed = rawKey.trim();
    const decoded =
      /^[0-9a-fA-F]{64}$/.test(trimmed)
        ? Buffer.from(trimmed, 'hex')
        : Buffer.from(trimmed, 'base64');

    if (decoded.length !== 32) {
      throw new InternalServerErrorException(
        'TOKENS_ENCRYPTION_KEY must decode to exactly 32 bytes',
      );
    }

    return decoded;
  }
}
