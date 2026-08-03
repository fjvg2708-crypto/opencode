import { AssetType } from '@prisma/client';

/**
 * Campos obrigatórios por tipo de ativo antes de sair de DRAFT/PROCESSING
 * (secções 3.6 e 4 do pedido). Mantido simples e explícito — nada de regras
 * escondidas em várias camadas.
 */
export function requiredFieldsFor(assetType: AssetType): string[] {
  const common = ['designation', 'brand', 'model'];
  switch (assetType) {
    case 'VEHICLE':
      return [...common, 'plate', 'vin'];
    case 'MACHINE':
    case 'EQUIPMENT':
    case 'HEAVY_EQUIPMENT':
      return [...common, 'serialNumber'];
    default:
      return common;
  }
}

export interface MissingFieldsResult {
  missing: string[];
  complete: boolean;
}

export function checkRequiredFields(
  assetType: AssetType,
  values: Record<string, unknown>,
): MissingFieldsResult {
  const required = requiredFieldsFor(assetType);
  const missing = required.filter((field) => {
    const v = values[field];
    return v === undefined || v === null || v === '';
  });
  return { missing, complete: missing.length === 0 };
}
