import { Controller, Get, Header, Param, Post, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { ImportExportService, ImportableEntityType } from './import-export.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('import-export')
@Controller('import-export')
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Post(':entityType/simulate')
  @RequirePermissions('assets:create')
  @UseInterceptors(FileInterceptor('file'))
  simulate(
    @Param('entityType') entityType: ImportableEntityType,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.importExportService.simulate(entityType, file.originalname, file.buffer.toString('utf-8'), user);
  }

  @Post('batches/:batchId/confirm')
  @RequirePermissions('assets:create')
  confirm(@Param('batchId') batchId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.importExportService.confirm(batchId, user);
  }

  @Post('batches/:batchId/revert')
  @RequirePermissions('assets:update')
  revert(@Param('batchId') batchId: string) {
    return this.importExportService.revert(batchId);
  }

  @Get('batches/:batchId')
  @RequirePermissions('assets:read')
  getBatch(@Param('batchId') batchId: string) {
    return this.importExportService.getBatchWithRows(batchId);
  }

  @Get('batches')
  @RequirePermissions('assets:read')
  listBatches() {
    return this.importExportService.listBatches();
  }

  @Get('assets/export.csv')
  @RequirePermissions('assets:read')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="ativos.csv"')
  async exportAssets() {
    const csv = await this.importExportService.exportAssetsCsv();
    return new StreamableFile(Buffer.from(csv, 'utf-8'));
  }
}
