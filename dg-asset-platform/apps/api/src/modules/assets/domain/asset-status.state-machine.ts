import { AssetStatus } from '@prisma/client';

/**
 * Transições de estado permitidas do ativo (secção 6 do pedido).
 * O QR Code só pode ser gerado a partir de VALIDATED em diante — ver
 * qrcode/application/qr-eligibility.service.ts, que consulta este mapa.
 */
const TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  DRAFT: ['PROCESSING', 'ARCHIVED'],
  PROCESSING: ['PENDING_VALIDATION', 'DRAFT'],
  PENDING_VALIDATION: ['VALIDATED', 'PROCESSING'],
  VALIDATED: ['ACTIVE', 'BLOCKED'],
  ACTIVE: ['AVAILABLE', 'IN_USE', 'IN_MAINTENANCE', 'BLOCKED', 'INACTIVE'],
  AVAILABLE: ['IN_USE', 'RESERVED', 'IN_TRANSIT', 'IN_MAINTENANCE', 'BLOCKED', 'LOST', 'INACTIVE'],
  IN_USE: ['AVAILABLE', 'IN_TRANSIT', 'IN_MAINTENANCE', 'BROKEN', 'LOST', 'BLOCKED'],
  RESERVED: ['AVAILABLE', 'IN_USE', 'BLOCKED'],
  IN_TRANSIT: ['AVAILABLE', 'IN_USE', 'BLOCKED'],
  IN_MAINTENANCE: ['AVAILABLE', 'BROKEN', 'DECOMMISSIONED'],
  BROKEN: ['IN_MAINTENANCE', 'DECOMMISSIONED', 'BLOCKED'],
  BLOCKED: ['AVAILABLE', 'INACTIVE', 'DECOMMISSIONED'],
  LOST: ['DECOMMISSIONED', 'AVAILABLE'],
  INACTIVE: ['AVAILABLE', 'ARCHIVED', 'DECOMMISSIONED'],
  DECOMMISSIONED: ['ARCHIVED'],
  ARCHIVED: [],
};

export class InvalidAssetTransitionError extends Error {
  constructor(from: AssetStatus, to: AssetStatus) {
    super(`Transição de estado não permitida: ${from} → ${to}.`);
  }
}

export function assertValidTransition(from: AssetStatus, to: AssetStatus): void {
  if (from === to) return;
  const allowed = TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new InvalidAssetTransitionError(from, to);
  }
}

/** Estados a partir dos quais é permitido gerar/possuir um QR Code ativo (regra obrigatória #5). */
export const QR_ELIGIBLE_STATUSES: AssetStatus[] = [
  'VALIDATED',
  'ACTIVE',
  'AVAILABLE',
  'IN_USE',
  'RESERVED',
  'IN_TRANSIT',
  'IN_MAINTENANCE',
];
