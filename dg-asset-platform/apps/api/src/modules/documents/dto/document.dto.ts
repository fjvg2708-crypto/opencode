import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateDocumentDto {
  @ApiPropertyOptional() @IsOptional() @IsString() assetId?: string;
  @ApiProperty({ enum: DocumentType }) @IsEnum(DocumentType) type!: DocumentType;
  @ApiProperty() @IsString() title!: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() issueDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiryDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() issuer?: string;
  @ApiProperty() @IsString() storageKey!: string;
  @ApiPropertyOptional({ description: 'PUBLIC|INTERNAL|RESTRICTED' }) @IsOptional() @IsString() confidentiality?: string;
}
