import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AddPartUsageDto, CloseMaintenanceOrderDto, CreateMaintenanceOrderDto } from './dto/maintenance.dto';

@ApiTags('maintenance')
@Controller('maintenance-orders')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @RequirePermissions('maintenance:create')
  create(@Body() dto: CreateMaintenanceOrderDto, @CurrentUser() user: AuthenticatedUser) {
    return this.maintenanceService.create(dto, user);
  }

  @Post(':id/parts')
  @RequirePermissions('maintenance:update')
  addPart(@Param('id') id: string, @Body() dto: AddPartUsageDto) {
    return this.maintenanceService.addPartUsage(id, dto);
  }

  @Patch('parts/:partUsageId/confirm-received')
  @RequirePermissions('maintenance:update')
  confirmPart(@Param('partUsageId') partUsageId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.maintenanceService.confirmPartReceived(partUsageId, user.userId);
  }

  @Patch(':id/close')
  @RequirePermissions('maintenance:close')
  close(@Param('id') id: string, @Body() dto: CloseMaintenanceOrderDto, @CurrentUser() user: AuthenticatedUser) {
    return this.maintenanceService.close(id, dto, user);
  }

  @Get('asset/:assetId')
  @RequirePermissions('maintenance:read')
  findByAsset(@Param('assetId') assetId: string) {
    return this.maintenanceService.findByAsset(assetId);
  }

  @Get(':id')
  @RequirePermissions('maintenance:read')
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOneOrThrow(id);
  }
}
