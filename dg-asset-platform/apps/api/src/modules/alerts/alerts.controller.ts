import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @RequirePermissions('alerts:read')
  findOpen(@Query('severity') severity?: string) {
    return this.alertsService.findOpen(severity);
  }

  @Patch(':id/acknowledge')
  @RequirePermissions('alerts:update')
  acknowledge(@Param('id') id: string) {
    return this.alertsService.acknowledge(id);
  }

  @Patch(':id/resolve')
  @RequirePermissions('alerts:update')
  resolve(@Param('id') id: string) {
    return this.alertsService.resolve(id);
  }
}
