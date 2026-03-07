import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { CORS_CONFIG } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'debug', 'warn', 'error'] });

  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,       // strip unknown properties from DTOs
      forbidNonWhitelisted: true,
      transform: true,       // auto-transform payloads to DTO class instances
    }),
  );

  app.enableCors(CORS_CONFIG);

  await app.listen(3001);
}

bootstrap();
