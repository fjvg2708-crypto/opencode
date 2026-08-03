import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface DuplicateCandidateInput {
  plate?: string | null;
  vin?: string | null;
  serialNumber?: string | null;
  externalCode?: string | null;
  manufacturerRef?: string | null;
  brand?: string | null;
  model?: string | null;
  yearOfManufacture?: number | null;
  excludeAssetId?: string;
}

export interface DuplicateMatch {
  assetId: string;
  internalCode: string;
  matchedBy: string[];
  score: number; // 0..1, 1 = certeza (chave exata)
}

/**
 * Deteção de duplicados (secção 11 do pedido). Chaves exatas (matrícula,
 * VIN, nº série, código externo) dão score 1 e bloqueiam sempre a criação
 * automática. Combinação marca+modelo+ano dá um score parcial que é
 * apresentado como aviso mas não bloqueia sozinho.
 */
@Injectable()
export class DuplicateDetectorService {
  constructor(private readonly prisma: PrismaService) {}

  async findCandidates(input: DuplicateCandidateInput): Promise<DuplicateMatch[]> {
    const exactOr: any[] = [];
    if (input.plate) exactOr.push({ plate: input.plate });
    if (input.vin) exactOr.push({ vin: input.vin });
    if (input.serialNumber) exactOr.push({ serialNumber: input.serialNumber });
    if (input.externalCode) exactOr.push({ externalCode: input.externalCode });
    if (input.manufacturerRef) exactOr.push({ manufacturerRef: input.manufacturerRef });

    const matches = new Map<string, DuplicateMatch>();

    if (exactOr.length > 0) {
      const exactHits = await this.prisma.asset.findMany({
        where: {
          deletedAt: null,
          OR: exactOr,
          ...(input.excludeAssetId ? { id: { not: input.excludeAssetId } } : {}),
        },
      });
      for (const hit of exactHits) {
        const reasons: string[] = [];
        if (input.plate && hit.plate === input.plate) reasons.push('plate');
        if (input.vin && hit.vin === input.vin) reasons.push('vin');
        if (input.serialNumber && hit.serialNumber === input.serialNumber) reasons.push('serialNumber');
        if (input.externalCode && hit.externalCode === input.externalCode) reasons.push('externalCode');
        if (input.manufacturerRef && hit.manufacturerRef === input.manufacturerRef) {
          reasons.push('manufacturerRef');
        }
        matches.set(hit.id, { assetId: hit.id, internalCode: hit.internalCode, matchedBy: reasons, score: 1 });
      }
    }

    if (input.brand && input.model) {
      const similar = await this.prisma.asset.findMany({
        where: {
          deletedAt: null,
          brand: input.brand,
          model: input.model,
          ...(input.yearOfManufacture ? { yearOfManufacture: input.yearOfManufacture } : {}),
          ...(input.excludeAssetId ? { id: { not: input.excludeAssetId } } : {}),
        },
        take: 10,
      });
      for (const hit of similar) {
        if (matches.has(hit.id)) continue;
        matches.set(hit.id, {
          assetId: hit.id,
          internalCode: hit.internalCode,
          matchedBy: ['brand+model+year'],
          score: 0.5,
        });
      }
    }

    return Array.from(matches.values()).sort((a, b) => b.score - a.score);
  }

  hasBlockingDuplicate(matches: DuplicateMatch[]): boolean {
    return matches.some((m) => m.score >= 1);
  }
}
