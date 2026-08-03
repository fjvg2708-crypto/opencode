import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetType } from '@prisma/client';

export class CreateAssetDraftDto {
  @ApiProperty({ enum: AssetType })
  @IsEnum(AssetType)
  assetType!: AssetType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;
}

export class AddDraftPhotoDto {
  @ApiProperty({ description: 'OVERVIEW|FRONT|BACK|SIDE|INTERIOR|PLATE|DATA_PLATE|SERIAL|VIN|ODOMETER|HOUR_METER|DAMAGE|COMPONENT|ACCESSORY' })
  @IsString()
  kind!: string;

  @ApiProperty()
  @IsString()
  storageKey!: string;
}

export class AddDraftDocumentDto {
  @ApiProperty()
  @IsString()
  docType!: string;

  @ApiProperty()
  @IsString()
  storageKey!: string;
}

export class ReviewExtractedFieldDto {
  @ApiProperty({ enum: ['CONFIRMED', 'CORRECTED', 'REJECTED'] })
  @IsString()
  decision!: 'CONFIRMED' | 'CORRECTED' | 'REJECTED';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  correctedValue?: string;
}
