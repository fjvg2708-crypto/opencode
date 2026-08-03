import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Escuta eventos de domínio que ainda não escrevem o seu próprio AuditLog
 * diretamente, garantindo rastreabilidade completa (secção 30) mesmo que um
 * módulo novo esqueça de o fazer explicitamente.
 */
@Injectable()
export class AuditListener {
  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('breakdown.reported')
  async onBreakdownReported(payload: { breakdownId: string; assetId: string; priority: string }) {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'Breakdown',
        entityId: payload.breakdownId,
        assetId: payload.assetId,
        action: 'CREATE',
        reason: `Prioridade: ${payload.priority}`,
        userId: 'system',
      },
    });
  }

  @OnEvent('maintenance.closed')
  async onMaintenanceClosed(payload: { orderId: string; assetId: string }) {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'MaintenanceOrder',
        entityId: payload.orderId,
        assetId: payload.assetId,
        action: 'CLOSE',
        userId: 'system',
      },
    });
  }
}
