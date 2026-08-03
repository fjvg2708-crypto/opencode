import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
  @ApiProperty() @IsString() name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() family?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() unit?: string;
  @ApiPropertyOptional({ description: 'OIL|FILTER|PART|CONSUMABLE|OTHER' }) @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() minStock?: number;
}

export class StockMovementDto {
  @ApiProperty() @IsString() articleId!: string;
  @ApiProperty() @IsString() warehouseId!: string;
  @ApiProperty({ enum: ['IN', 'OUT', 'ADJUSTMENT', 'RESERVATION'] }) @IsString() type!: string;
  @ApiProperty() @IsNumber() quantity!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() referenceId?: string;
}
