import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('asset/:assetId')
  @RequirePermissions('audit:read')
  findByAsset(@Param('assetId') assetId: string) {
    return this.auditService.findByAsset(assetId);
  }

  @Get('entity/:entityType/:entityId')
  @RequirePermissions('audit:read')
  findByEntity(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    return this.auditService.findByEntity(entityType, entityId);
  }

  @Get('recent')
  @RequirePermissions('audit:read')
  findRecent(@Query('take') take?: string) {
    return this.auditService.findRecent(take ? parseInt(take, 10) : undefined);
  }
}
