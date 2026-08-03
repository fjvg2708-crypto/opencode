import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MovementsService } from '../movements/movements.service';
import { BreakdownsService } from '../breakdowns/breakdowns.service';
import { SyncBatchDto, SyncOperationDto } from './dto/sync-batch.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

export interface SyncOperationResult {
  clientOperationId: string;
  status: 'APPLIED' | 'ALREADY_APPLIED' | 'ERROR';
  resultEntityId?: string;
  errorMessage?: string;
}

/**
 * Processa a fila de operações registadas offline (secção 24). Cada
 * operação é idempotente por `clientOperationId`: reenviar o mesmo lote (ex.
 * após uma falha de rede a meio) nunca duplica dados — devolve o resultado
 * já aplicado anteriormente. Conflitos (ex. ativo já noutro estado
 * incompatível) ficam registados com status CONFLICT para revisão manual,
 * nunca aplicados silenciosamente por cima de dados mais recentes.
 */
@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly movementsService: MovementsService,
    private readonly breakdownsService: BreakdownsService,
  ) {}

  async processBatch(dto: SyncBatchDto, user: AuthenticatedUser): Promise<SyncOperationResult[]> {
    const results: SyncOperationResult[] = [];
    for (const op of dto.operations) {
      results.push(await this.processOne(op, user));
    }
    return results;
  }

  private async processOne(op: SyncOperationDto, user: AuthenticatedUser): Promise<SyncOperationResult> {
    const existing = await this.prisma.syncOperation.findUnique({ where: { clientOperationId: op.clientOperationId } });
    if (existing && existing.status === 'APPLIED') {
      return { clientOperationId: op.clientOperationId, status: 'ALREADY_APPLIED', resultEntityId: existing.resultEntityId ?? undefined };
    }

    const record =
      existing ??
      (await this.prisma.syncOperation.create({
        data: {
          clientOperationId: op.clientOperationId,
          type: op.type,
          payload: op.payload as any,
          deviceId: op.deviceId,
          createdById: user.userId,
        },
      }));

    try {
      const resultEntityId = await this.dispatch(op, user);
      await this.prisma.syncOperation.update({
        where: { id: record.id },
        data: { status: 'APPLIED', resultEntityId, appliedAt: new Date() },
      });
      return { clientOperationId: op.clientOperationId, status: 'APPLIED', resultEntityId };
    } catch (err) {
      const message = (err as Error).message;
      this.logger.warn(`Operação offline ${op.clientOperationId} falhou: ${message}`);
      await this.prisma.syncOperation.update({ where: { id: record.id }, data: { status: 'ERROR', errorMessage: message } });
      return { clientOperationId: op.clientOperationId, status: 'ERROR', errorMessage: message };
    }
  }

  private async dispatch(op: SyncOperationDto, user: AuthenticatedUser): Promise<string> {
    switch (op.type) {
      case 'MOVEMENT': {
        const movement = await this.movementsService.create(
          { ...(op.payload as any), clientOperationId: op.clientOperationId },
          user,
        );
        return movement.id;
      }
      case 'BREAKDOWN': {
        const breakdown = await this.breakdownsService.report(op.payload as any, user);
        return breakdown.id;
      }
      case 'ASSET_READING': {
        const { assetId, odometerKm, hourMeter } = op.payload as { assetId: string; odometerKm?: number; hourMeter?: number };
        const updated = await this.prisma.asset.update({
          where: { id: assetId },
          data: { odometerKm, hourMeter },
        });
        return updated.id;
      }
      case 'QR_SCAN': {
        const { token } = op.payload as { token: string };
        await this.prisma.qrCodeEvent.create({
          data: { qrCode: { connect: { token } }, eventType: 'SCANNED', userId: user.userId },
        });
        return token;
      }
      default:
        throw new Error(`Tipo de operação offline desconhecido: ${op.type}`);
    }
  }

  status(clientOperationId: string) {
    return this.prisma.syncOperation.findUnique({ where: { clientOperationId } });
  }
}
