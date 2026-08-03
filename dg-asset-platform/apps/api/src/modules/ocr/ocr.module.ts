import { Module } from '@nestjs/common';
import { OcrPipelineService } from './ocr-pipeline.service';
import { OcrListener } from './ocr.listener';
import { MockExtractor } from './infrastructure/mock-extractor.service';
import { OCR_EXTRACTOR } from './domain/ocr-extractor.interface';

@Module({
  providers: [
    OcrPipelineService,
    OcrListener,
    MockExtractor,
    // Ponto único de troca do motor de OCR/IA — ver ARCHITECTURE.md §6.
    { provide: OCR_EXTRACTOR, useClass: MockExtractor },
  ],
  exports: [OcrPipelineService],
})
export class OcrModule {}
