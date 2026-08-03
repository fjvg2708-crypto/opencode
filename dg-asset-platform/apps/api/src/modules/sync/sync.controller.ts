import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { SyncBatchDto } from './dto/sync-batch.dto';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('sync')
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('batch')
  @RequirePermissions('movements:create')
  processBatch(@Body() dto: SyncBatchDto, @CurrentUser() user: AuthenticatedUser) {
    return this.syncService.processBatch(dto, user);
  }

  @Get('status/:clientOperationId')
  @RequirePermissions('movements:read')
  status(@Param('clientOperationId') clientOperationId: string) {
    return this.syncService.status(clientOperationId);
  }
}
