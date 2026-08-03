import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { MaintenanceType, PartReturnStatus } from '@prisma/client';

export class CreateMaintenanceOrderDto {
  @ApiProperty() @IsString() assetId!: string;
  @ApiProperty({ enum: MaintenanceType }) @IsEnum(MaintenanceType) type!: MaintenanceType;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() workshopId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() mechanicName?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() entryDate?: string;
}

export class AddPartUsageDto {
  @ApiPropertyOptional() @IsOptional() @IsString() articleId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reference?: string;
  @ApiProperty() @IsString() description!: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() quantity?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() photoKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() conditionNotes?: string;
  @ApiPropertyOptional({ enum: PartReturnStatus }) @IsOptional() @IsEnum(PartReturnStatus) returnStatus?: PartReturnStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() nonReturnReason?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() receivedById?: string;
}

export class CloseMaintenanceOrderDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() laborCost?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() partsCost?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() otherCosts?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() exitDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() nextMaintenanceAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() nextRevisionAt?: string;
}
