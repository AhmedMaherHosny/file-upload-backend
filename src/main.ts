import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(3000, '192.168.1.55');
  Logger.log(`server running on : http://192.168.1.55:3000`);
}
bootstrap();
