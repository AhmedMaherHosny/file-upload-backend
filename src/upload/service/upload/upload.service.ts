import { Injectable } from '@nestjs/common';
import { createWriteStream, readFileSync, unlinkSync } from 'fs';

@Injectable()
export class UploadService {
  processFile(chunkPath: string, finalFilePath: string, startByte: number) {
    const fileContent = readFileSync(chunkPath);
    const writeStream = createWriteStream(finalFilePath, {
      flags: startByte === 0 ? 'w' : 'a',
    });
    writeStream.write(fileContent);
    writeStream.end();
    unlinkSync(chunkPath);
  }
}
