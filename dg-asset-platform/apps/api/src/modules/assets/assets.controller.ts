import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AssetStatus, AssetType } from '@prisma/client';
import { AssetsService } from './assets.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { AddDraftDocumentDto, AddDraftPhotoDto, CreateAssetDraftDto, ReviewExtractedFieldDto } from './dto/asset-draft.dto';
import { CreateAssetDto, UpdateAssetStatusDto } from './dto/create-asset.dto';

@ApiTags('assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  // Wizard
  @Post('drafts')
  @RequirePermissions('assets:create')
  createDraft(@Body() dto: CreateAssetDraftDto, @CurrentUser() user: AuthenticatedUser) {
    return this.assetsService.createDraft(dto, user);
  }

  @Get('drafts/:id')
  @RequirePermissions('assets:read')
  getDraft(@Param('id') id: string) {
    return this.assetsService.getDraftOrThrow(id);
  }

  @Post('drafts/:id/photos')
  @RequirePermissions('assets:create')
  addPhoto(@Param('id') id: string, @Body() dto: AddDraftPhotoDto) {
    return this.assetsService.addPhoto(id, dto);
  }

  @Post('drafts/:id/documents')
  @RequirePermissions('assets:create')
  addDocument(@Param('id') id: string, @Body() dto: AddDraftDocumentDto) {
    return this.assetsService.addDocument(id, dto);
  }

  @Get('drafts/:id/duplicates')
  @RequirePermissions('assets:read')
  checkDuplicates(@Param('id') id: string) {
    return this.assetsService.checkDraftDuplicates(id);
  }

  @Patch('drafts/fields/:fieldId/review')
  @RequirePermissions('assets:validate')
  reviewField(
    @Param('fieldId') fieldId: string,
    @Body() dto: ReviewExtractedFieldDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.assetsService.reviewExtractedField(fieldId, dto, user);
  }

  // Ativos
  @Post()
  @RequirePermissions('assets:create')
  create(@Body() dto: CreateAssetDto, @CurrentUser() user: AuthenticatedUser) {
    return this.assetsService.createAsset(dto, user);
  }

  @Get()
  @RequirePermissions('assets:read')
  findAll(
    @Query('assetType') assetType?: AssetType,
    @Query('status') status?: AssetStatus,
    @Query('workId') workId?: string,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.assetsService.findAll({ assetType, status, workId, warehouseId });
  }

  @Get(':id')
  @RequirePermissions('assets:read')
  findOne(@Param('id') id: string) {
    return this.assetsService.findOneOrThrow(id);
  }

  @Patch(':id/status')
  @RequirePermissions('assets:update')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAssetStatusDto, @CurrentUser() user: AuthenticatedUser) {
    return this.assetsService.updateStatus(id, dto.status as AssetStatus, dto.reason, user);
  }

  @Patch(':id/validate')
  @RequirePermissions('assets:validate')
  validate(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.assetsService.validate(id, user);
  }
}
