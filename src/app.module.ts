import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [RedisModule, UploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
