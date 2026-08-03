import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataOwnership } from '@prisma/client';
import { IntegrationHubService } from './integration-hub.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationHubController {
  constructor(private readonly hubService: IntegrationHubService) {}

  @Get('connectors')
  @RequirePermissions('integrations:read')
  listConnectors() {
    return this.hubService.listConnectors();
  }

  @Get('connectors/registered')
  @RequirePermissions('integrations:read')
  registeredConnectors() {
    return { registered: this.hubService.registeredConnectorNames() };
  }

  @Post('connectors/:name/test')
  @RequirePermissions('integrations:manage')
  testConnector(@Param('name') name: string) {
    return this.hubService.testConnector(name);
  }

  @Post('field-mappings')
  @RequirePermissions('integrations:manage')
  upsertMapping(
    @Body()
    body: { connectorName: string; entityType: string; internalField: string; externalField: string; direction?: 'IN' | 'OUT' | 'BOTH' },
  ) {
    return this.hubService.upsertFieldMapping(
      body.connectorName,
      body.entityType,
      body.internalField,
      body.externalField,
      body.direction ?? 'BOTH',
    );
  }

  @Get('field-mappings')
  @RequirePermissions('integrations:read')
  listMappings(@Query('connectorName') connectorName: string, @Query('entityType') entityType?: string) {
    return this.hubService.listFieldMappings(connectorName, entityType);
  }

  @Post('data-ownership')
  @RequirePermissions('integrations:manage')
  setOwnership(@Body() body: { entityType: string; ownership: DataOwnership }) {
    return this.hubService.setDataOwnership(body.entityType, body.ownership);
  }

  @Get('data-ownership')
  @RequirePermissions('integrations:read')
  listOwnership() {
    return this.hubService.listDataOwnership();
  }

  @Post('sync/:connectorName/:entityType')
  @RequirePermissions('integrations:manage')
  triggerSync(
    @Param('connectorName') connectorName: string,
    @Param('entityType') entityType: string,
    @Query('direction') direction: 'PULL' | 'PUSH' = 'PULL',
  ) {
    return this.hubService.triggerSync(connectorName, entityType, direction);
  }

  @Get('sync-logs')
  @RequirePermissions('integrations:read')
  listSyncLogs(@Query('connectorName') connectorName?: string) {
    return this.hubService.listSyncLogs(connectorName);
  }
}
