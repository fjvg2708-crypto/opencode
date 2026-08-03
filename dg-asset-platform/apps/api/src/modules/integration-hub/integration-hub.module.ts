import { Module } from '@nestjs/common';
import { IntegrationHubService } from './integration-hub.service';
import { IntegrationHubController } from './integration-hub.controller';
import { ConnectorRegistryService } from './connector-registry.service';

/**
 * Fase 2 do plano (ARCHITECTURE.md §11/§15): infraestrutura pronta,
 * nenhum conector ativo. O primeiro conector real (Fase 3) regista-se aqui
 * via `ConnectorRegistryService.register()` no seu próprio módulo,
 * importado neste módulo apenas quando existir.
 */
@Module({
  providers: [IntegrationHubService, ConnectorRegistryService],
  controllers: [IntegrationHubController],
  exports: [IntegrationHubService, ConnectorRegistryService],
})
export class IntegrationHubModule {}
