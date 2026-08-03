import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { PartnerType } from '@prisma/client';

export class CreateWorkDto {
  @ApiProperty() @IsString() name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() client?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
}

export class CreateWarehouseDto {
  @ApiProperty() @IsString() name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
}

export class CreateCostCenterDto {
  @ApiProperty() @IsString() name!: string;
}

export class CreatePersonDto {
  @ApiProperty() @IsString() name!: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() team?: string;
}

export class CreatePartnerDto {
  @ApiProperty() @IsString() name!: string;
  @ApiProperty({ enum: PartnerType }) type!: PartnerType;
  @ApiPropertyOptional() @IsOptional() @IsString() taxId?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() active?: boolean;
}
