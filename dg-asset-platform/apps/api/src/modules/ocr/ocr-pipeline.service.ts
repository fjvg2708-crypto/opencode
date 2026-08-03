import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OCR_EXTRACTOR, OcrExtractor } from './domain/ocr-extractor.interface';

/**
 * Orquestra a extração de campos para uma foto/documento de um rascunho.
 * Hoje corre em-processo a partir de um listener de eventos (ver
 * ocr.listener.ts); em produção o mesmo `process()` deve ser invocado a
 * partir de um processor BullMQ (fila `ocr-jobs`) para não bloquear o
 * pedido HTTP de upload — a interface não muda.
 */
@Injectable()
export class OcrPipelineService {
  private readonly logger = new Logger(OcrPipelineService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(OCR_EXTRACTOR) private readonly extractor: OcrExtractor,
  ) {}

  async processPhoto(draftId: string, photoId: string, kind: string, storageKey: string) {
    await this.prisma.assetDraft.update({ where: { id: draftId }, data: { status: 'PROCESSING' } });
    try {
      const results = await this.extractor.extract({ storageKey, kind });
      for (const result of results) {
        await this.prisma.extractedField.create({
          data: {
            draftId,
            field: result.field,
            value: result.value,
            confidence: result.confidence,
            sourcePhotoId: photoId,
            status: 'PENDING',
          },
        });
      }
    } catch (err) {
      this.logger.error(`Falha na extração OCR do rascunho ${draftId}: ${(err as Error).message}`);
    } finally {
      await this.markPendingValidationIfReady(draftId);
    }
  }

  async processDocument(draftId: string, documentId: string, docType: string, storageKey: string) {
    try {
      const results = await this.extractor.extract({ storageKey, kind: docType });
      for (const result of results) {
        await this.prisma.extractedField.create({
          data: {
            draftId,
            field: result.field,
            value: result.value,
            confidence: result.confidence,
            sourceDocumentId: documentId,
            status: 'PENDING',
          },
        });
      }
    } finally {
      await this.markPendingValidationIfReady(draftId);
    }
  }

  private async markPendingValidationIfReady(draftId: string) {
    await this.prisma.assetDraft.update({ where: { id: draftId }, data: { status: 'PENDING_VALIDATION' } });
  }
}
