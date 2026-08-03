import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateDocumentDto } from './dto/document.dto';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @RequirePermissions('documents:create')
  create(@Body() dto: CreateDocumentDto, @CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.create(dto, user);
  }

  @Get('asset/:assetId')
  @RequirePermissions('documents:read')
  findByAsset(@Param('assetId') assetId: string) {
    return this.documentsService.findByAsset(assetId);
  }

  @Get('expiring')
  @RequirePermissions('documents:read')
  findExpiringSoon(@Query('withinDays') withinDays?: string) {
    return this.documentsService.findExpiringSoon(withinDays ? parseInt(withinDays, 10) : undefined);
  }

  @Delete(':id')
  @RequirePermissions('documents:delete')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
