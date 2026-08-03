import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { AssetType } from '@prisma/client';

export class CreateAssetDto {
  @ApiProperty({ enum: AssetType })
  @IsEnum(AssetType)
  assetType!: AssetType;

  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subcategory?: string;

  @ApiProperty()
  @IsString()
  designation!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() model?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() serialNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() plate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() vin?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() manufacturerRef?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() yearOfManufacture?: number;

  @ApiPropertyOptional() @IsOptional() @IsString() workId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() warehouseId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() responsibleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() costCenterId?: string;

  @ApiPropertyOptional({ description: 'ID do AssetDraft de origem, se criado via wizard OCR/IA' })
  @IsOptional()
  @IsString()
  sourceDraftId?: string;
}

export class UpdateAssetStatusDto {
  @ApiProperty()
  @IsString()
  status!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
