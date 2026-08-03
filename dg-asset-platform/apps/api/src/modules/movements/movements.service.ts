import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MovementStatus, MovementType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMovementDto, ConfirmReturnDto } from './dto/create-movement.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class MovementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  /**
   * Cria um movimento (entrega/devolução/transferência — secção 12).
   * Idempotente por `clientOperationId`: reenvios da fila offline (secção
   * 24) não criam duplicados.
   */
  async create(dto: CreateMovementDto, user: AuthenticatedUser) {
    if (dto.clientOperationId) {
      const existing = await this.prisma.movement.findUnique({ where: { clientOperationId: dto.clientOperationId } });
      if (existing) return existing;
    }

    const asset = await this.prisma.asset.findFirst({ where: { id: dto.assetId, deletedAt: null } });
    if (!asset) throw new NotFoundException('Ativo não encontrado.');

    const movement = await this.prisma.movement.create({
      data: {
        assetId: dto.assetId,
        type: dto.type,
        status: 'CONFIRMED',
        fromPersonId: asset.responsibleId ?? undefined,
        toPersonId: dto.toPersonId,
        fromWarehouseId: asset.warehouseId ?? undefined,
        toWarehouseId: dto.toWarehouseId,
        workId: dto.workId,
        expectedReturnAt: dto.expectedReturnAt ? new Date(dto.expectedReturnAt) : undefined,
        confirmedAt: new Date(),
        gpsLat: dto.gpsLat,
        gpsLng: dto.gpsLng,
        signatureKey: dto.signatureKey,
        photos: dto.photos as any,
        observations: dto.observations,
        clientOperationId: dto.clientOperationId,
        createdById: user.userId,
      },
    });

    await this.applyToAsset(dto.assetId, dto, movement.id);
    await this.writeAudit(dto.assetId, dto.type, user, movement.id);
    this.events.emit('movement.created', { movementId: movement.id, assetId: dto.assetId, type: dto.type });
    return movement;
  }

  private async applyToAsset(
    assetId: string,
    dto: CreateMovementDto,
    movementId: string,
  ) {
    const statusByType: Partial<Record<MovementType, string>> = {
      DELIVERY: 'IN_USE',
      TRANSFER_WORK: 'IN_TRANSIT',
      TRANSFER_WAREHOUSE: 'IN_TRANSIT',
      RESERVATION: 'RESERVED',
      RETURN: 'AVAILABLE',
      RESPONSIBLE_CHANGE: 'IN_USE',
    };

    await this.prisma.asset.update({
      where: { id: assetId },
      data: {
        responsibleId: dto.type === 'RETURN' ? null : dto.toPersonId,
        warehouseId: dto.toWarehouseId ?? undefined,
        workId: dto.workId ?? undefined,
        status: (statusByType[dto.type] as any) ?? undefined,
      },
    });
    void movementId;
  }

  async confirmReturn(movementId: string, dto: ConfirmReturnDto, user: AuthenticatedUser) {
    const movement = await this.prisma.movement.findUnique({ where: { id: movementId } });
    if (!movement) throw new NotFoundException('Movimento não encontrado.');

    const updated = await this.prisma.movement.update({
      where: { id: movementId },
      data: { status: dto.status as MovementStatus, observations: dto.observations, photos: dto.photos as any },
    });

    if (dto.status === 'LOST') {
      await this.prisma.asset.update({ where: { id: movement.assetId }, data: { status: 'LOST' } });
    } else if (dto.status === 'CONFIRMED') {
      await this.prisma.asset.update({ where: { id: movement.assetId }, data: { status: 'AVAILABLE' } });
    }

    await this.writeAudit(movement.assetId, `RETURN_${dto.status}`, user, movementId);
    return updated;
  }

  findByAsset(assetId: string) {
    return this.prisma.movement.findMany({ where: { assetId }, orderBy: { createdAt: 'desc' } });
  }

  findPending() {
    return this.prisma.movement.findMany({
      where: { status: 'PENDING' },
      orderBy: { expectedReturnAt: 'asc' },
    });
  }

  private async writeAudit(assetId: string, action: string, user: AuthenticatedUser, movementId: string) {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'Movement',
        entityId: movementId,
        assetId,
        action,
        userId: user.userId,
      },
    });
  }
}
