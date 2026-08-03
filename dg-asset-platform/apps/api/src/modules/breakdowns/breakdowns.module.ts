import { Module } from '@nestjs/common';
import { BreakdownsService } from './breakdowns.service';
import { BreakdownsController } from './breakdowns.controller';

@Module({
  providers: [BreakdownsService],
  controllers: [BreakdownsController],
  exports: [BreakdownsService],
})
export class BreakdownsModule {}
