import { Module } from '@nestjs/common';
import { TokenCryptoService } from './token-crypto.service';

@Module({
  providers: [TokenCryptoService],
  exports: [TokenCryptoService],
})
export class TokenCryptoModule {}
