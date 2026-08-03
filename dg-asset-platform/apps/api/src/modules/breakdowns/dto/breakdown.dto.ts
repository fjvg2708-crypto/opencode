import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReportBreakdownDto {
  @ApiProperty() @IsString() assetId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() workId?: string;
  @ApiProperty({ enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'] }) @IsString() priority!: string;
  @ApiProperty() @IsString() description!: string;
  @ApiPropertyOptional() @IsOptional() photos?: unknown;
  @ApiPropertyOptional() @IsOptional() @IsString() videoKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() usableWhileBroken?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() safetyRisk?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() immediateAction?: string;
}

export class UpdateBreakdownStatusDto {
  @ApiProperty() @IsString() status!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedToId?: string;
}
