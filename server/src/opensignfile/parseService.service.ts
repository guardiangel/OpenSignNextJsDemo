import { Injectable } from '@nestjs/common';
import * as Parse from 'parse/node';

@Injectable()
export class ParseService {
  async uploadFile(filename: string, buffer: Buffer, contentType: string) {
    try {
      const parseFile = new Parse.File(
        filename,
        { base64: buffer.toString('base64') },
        contentType,
      );
      await parseFile.save();

      return {
        url: parseFile.url(),
        name: parseFile.name(),
      };
    } catch (error) {
      throw new Error(`File upload failed: ${error}`);
    }
  }
}
