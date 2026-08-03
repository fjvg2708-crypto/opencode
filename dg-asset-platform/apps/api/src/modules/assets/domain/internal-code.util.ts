/**
 * Gera um código interno legível único por prefixo (ex. VT-2026-8F3K2A).
 * Não depende de sequência de BD para evitar contenção; unicidade é
 * garantida pela constraint `@unique` no schema (colisão é praticamente
 * impossível com 6 chars base32 + timestamp).
 */
export function generateInternalCode(prefix: string): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

export const ASSET_TYPE_PREFIX: Record<string, string> = {
  VEHICLE: 'VT',
  MACHINE: 'MQ',
  EQUIPMENT: 'EQ',
  HEAVY_EQUIPMENT: 'EP',
  TOOL: 'FR',
  ACCESSORY: 'AC',
  PART: 'PC',
  CONTROLLED_MATERIAL: 'MC',
  OTHER: 'OT',
};
