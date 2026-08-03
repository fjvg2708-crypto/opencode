export interface OcrFieldResult {
  field: string;
  value: string;
  confidence: number; // 0..1
}

export interface OcrExtractionInput {
  storageKey: string;
  kind: string; // tipo de foto ou documento (ex. PLATE, VIN, DATA_PLATE, REGISTRATION...)
  assetTypeHint?: string;
}

/**
 * Ponto de substituição para um serviço real de OCR/visão computacional
 * (Azure Document Intelligence, AWS Textract/Rekognition, Google Vision, ...).
 * Nenhum outro módulo depende da implementação concreta — apenas desta
 * interface, injetada via OCR_EXTRACTOR (ver ocr.module.ts).
 */
export interface OcrExtractor {
  extract(input: OcrExtractionInput): Promise<OcrFieldResult[]>;
}

export const OCR_EXTRACTOR = Symbol('OCR_EXTRACTOR');
