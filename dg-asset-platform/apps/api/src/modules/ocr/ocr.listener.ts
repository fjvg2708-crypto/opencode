import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { OcrPipelineService } from './ocr-pipeline.service';

@Injectable()
export class OcrListener {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pipeline: OcrPipelineService,
  ) {}

  @OnEvent('asset-draft.photo-added')
  async onPhotoAdded(payload: { draftId: string; photoId: string; kind: string }) {
    const photo = await this.prisma.draftPhoto.findUnique({ where: { id: payload.photoId } });
    if (!photo) return;
    await this.pipeline.processPhoto(payload.draftId, payload.photoId, payload.kind, photo.storageKey);
  }

  @OnEvent('asset-draft.document-added')
  async onDocumentAdded(payload: { draftId: string; documentId: string; docType: string }) {
    const document = await this.prisma.draftDocument.findUnique({ where: { id: payload.documentId } });
    if (!document) return;
    await this.pipeline.processDocument(payload.draftId, payload.documentId, payload.docType, document.storageKey);
  }
}
