import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsIn, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncOperationDto {
  @ApiProperty({ description: 'UUID gerado no dispositivo — chave de idempotência.' })
  @IsString()
  clientOperationId!: string;

  @ApiProperty({ enum: ['MOVEMENT', 'BREAKDOWN', 'ASSET_READING', 'QR_SCAN'] })
  @IsIn(['MOVEMENT', 'BREAKDOWN', 'ASSET_READING', 'QR_SCAN'])
  type!: 'MOVEMENT' | 'BREAKDOWN' | 'ASSET_READING' | 'QR_SCAN';

  @ApiProperty()
  @IsObject()
  payload!: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class SyncBatchDto {
  @ApiProperty({ type: [SyncOperationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncOperationDto)
  operations!: SyncOperationDto[];
}
