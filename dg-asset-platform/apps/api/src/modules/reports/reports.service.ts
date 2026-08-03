import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async fleetStatusSummary() {
    const grouped = await this.prisma.asset.groupBy({
      by: ['assetType', 'status'],
      _count: { _all: true },
      where: { deletedAt: null },
    });
    return grouped.map((g) => ({ assetType: g.assetType, status: g.status, count: g._count._all }));
  }

  async costsByAsset(from?: Date, to?: Date) {
    const grouped = await this.prisma.costEntry.groupBy({
      by: ['assetId', 'category'],
      _sum: { amount: true },
      where: { incurredAt: { gte: from, lte: to } },
    });
    return grouped.map((g) => ({ assetId: g.assetId, category: g.category, total: g._sum.amount }));
  }

  async costsByWork(from?: Date, to?: Date) {
    const rows = await this.prisma.costEntry.findMany({
      where: { incurredAt: { gte: from, lte: to } },
      include: { asset: { select: { workId: true } } },
    });
    const totals = new Map<string, number>();
    for (const row of rows) {
      const key = row.asset.workId ?? 'SEM_OBRA';
      totals.set(key, (totals.get(key) ?? 0) + Number(row.amount));
    }
    return Array.from(totals.entries()).map(([workId, total]) => ({ workId, total }));
  }

  async openBreakdownsSummary() {
    const grouped = await this.prisma.breakdown.groupBy({
      by: ['priority', 'status'],
      _count: { _all: true },
      where: { status: { notIn: ['RESOLVED', 'CLOSED', 'REJECTED'] } },
    });
    return grouped.map((g) => ({ priority: g.priority, status: g.status, count: g._count._all }));
  }

  async partsNotReturnedSummary() {
    const rows = await this.prisma.partUsage.findMany({
      where: { returnStatus: { in: ['NOT_RETURNED_JUSTIFIED'] } },
      include: { asset: { select: { internalCode: true, designation: true } } },
    });
    return rows.map((r) => ({
      assetCode: r.asset.internalCode,
      assetDesignation: r.asset.designation,
      description: r.description,
      nonReturnReason: r.nonReturnReason,
    }));
  }

  /** Relatório mensal para a Direção (secção 28) — agregado, pronto a exportar. */
  async monthlyDirectionReport(year: number, month: number) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0, 23, 59, 59);

    const [fleetSummary, costs, breakdowns, expiringDocs, overdueMaintenance] = await Promise.all([
      this.fleetStatusSummary(),
      this.costsByAsset(from, to),
      this.openBreakdownsSummary(),
      this.prisma.document.findMany({ where: { expiryDate: { gte: from, lte: to } } }),
      this.prisma.maintenanceOrder.findMany({ where: { nextMaintenanceAt: { lte: to }, status: { not: 'CLOSED' } } }),
    ]);

    return {
      period: { year, month },
      fleetSummary,
      costs,
      openBreakdowns: breakdowns,
      documentsExpiring: expiringDocs,
      maintenanceOverdue: overdueMaintenance,
      generatedAt: new Date().toISOString(),
    };
  }
}
