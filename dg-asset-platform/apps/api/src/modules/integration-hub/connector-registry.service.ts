import { Injectable, NotFoundException } from '@nestjs/common';
import { Connector } from './domain/connector.interface';

/**
 * Registo em memória dos conectores disponíveis. Vazio por omissão na
 * Fase 1 (secção 41: "área pode apresentar a infraestrutura preparada, sem
 * conectores ativos"). Um conector real regista-se aqui a partir do seu
 * próprio módulo (`providers: [{ provide: APP_CONNECTOR, ... }]`), sem
 * tocar nesta classe nem nos módulos de negócio.
 */
@Injectable()
export class ConnectorRegistryService {
  private readonly connectors = new Map<string, Connector>();

  register(connector: Connector): void {
    this.connectors.set(connector.name, connector);
  }

  list(): string[] {
    return Array.from(this.connectors.keys());
  }

  get(name: string): Connector {
    const connector = this.connectors.get(name);
    if (!connector) throw new NotFoundException(`Conector "${name}" não está registado.`);
    return connector;
  }

  has(name: string): boolean {
    return this.connectors.has(name);
  }
}
