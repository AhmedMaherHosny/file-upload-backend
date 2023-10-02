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
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
} from 'fs';

@Controller('upload')
export class UploadController {
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploaded_chunks',
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const randomName = uuidv4();
          const extension = extname(file.originalname);
          const uniqueName = `${timestamp}_${randomName}${extension}`;
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
    if (!contentRange) {
      throw new BadRequestException('Content-Range header is missing');
    }
    const matches = contentRange.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
    if (!matches) {
      throw new BadRequestException('Invalid Content-Range header format');
    }
    const startByte = parseInt(matches[1]);
    const endByte = parseInt(matches[2]);
    const totalBytes = parseInt(matches[3]);
    const filePath = file.path;
    console.log(filePath);
    const fileStream = createWriteStream(filePath, { flags: 'a' });

    req.pipe(fileStream);

    if (endByte === totalBytes - 1) {
      fileStream.end();
      const chunksDirectory = './uploaded_chunks';
      const assembledFilesDirectory = './uploaded_files';
      const assembledFilePath = join(
        assembledFilesDirectory,
        file.originalname,
      );
      if (!existsSync(assembledFilesDirectory)) {
        mkdirSync(assembledFilesDirectory);
      }
      const assembledFileStream = createWriteStream(assembledFilePath);
      const files = readdirSync(chunksDirectory);
      files.sort((a, b) => {
        const timestampA = parseInt(a.split('_')[0]);
        const timestampB = parseInt(b.split('_')[0]);
        return timestampA - timestampB;
      });
      console.log(files);

      for (const fileName of files) {
        const chunkFilePath = join(chunksDirectory, fileName);
        const chunkReadStream = createReadStream(chunkFilePath);
        await new Promise((resolve) => {
          chunkReadStream.on('end', resolve);
          chunkReadStream.pipe(assembledFileStream, { end: false });
        });
        chunkReadStream.close();
      }

      assembledFileStream.end();

      for (const fileName of files) {
        const chunkFilePath = join(chunksDirectory, fileName);
        unlinkSync(chunkFilePath);
      }
    }
    res.status(HttpStatus.PARTIAL_CONTENT).json({
      message: 'Partial upload successful',
      startByte,
      endByte,
    });
  }
}
