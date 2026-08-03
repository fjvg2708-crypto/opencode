import { Injectable } from '@nestjs/common';
import { Asset } from '@prisma/client';
import { QR_ELIGIBLE_STATUSES } from '../../assets/domain/asset-status.state-machine';
import { checkRequiredFields } from '../../assets/domain/required-fields.util';

export interface QrEligibilityResult {
  eligible: boolean;
  reasons: string[];
}

/**
 * Verificações obrigatórias antes de gerar QR Code (secção 4 do pedido):
 * estado da ficha, campos obrigatórios, e — dependendo do tipo — matrícula/
 * VIN/nº série já preenchidos (garantido indiretamente pelos campos
 * obrigatórios). Fotografias/documentos mínimos ficam para o wizard de
 * validação (assets module) reportar como missing antes de chegar aqui.
 */
@Injectable()
export class QrEligibilityService {
  evaluate(asset: Asset): QrEligibilityResult {
    const reasons: string[] = [];

    if (!QR_ELIGIBLE_STATUSES.includes(asset.status)) {
      reasons.push(`Estado da ficha (${asset.status}) não permite gerar QR Code — é necessário validar primeiro.`);
    }

    const { complete, missing } = checkRequiredFields(asset.assetType, asset as unknown as Record<string, unknown>);
    if (!complete) {
      reasons.push(`Campos obrigatórios em falta: ${missing.join(', ')}.`);
    }

    return { eligible: reasons.length === 0, reasons };
  }
}
