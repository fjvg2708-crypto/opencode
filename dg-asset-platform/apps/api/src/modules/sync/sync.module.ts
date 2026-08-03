import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { MovementsModule } from '../movements/movements.module';
import { BreakdownsModule } from '../breakdowns/breakdowns.module';

@Module({
  imports: [MovementsModule, BreakdownsModule],
  providers: [SyncService],
  controllers: [SyncController],
})
export class SyncModule {}
