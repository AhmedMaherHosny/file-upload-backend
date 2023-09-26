import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger();
  app.setGlobalPrefix('api');
  await app.listen(3000, '192.168.1.14');
  logger.log(`server running on : http://192.168.1.14:3000`);
}
bootstrap();
