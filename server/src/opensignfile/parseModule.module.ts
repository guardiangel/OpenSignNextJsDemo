import { Module } from '@nestjs/common';
import { ParseController } from './parseController.controller';
import { ParseService } from './parseService.service';

@Module({
  controllers: [ParseController],
  providers: [ParseService],
})
export class ParseModule {}
