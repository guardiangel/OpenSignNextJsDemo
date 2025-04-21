import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '@/auth/decorators/public.decorator';
import { ParseService } from './parseService.service';

@Controller('parse')
@Public()
export class ParseController {
  constructor(private readonly parseService: ParseService) {}
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile() {}
}
