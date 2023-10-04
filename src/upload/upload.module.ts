import { Module } from '@nestjs/common';
import { UploadController } from './controller/upload/upload.controller';
import { UploadService } from './service/upload/upload.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
