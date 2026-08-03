import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { OcrExtractionInput, OcrExtractor, OcrFieldResult } from '../domain/ocr-extractor.interface';

/**
 * Extrator determinístico de desenvolvimento/demonstração — não chama
 * nenhum serviço externo, não tem custos, não requer credenciais.
 * Simula confiança variável por tipo de campo para exercitar o fluxo de
 * validação humana (secção 3.5). Substituir por AzureVisionExtractor /
 * TextractExtractor / GoogleVisionExtractor implementando o mesmo
 * `OcrExtractor` quando existirem credenciais de produção.
 */
@Injectable()
export class MockExtractor implements OcrExtractor {
  async extract(input: OcrExtractionInput): Promise<OcrFieldResult[]> {
    const seed = createHash('sha1').update(input.storageKey).digest('hex');
    const pseudoConfidence = (offset: number) => {
      const n = parseInt(seed.slice(offset, offset + 2), 16) / 255; // 0..1
      return Math.round((0.55 + n * 0.44) * 100) / 100; // 0.55..0.99
    };

    switch (input.kind) {
      case 'PLATE':
        return [{ field: 'plate', value: this.fakePlate(seed), confidence: pseudoConfidence(0) }];
      case 'VIN':
        return [{ field: 'vin', value: `VIN${seed.slice(0, 14).toUpperCase()}`, confidence: pseudoConfidence(2) }];
      case 'DATA_PLATE':
      case 'SERIAL':
        return [
          { field: 'serialNumber', value: `SN-${seed.slice(0, 10).toUpperCase()}`, confidence: pseudoConfidence(4) },
          { field: 'brand', value: 'A confirmar', confidence: pseudoConfidence(6) },
        ];
      case 'ODOMETER':
        return [{ field: 'odometerKm', value: String(parseInt(seed.slice(0, 5), 16) % 250000), confidence: pseudoConfidence(8) }];
      case 'HOUR_METER':
        return [{ field: 'hourMeter', value: String(parseInt(seed.slice(0, 4), 16) % 20000), confidence: pseudoConfidence(10) }];
      case 'REGISTRATION':
      case 'INSURANCE_POLICY':
      case 'INSPECTION_CERTIFICATE':
      case 'PURCHASE_INVOICE':
        return [
          { field: 'documentDate', value: new Date().toISOString().slice(0, 10), confidence: pseudoConfidence(12) },
        ];
      default:
        return [];
    }
  }

  private fakePlate(seed: string): string {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const l = (i: number) => letters[parseInt(seed[i], 16) % letters.length];
    const d = (i: number) => parseInt(seed[i], 16) % 10;
    return `${d(0)}${d(1)}-${l(2)}${l(3)}-${d(4)}${d(5)}`;
  }
}
