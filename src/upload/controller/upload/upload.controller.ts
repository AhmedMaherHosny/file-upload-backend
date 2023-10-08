import {
  BadRequestException,
  Controller,
  Header,
  HttpStatus,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { RedisService } from 'src/redis/service/redis/redis.service';
import { Constant } from 'utils/Constant';
import { UploadService } from '../../service/upload/upload.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly redisService: RedisService,
    private readonly uploadService: UploadService,
  ) {}
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploaded_files',
        filename: (req, file, cb) => {
          const fileId = uuidv4();
          const extension = extname(file.originalname);
          const uniqueName = `${fileId}${extension}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  @Header('Accept-Ranges', 'bytes')
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const contentRange = req.header('Content-Range');
    const fileIdentifier = req.header('X-File-Identifier');

    if (!contentRange) {
      throw new BadRequestException('Content-Range header is missing');
    }
    const matches = contentRange.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
    if (!matches) {
      throw new BadRequestException('Invalid Content-Range header format');
    }
    if (!fileIdentifier) {
      throw new BadRequestException('X-File-Identifier header is missing');
    }
    const isfileIdentifierExists = await this.redisService.isKeyExist(
      Constant.FILE_PATH_MAPPING_KEY,
      fileIdentifier,
    );
    const startByte = parseInt(matches[1]);
    const endByte = parseInt(matches[2]);
    const totalBytes = parseInt(matches[3]);
    let filePath = file.path;
    if (isfileIdentifierExists) {
      filePath = await this.redisService.getHashItem(
        Constant.FILE_PATH_MAPPING_KEY,
        fileIdentifier,
      );
    } else {
      await this.redisService.setHashItem(
        Constant.FILE_PATH_MAPPING_KEY,
        fileIdentifier,
        filePath,
      );
    }

    this.uploadService.processFile(req.file.path, filePath, startByte);

    if (endByte + 1 === totalBytes) {
      await this.redisService.removeHashItem(
        Constant.FILE_PATH_MAPPING_KEY,
        fileIdentifier,
      );
    }

    res.status(HttpStatus.PARTIAL_CONTENT).json({
      message: 'Partial upload successful',
      startByte,
      endByte,
    });
  }
}
