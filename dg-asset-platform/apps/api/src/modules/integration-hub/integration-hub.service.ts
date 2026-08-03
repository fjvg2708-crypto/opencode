import { BadRequestException, Injectable } from '@nestjs/common';
import { DataOwnership } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectorRegistryService } from './connector-registry.service';

@Injectable()
export class IntegrationHubService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: ConnectorRegistryService,
  ) {}

  // Conectores (configuração persistida; ativação real requer o conector
  // estar registado em código — ver ConnectorRegistryService).
  listConnectors() {
    return this.prisma.integrationConnector.findMany();
  }

  registeredConnectorNames() {
    return this.registry.list();
  }

  async testConnector(name: string) {
    if (!this.registry.has(name)) {
      return { ok: false, message: `Conector "${name}" ainda não foi implementado nesta instalação (Fase 1 sem conectores ativos).` };
    }
    return this.registry.get(name).test();
  }

  // Mapeamento de campos
  upsertFieldMapping(connectorName: string, entityType: string, internalField: string, externalField: string, direction: 'IN' | 'OUT' | 'BOTH') {
    return this.prisma.fieldMapping.upsert({
      where: { connectorName_entityType_internalField: { connectorName, entityType, internalField } },
      create: { connectorName, entityType, internalField, externalField, direction },
      update: { externalField, direction },
    });
  }

  listFieldMappings(connectorName: string, entityType?: string) {
    return this.prisma.fieldMapping.findMany({ where: { connectorName, ...(entityType ? { entityType } : {}) } });
  }

  // Propriedade dos dados (secção 33)
  setDataOwnership(entityType: string, ownership: DataOwnership) {
    return this.prisma.dataOwnershipRule.upsert({
      where: { entityType },
      create: { entityType, ownership },
      update: { ownership },
    });
  }

  listDataOwnership() {
    return this.prisma.dataOwnershipRule.findMany();
  }

  // Sincronização (Fase 2/3 — ligada apenas se existir um conector registado)
  async triggerSync(connectorName: string, entityType: string, direction: 'PULL' | 'PUSH') {
    if (!this.registry.has(connectorName)) {
      throw new BadRequestException(
        `Conector "${connectorName}" não está registado. A infraestrutura de sincronização está pronta mas nenhum conector externo foi ativado nesta fase.`,
      );
    }
    const connector = this.registry.get(connectorName);
    try {
      if (direction === 'PULL') {
        const result = await connector.pull(entityType);
        await this.prisma.syncLog.create({
          data: { connectorName, entityType, direction, status: 'SUCCESS', payload: result as any },
        });
        return result;
      }
      throw new BadRequestException('Push agregado não implementado no scaffold — usar push por registo.');
    } catch (err) {
      await this.prisma.syncLog.create({
        data: { connectorName, entityType, direction, status: 'ERROR', message: (err as Error).message },
      });
      throw err;
    }
  }

  listSyncLogs(connectorName?: string) {
    return this.prisma.syncLog.findMany({
      where: connectorName ? { connectorName } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
