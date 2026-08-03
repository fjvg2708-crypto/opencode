import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { generateInternalCode } from '../assets/domain/internal-code.util';
import {
  assertOrderCanClose,
  derivePartUsageReturnStatus,
  isExemptFromReturn,
  PartsNotAccountedForError,
} from './domain/part-return-policy';
import { AddPartUsageDto, CloseMaintenanceOrderDto, CreateMaintenanceOrderDto } from './dto/maintenance.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async create(dto: CreateMaintenanceOrderDto, user: AuthenticatedUser) {
    const asset = await this.prisma.asset.findFirst({ where: { id: dto.assetId, deletedAt: null } });
    if (!asset) throw new NotFoundException('Ativo não encontrado.');

    const order = await this.prisma.maintenanceOrder.create({
      data: {
        internalCode: generateInternalCode('OS'),
        assetId: dto.assetId,
        type: dto.type,
        reason: dto.reason,
        workshopId: dto.workshopId,
        mechanicName: dto.mechanicName,
        entryDate: dto.entryDate ? new Date(dto.entryDate) : undefined,
        status: 'REQUESTED',
        createdById: user.userId,
      },
    });

    await this.prisma.asset.update({ where: { id: dto.assetId }, data: { status: 'IN_MAINTENANCE' } });
    this.events.emit('maintenance.created', { orderId: order.id, assetId: dto.assetId });
    return order;
  }

  async addPartUsage(orderId: string, dto: AddPartUsageDto) {
    const order = await this.prisma.maintenanceOrder.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Ordem de serviço não encontrada.');
    if (order.status === 'CLOSED') throw new BadRequestException('Ordem de serviço já encerrada.');

    const article = dto.articleId ? await this.prisma.article.findUnique({ where: { id: dto.articleId } }) : null;
    const returnStatus = derivePartUsageReturnStatus(article, dto.returnStatus);

    return this.prisma.partUsage.create({
      data: {
        maintenanceOrderId: orderId,
        assetId: order.assetId,
        articleId: dto.articleId,
        reference: dto.reference,
        description: dto.description,
        quantity: dto.quantity ?? 1,
        reason: dto.reason,
        photoKey: dto.photoKey,
        conditionNotes: dto.conditionNotes,
        returnStatus,
        nonReturnReason: dto.nonReturnReason,
        receivedById: dto.receivedById,
        dgConfirmed: isExemptFromReturn(article),
      },
    });
  }

  async confirmPartReceived(partUsageId: string, receivedById: string) {
    return this.prisma.partUsage.update({
      where: { id: partUsageId },
      data: { dgConfirmed: true, receivedById },
    });
  }

  /**
   * Encerra a ordem de serviço. Bloqueia (regra obrigatória #9) se existir
   * qualquer PartUsage sem devolução/entrega contabilizada, exceto óleos e
   * filtros (regra obrigatória #10) — ver assertOrderCanClose.
   */
  async close(orderId: string, dto: CloseMaintenanceOrderDto, user: AuthenticatedUser) {
    const order = await this.prisma.maintenanceOrder.findUnique({
      where: { id: orderId },
      include: { partUsages: true },
    });
    if (!order) throw new NotFoundException('Ordem de serviço não encontrada.');

    try {
      assertOrderCanClose(order.partUsages);
    } catch (err) {
      if (err instanceof PartsNotAccountedForError) {
        throw new BadRequestException({ message: err.message, offendingPartUsageIds: err.offendingPartUsageIds });
      }
      throw err;
    }

    const closed = await this.prisma.maintenanceOrder.update({
      where: { id: orderId },
      data: {
        status: 'CLOSED',
        laborCost: dto.laborCost,
        partsCost: dto.partsCost,
        otherCosts: dto.otherCosts,
        exitDate: dto.exitDate ? new Date(dto.exitDate) : new Date(),
        nextMaintenanceAt: dto.nextMaintenanceAt ? new Date(dto.nextMaintenanceAt) : undefined,
        nextRevisionAt: dto.nextRevisionAt ? new Date(dto.nextRevisionAt) : undefined,
        approvedById: user.userId,
        approvedAt: new Date(),
        closedAt: new Date(),
      },
    });

    await this.prisma.asset.update({ where: { id: order.assetId }, data: { status: 'AVAILABLE' } });

    const totalCost = (dto.laborCost ?? 0) + (dto.partsCost ?? 0) + (dto.otherCosts ?? 0);
    if (totalCost > 0) {
      await this.prisma.costEntry.create({
        data: {
          assetId: order.assetId,
          category: 'MAINTENANCE',
          amount: totalCost,
          referenceId: order.id,
          incurredAt: closed.exitDate ?? new Date(),
        },
      });
    }

    this.events.emit('maintenance.closed', { orderId, assetId: order.assetId });
    return closed;
  }

  findByAsset(assetId: string) {
    return this.prisma.maintenanceOrder.findMany({
      where: { assetId },
      include: { partUsages: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneOrThrow(id: string) {
    const order = await this.prisma.maintenanceOrder.findUnique({
      where: { id },
      include: { partUsages: true, workshop: true },
    });
    if (!order) throw new NotFoundException('Ordem de serviço não encontrada.');
    return order;
  }
}
