import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { DuplicateDetectorService } from './application/duplicate-detector.service';

@Module({
  providers: [AssetsService, DuplicateDetectorService],
  controllers: [AssetsController],
  exports: [AssetsService, DuplicateDetectorService],
})
export class AssetsModule {}
