import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { PrismaService } from '../../prisma/prisma.service';
import { generateInternalCode, ASSET_TYPE_PREFIX } from '../assets/domain/internal-code.util';
import { DuplicateDetectorService } from '../assets/application/duplicate-detector.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

export type ImportableEntityType = 'assets' | 'works' | 'warehouses' | 'costCenters' | 'persons' | 'partners' | 'articles';

const REQUIRED_COLUMNS: Record<ImportableEntityType, string[]> = {
  assets: ['assetType', 'designation'],
  works: ['name'],
  warehouses: ['name'],
  costCenters: ['name'],
  persons: ['name'],
  partners: ['name', 'type'],
  articles: ['name'],
};

/**
 * Importação/exportação por CSV (secção 40): simulação obrigatória antes
 * de confirmar, deteção de erros por linha, deteção de duplicados (para
 * ativos), histórico e reversão. Modelos de referência ficam documentados
 * em REQUIRED_COLUMNS — o CSV pode ter colunas extra, que são ignoradas.
 */
@Injectable()
export class ImportExportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly duplicateDetector: DuplicateDetectorService,
  ) {}

  async simulate(entityType: ImportableEntityType, fileName: string, csvContent: string, user: AuthenticatedUser) {
    const rows: Record<string, string>[] = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
    const required = REQUIRED_COLUMNS[entityType];
    if (!required) throw new BadRequestException(`Tipo de entidade não suportado para importação: ${entityType}.`);

    const batch = await this.prisma.importBatch.create({
      data: { entityType, fileName, status: 'SIMULATED', totalRows: rows.length, createdById: user.userId },
    });

    let errorRows = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const missing = required.filter((col) => !row[col]);
      let status: 'OK' | 'ERROR' | 'DUPLICATE' = 'OK';
      let errorMessage: string | undefined;

      if (missing.length > 0) {
        status = 'ERROR';
        errorMessage = `Colunas obrigatórias em falta: ${missing.join(', ')}.`;
        errorRows++;
      } else if (entityType === 'assets') {
        const duplicates = await this.duplicateDetector.findCandidates({
          plate: row.plate,
          vin: row.vin,
          serialNumber: row.serialNumber,
        });
        if (this.duplicateDetector.hasBlockingDuplicate(duplicates)) {
          status = 'DUPLICATE';
          errorMessage = `Possível duplicado de: ${duplicates.map((d) => d.internalCode).join(', ')}.`;
          errorRows++;
        }
      }

      await this.prisma.importRow.create({
        data: { batchId: batch.id, rowNumber: i + 1, data: row, status, errorMessage },
      });
    }

    await this.prisma.importBatch.update({ where: { id: batch.id }, data: { errorRows } });
    return this.getBatchWithRows(batch.id);
  }

  async confirm(batchId: string, user: AuthenticatedUser) {
    const batch = await this.prisma.importBatch.findUnique({ where: { id: batchId }, include: { rows: true } });
    if (!batch) throw new NotFoundException('Lote de importação não encontrado.');
    if (batch.status !== 'SIMULATED') throw new BadRequestException('Este lote já foi confirmado ou revertido.');

    for (const row of batch.rows) {
      if (row.status === 'ERROR') continue;
      const data = row.data as Record<string, string>;
      const createdId = await this.createEntity(batch.entityType as ImportableEntityType, data, user);
      await this.prisma.importRow.update({ where: { id: row.id }, data: { createdEntityId: createdId } });
    }

    return this.prisma.importBatch.update({ where: { id: batchId }, data: { status: 'CONFIRMED' } });
  }

  async revert(batchId: string) {
    const batch = await this.prisma.importBatch.findUnique({ where: { id: batchId }, include: { rows: true } });
    if (!batch) throw new NotFoundException('Lote de importação não encontrado.');
    if (batch.status !== 'CONFIRMED') throw new BadRequestException('Só é possível reverter lotes confirmados.');

    for (const row of batch.rows) {
      if (!row.createdEntityId) continue;
      await this.softDeleteEntity(batch.entityType as ImportableEntityType, row.createdEntityId);
    }

    return this.prisma.importBatch.update({ where: { id: batchId }, data: { status: 'REVERTED' } });
  }

  getBatchWithRows(batchId: string) {
    return this.prisma.importBatch.findUnique({ where: { id: batchId }, include: { rows: true } });
  }

  listBatches() {
    return this.prisma.importBatch.findMany({ orderBy: { createdAt: 'desc' } });
  }

  private async createEntity(entityType: ImportableEntityType, data: Record<string, string>, user: AuthenticatedUser): Promise<string> {
    switch (entityType) {
      case 'assets': {
        const asset = await this.prisma.asset.create({
          data: {
            assetType: data.assetType as any,
            designation: data.designation,
            brand: data.brand,
            model: data.model,
            plate: data.plate,
            vin: data.vin,
            serialNumber: data.serialNumber,
            internalCode: generateInternalCode(ASSET_TYPE_PREFIX[data.assetType] ?? 'AT'),
            status: 'DRAFT',
            sourceSystem: 'INTERNAL',
            createdById: user.userId,
          },
        });
        return asset.id;
      }
      case 'works':
        return (await this.prisma.work.create({ data: { name: data.name, client: data.client, internalCode: generateInternalCode('OB') } })).id;
      case 'warehouses':
        return (await this.prisma.warehouse.create({ data: { name: data.name, address: data.address, internalCode: generateInternalCode('AR') } })).id;
      case 'costCenters':
        return (await this.prisma.costCenter.create({ data: { name: data.name, internalCode: generateInternalCode('CC') } })).id;
      case 'persons':
        return (await this.prisma.person.create({ data: { name: data.name, email: data.email, internalCode: generateInternalCode('COL') } })).id;
      case 'partners':
        return (await this.prisma.partner.create({ data: { name: data.name, type: data.type as any, internalCode: generateInternalCode('PT') } })).id;
      case 'articles':
        return (await this.prisma.article.create({ data: { name: data.name, family: data.family, internalCode: generateInternalCode('ART') } })).id;
      default:
        throw new BadRequestException(`Tipo de entidade não suportado: ${entityType}.`);
    }
  }

  private async softDeleteEntity(entityType: ImportableEntityType, id: string): Promise<void> {
    const deletedAt = new Date();
    switch (entityType) {
      case 'assets':
        await this.prisma.asset.update({ where: { id }, data: { deletedAt } });
        return;
      case 'works':
        await this.prisma.work.update({ where: { id }, data: { deletedAt } });
        return;
      case 'warehouses':
        await this.prisma.warehouse.update({ where: { id }, data: { deletedAt } });
        return;
      case 'persons':
        await this.prisma.person.update({ where: { id }, data: { deletedAt } });
        return;
      case 'partners':
        await this.prisma.partner.update({ where: { id }, data: { deletedAt } });
        return;
      case 'articles':
        await this.prisma.article.update({ where: { id }, data: { deletedAt } });
        return;
      case 'costCenters':
        // CostCenter não tem soft delete no schema (sem histórico financeiro a reverter); ignorado.
        return;
    }
  }

  async exportAssetsCsv(): Promise<string> {
    const assets = await this.prisma.asset.findMany({ where: { deletedAt: null } });
    return stringify(
      assets.map((a) => ({
        internalCode: a.internalCode,
        assetType: a.assetType,
        designation: a.designation,
        brand: a.brand,
        model: a.model,
        plate: a.plate,
        vin: a.vin,
        serialNumber: a.serialNumber,
        status: a.status,
      })),
      { header: true },
    );
  }
}
