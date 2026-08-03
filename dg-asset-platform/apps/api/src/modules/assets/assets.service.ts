import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssetStatus, AssetType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { generateInternalCode, ASSET_TYPE_PREFIX } from './domain/internal-code.util';
import { assertValidTransition } from './domain/asset-status.state-machine';
import { checkRequiredFields } from './domain/required-fields.util';
import { DuplicateDetectorService } from './application/duplicate-detector.service';
import { AddDraftDocumentDto, AddDraftPhotoDto, CreateAssetDraftDto, ReviewExtractedFieldDto } from './dto/asset-draft.dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly duplicateDetector: DuplicateDetectorService,
    private readonly events: EventEmitter2,
  ) {}

  // ── Wizard de criação assistida (secção 3) ─────────────────────────────

  createDraft(dto: CreateAssetDraftDto, user: AuthenticatedUser) {
    return this.prisma.assetDraft.create({
      data: { assetType: dto.assetType, category: dto.category, createdById: user.userId, status: 'PROCESSING' },
    });
  }

  async addPhoto(draftId: string, dto: AddDraftPhotoDto) {
    await this.getDraftOrThrow(draftId);
    const photo = await this.prisma.draftPhoto.create({ data: { draftId, ...dto } });
    this.events.emit('asset-draft.photo-added', { draftId, photoId: photo.id, kind: dto.kind });
    return photo;
  }

  async addDocument(draftId: string, dto: AddDraftDocumentDto) {
    await this.getDraftOrThrow(draftId);
    const document = await this.prisma.draftDocument.create({ data: { draftId, ...dto } });
    this.events.emit('asset-draft.document-added', { draftId, documentId: document.id, docType: dto.docType });
    return document;
  }

  async getDraftOrThrow(draftId: string) {
    const draft = await this.prisma.assetDraft.findUnique({
      where: { id: draftId },
      include: { photos: true, documents: true, extractedFields: true },
    });
    if (!draft) throw new NotFoundException('Rascunho não encontrado.');
    return draft;
  }

  async reviewExtractedField(fieldId: string, dto: ReviewExtractedFieldDto, user: AuthenticatedUser) {
    const field = await this.prisma.extractedField.findUnique({ where: { id: fieldId } });
    if (!field) throw new NotFoundException('Campo extraído não encontrado.');
    return this.prisma.extractedField.update({
      where: { id: fieldId },
      data: {
        status: dto.decision,
        correctedValue: dto.decision === 'CORRECTED' ? dto.correctedValue : null,
        validatedById: user.userId,
        validatedAt: new Date(),
      },
    });
  }

  /** Verifica duplicados prováveis sobre um rascunho, usando os campos já confirmados/corrigidos. */
  async checkDraftDuplicates(draftId: string) {
    const draft = await this.getDraftOrThrow(draftId);
    const value = (field: string) => {
      const f = draft.extractedFields.find((ef) => ef.field === field && ef.status !== 'REJECTED');
      return f ? (f.status === 'CORRECTED' ? f.correctedValue : f.value) : undefined;
    };
    return this.duplicateDetector.findCandidates({
      plate: value('plate'),
      vin: value('vin'),
      serialNumber: value('serialNumber'),
      brand: value('brand'),
      model: value('model'),
    });
  }

  // ── Criação definitiva (secção 3.6) ─────────────────────────────────────

  async createAsset(dto: CreateAssetDto, user: AuthenticatedUser) {
    const duplicates = await this.duplicateDetector.findCandidates({
      plate: dto.plate,
      vin: dto.vin,
      serialNumber: dto.serialNumber,
      manufacturerRef: dto.manufacturerRef,
      brand: dto.brand,
      model: dto.model,
      yearOfManufacture: dto.yearOfManufacture,
    });
    if (this.duplicateDetector.hasBlockingDuplicate(duplicates)) {
      throw new ConflictException({
        message: 'Possível ativo duplicado detetado. Reveja antes de continuar.',
        duplicates,
      });
    }

    const { complete, missing } = checkRequiredFields(dto.assetType, dto as unknown as Record<string, unknown>);

    const asset = await this.prisma.asset.create({
      data: {
        assetType: dto.assetType,
        category: dto.category,
        subcategory: dto.subcategory,
        designation: dto.designation,
        description: dto.description,
        brand: dto.brand,
        model: dto.model,
        serialNumber: dto.serialNumber,
        plate: dto.plate,
        vin: dto.vin,
        manufacturerRef: dto.manufacturerRef,
        yearOfManufacture: dto.yearOfManufacture,
        workId: dto.workId,
        warehouseId: dto.warehouseId,
        responsibleId: dto.responsibleId,
        costCenterId: dto.costCenterId,
        internalCode: generateInternalCode(ASSET_TYPE_PREFIX[dto.assetType] ?? 'AT'),
        status: complete ? 'PENDING_VALIDATION' : 'DRAFT',
        createdById: user.userId,
      },
    });

    if (dto.sourceDraftId) {
      await this.prisma.assetDraft.update({
        where: { id: dto.sourceDraftId },
        data: { status: 'CONVERTED', convertedAssetId: asset.id },
      });
    }

    await this.writeAudit(asset.id, 'CREATE', user, null, asset, missing.length ? `Campos em falta: ${missing.join(', ')}` : undefined);
    this.events.emit('asset.created', { assetId: asset.id, assetType: asset.assetType });
    return asset;
  }

  // ── Consulta / atualização de estado ────────────────────────────────────

  findAll(filters: { assetType?: AssetType; status?: AssetStatus; workId?: string; warehouseId?: string }) {
    return this.prisma.asset.findMany({
      where: { deletedAt: null, ...filters },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneOrThrow(id: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, deletedAt: null },
      include: {
        photos: true,
        documents: true,
        qrCodes: { where: { active: true } },
        vehicleDetail: true,
        equipmentDetail: true,
      },
    });
    if (!asset) throw new NotFoundException('Ativo não encontrado.');
    return asset;
  }

  async updateStatus(id: string, newStatus: AssetStatus, reason: string | undefined, user: AuthenticatedUser) {
    const asset = await this.findOneOrThrow(id);
    assertValidTransition(asset.status, newStatus);

    const updated = await this.prisma.asset.update({ where: { id }, data: { status: newStatus } });
    await this.writeAudit(id, 'UPDATE', user, { status: asset.status }, { status: newStatus }, reason);
    this.events.emit('asset.status-changed', { assetId: id, from: asset.status, to: newStatus });
    return updated;
  }

  async validate(id: string, user: AuthenticatedUser) {
    const asset = await this.findOneOrThrow(id);
    const { complete, missing } = checkRequiredFields(asset.assetType, asset as unknown as Record<string, unknown>);
    if (!complete) {
      throw new BadRequestException({ message: 'Não é possível validar: campos obrigatórios em falta.', missing });
    }
    return this.updateStatus(id, 'VALIDATED', 'Validação humana concluída.', user);
  }

  private async writeAudit(
    assetId: string,
    action: string,
    user: AuthenticatedUser,
    before: unknown,
    after: unknown,
    reason?: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'Asset',
        entityId: assetId,
        assetId,
        action,
        beforeState: before ?? undefined,
        afterState: after ?? undefined,
        reason,
        userId: user.userId,
      },
    });
  }
}
