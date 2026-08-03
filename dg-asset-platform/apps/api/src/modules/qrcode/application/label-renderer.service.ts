import { Injectable } from '@nestjs/common';
import { createCanvas, loadImage } from 'canvas';
import * as QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export interface LabelData {
  internalCode: string;
  designation: string;
  category?: string;
  identifier?: string; // matrícula ou nº série
  qrUrl: string;
  logoBuffer?: Buffer;
}

/**
 * Gera a etiqueta (secção 5): logótipo, código interno, designação,
 * categoria, matrícula/nº série, QR Code, código de barras Code128 e o
 * texto "Propriedade do Grupo DG". Devolve um PNG a 300dpi equivalente,
 * dimensionado para etiqueta pequena (60x35mm) — o mesmo desenho serve de
 * base para variantes A4/térmica ajustando o `scale`.
 */
@Injectable()
export class LabelRendererService {
  async render(data: LabelData): Promise<Buffer> {
    const width = 720; // 60mm @ ~300dpi
    const height = 420; // 35mm @ ~300dpi
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, width - 8, height - 8);

    if (data.logoBuffer) {
      const logo = await loadImage(data.logoBuffer);
      ctx.drawImage(logo, 20, 16, 120, 40);
    } else {
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#111111';
      ctx.fillText('GRUPO DG', 20, 44);
    }

    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(data.internalCode, 20, 90);
    ctx.font = '20px sans-serif';
    ctx.fillText(this.truncate(data.designation, 26), 20, 118);
    if (data.category) ctx.fillText(data.category, 20, 142);
    if (data.identifier) ctx.fillText(data.identifier, 20, 166);

    const qrBuffer = await QRCode.toBuffer(data.qrUrl, { errorCorrectionLevel: 'M', margin: 0, width: 220 });
    const qrImage = await loadImage(qrBuffer);
    ctx.drawImage(qrImage, width - 240, 20, 200, 200);

    const barcodeCanvas = this.renderBarcodeCanvas(data.internalCode);
    ctx.drawImage(barcodeCanvas, 20, 230, 400, 100);

    ctx.font = 'italic 16px sans-serif';
    ctx.fillText('Propriedade do Grupo DG', 20, height - 20);

    return canvas.toBuffer('image/png');
  }

  /** node-canvas expõe uma API compatível com o Canvas do browser, que o JsBarcode suporta diretamente em Node — evita depender do DOM/SVG (indisponível fora do browser). */
  private renderBarcodeCanvas(value: string) {
    const barcodeCanvas = createCanvas(400, 100);
    JsBarcode(barcodeCanvas as any, value, { format: 'CODE128', displayValue: true, margin: 0 });
    return barcodeCanvas;
  }

  private truncate(value: string, max: number): string {
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
  }
}
