import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  findOpen(severity?: string) {
    return this.prisma.alert.findMany({
      where: { status: 'OPEN', ...(severity ? { severity } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  acknowledge(id: string) {
    return this.prisma.alert.update({ where: { id }, data: { status: 'ACKNOWLEDGED' } });
  }

  resolve(id: string) {
    return this.prisma.alert.update({ where: { id }, data: { status: 'RESOLVED', resolvedAt: new Date() } });
  }

  /** Varredura diária: revisões/seguros/IUC a expirar, equipamentos parados, ativos sem localização. */
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async runDailyScan() {
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const expiringInsurance = await this.prisma.vehicleDetail.findMany({
      where: { insuranceValidUntil: { lte: in30Days } },
    });
    for (const v of expiringInsurance) {
      await this.upsertAlert('INSURANCE_EXPIRING', 'HIGH', 'Asset', v.assetId, 'Seguro a expirar nos próximos 30 dias.');
    }

    const expiringInspection = await this.prisma.vehicleDetail.findMany({
      where: { nextInspectionDate: { lte: in30Days } },
    });
    for (const v of expiringInspection) {
      await this.upsertAlert('INSPECTION_DUE', 'NORMAL', 'Asset', v.assetId, 'Inspeção periódica a aproximar-se.');
    }

    const overdueMaintenance = await this.prisma.maintenanceOrder.findMany({
      where: { nextMaintenanceAt: { lte: new Date() }, status: { not: 'CLOSED' } },
    });
    for (const m of overdueMaintenance) {
      await this.upsertAlert('MAINTENANCE_OVERDUE', 'HIGH', 'Asset', m.assetId, 'Manutenção em atraso.');
    }
  }

  private async upsertAlert(type: string, severity: string, entityType: string, entityId: string, message: string) {
    const existing = await this.prisma.alert.findFirst({
      where: { type, entityType, entityId, status: 'OPEN' },
    });
    if (existing) return existing;
    return this.prisma.alert.create({ data: { type, severity, entityType, entityId, message } });
  }
}
