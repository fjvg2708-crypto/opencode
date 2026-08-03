import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { generateInternalCode } from '../assets/domain/internal-code.util';
import { ReportBreakdownDto, UpdateBreakdownStatusDto } from './dto/breakdown.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

const CLOSED_STATUSES = ['RESOLVED', 'CLOSED', 'REJECTED'];

@Injectable()
export class BreakdownsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async report(dto: ReportBreakdownDto, user: AuthenticatedUser) {
    const breakdown = await this.prisma.breakdown.create({
      data: {
        internalCode: generateInternalCode('AV'),
        assetId: dto.assetId,
        workId: dto.workId,
        priority: dto.priority,
        description: dto.description,
        photos: dto.photos as any,
        videoKey: dto.videoKey,
        usableWhileBroken: dto.usableWhileBroken,
        safetyRisk: dto.safetyRisk ?? false,
        immediateAction: dto.immediateAction,
        reportedById: user.userId,
        status: 'REPORTED',
      },
    });

    if (!dto.usableWhileBroken || dto.priority === 'CRITICAL' || dto.priority === 'URGENT') {
      await this.prisma.asset.update({ where: { id: dto.assetId }, data: { status: 'BROKEN' } });
    }

    if (dto.priority === 'CRITICAL' || dto.safetyRisk) {
      await this.prisma.alert.create({
        data: {
          type: 'BREAKDOWN_CRITICAL',
          severity: 'CRITICAL',
          entityType: 'Breakdown',
          entityId: breakdown.id,
          message: `Avaria crítica/risco de segurança reportada em ${dto.assetId}.`,
        },
      });
    }

    this.events.emit('breakdown.reported', { breakdownId: breakdown.id, assetId: dto.assetId, priority: dto.priority });
    return breakdown;
  }

  async updateStatus(id: string, dto: UpdateBreakdownStatusDto) {
    const breakdown = await this.prisma.breakdown.findUnique({ where: { id } });
    if (!breakdown) throw new NotFoundException('Avaria não encontrada.');

    const updated = await this.prisma.breakdown.update({
      where: { id },
      data: {
        status: dto.status,
        assignedToId: dto.assignedToId,
        resolvedAt: CLOSED_STATUSES.includes(dto.status) ? new Date() : undefined,
      },
    });

    if (dto.status === 'RESOLVED' || dto.status === 'CLOSED') {
      const stillBroken = await this.prisma.breakdown.count({
        where: { assetId: breakdown.assetId, status: { notIn: CLOSED_STATUSES } },
      });
      if (stillBroken === 0) {
        await this.prisma.asset.update({ where: { id: breakdown.assetId }, data: { status: 'AVAILABLE' } });
      }
    }

    return updated;
  }

  findByAsset(assetId: string) {
    return this.prisma.breakdown.findMany({ where: { assetId }, orderBy: { reportedAt: 'desc' } });
  }

  findOpen() {
    return this.prisma.breakdown.findMany({
      where: { status: { notIn: CLOSED_STATUSES } },
      orderBy: [{ priority: 'desc' }, { reportedAt: 'asc' }],
    });
  }
}
