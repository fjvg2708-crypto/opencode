// Tipos partilhados entre apps/api e apps/web.
// Mantém-se em sincronia manual com prisma/schema.prisma (enums) — fonte de
// verdade dos dados é o schema; isto é apenas para tipagem no frontend.

export type SourceSystem =
  | 'INTERNAL'
  | 'PHC'
  | 'PRIMAVERA'
  | 'SAP'
  | 'SAGE'
  | 'ODOO'
  | 'DYNAMICS'
  | 'OTHER';

export type SyncState = 'NOT_SYNCED' | 'PENDING' | 'SYNCED' | 'CONFLICT' | 'ERROR';

export type AssetType =
  | 'VEHICLE'
  | 'MACHINE'
  | 'EQUIPMENT'
  | 'HEAVY_EQUIPMENT'
  | 'TOOL'
  | 'ACCESSORY'
  | 'PART'
  | 'CONTROLLED_MATERIAL'
  | 'OTHER';

export type AssetStatus =
  | 'DRAFT'
  | 'PROCESSING'
  | 'PENDING_VALIDATION'
  | 'VALIDATED'
  | 'ACTIVE'
  | 'AVAILABLE'
  | 'IN_USE'
  | 'RESERVED'
  | 'IN_TRANSIT'
  | 'IN_MAINTENANCE'
  | 'BROKEN'
  | 'BLOCKED'
  | 'LOST'
  | 'INACTIVE'
  | 'DECOMMISSIONED'
  | 'ARCHIVED';

export interface UniversalEntity {
  id: string;
  internalCode: string;
  externalCode?: string | null;
  sourceSystem: SourceSystem;
  syncState: SyncState;
  createdAt: string;
  updatedAt: string;
}

export interface AssetDto extends UniversalEntity {
  assetType: AssetType;
  category?: string | null;
  designation: string;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  plate?: string | null;
  vin?: string | null;
  status: AssetStatus;
  workId?: string | null;
  warehouseId?: string | null;
  responsibleId?: string | null;
}

export interface ExtractedFieldDto {
  id: string;
  field: string;
  value: string;
  confidence: number;
  sourceDocumentId?: string | null;
  sourcePhotoId?: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CORRECTED' | 'REJECTED';
  correctedValue?: string | null;
}

export type PartReturnStatus =
  | 'RETURNED_TO_VEHICLE'
  | 'DELIVERED_TO_RESPONSIBLE'
  | 'EXEMPT'
  | 'NOT_RETURNED_JUSTIFIED';

export const PERMISSION_MODULES = [
  'assets',
  'qrcode',
  'movements',
  'maintenance',
  'breakdowns',
  'stock',
  'documents',
  'works',
  'partners',
  'reports',
  'alerts',
  'users',
  'integrations',
  'audit',
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];
