import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { MovementType } from '@prisma/client';

export class CreateMovementDto {
  @ApiProperty()
  @IsString()
  assetId!: string;

  @ApiProperty({ enum: MovementType })
  @IsEnum(MovementType)
  type!: MovementType;

  @ApiPropertyOptional() @IsOptional() @IsString() toPersonId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() toWarehouseId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() workId?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expectedReturnAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() gpsLat?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() gpsLng?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() signatureKey?: string;
  @ApiPropertyOptional() @IsOptional() photos?: unknown;
  @ApiPropertyOptional() @IsOptional() @IsString() observations?: string;

  @ApiPropertyOptional({ description: 'UUID gerado no dispositivo — garante idempotência em sincronização offline.' })
  @IsOptional()
  @IsString()
  clientOperationId?: string;
}

export class ConfirmReturnDto {
  @ApiProperty({ enum: ['CONFIRMED', 'PARTIAL_RETURN', 'LOST', 'DAMAGED'] })
  @IsString()
  status!: 'CONFIRMED' | 'PARTIAL_RETURN' | 'LOST' | 'DAMAGED';

  @ApiPropertyOptional() @IsOptional() @IsString() observations?: string;
  @ApiPropertyOptional() @IsOptional() photos?: unknown;
}
