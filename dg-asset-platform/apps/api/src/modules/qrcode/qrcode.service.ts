import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { QrEligibilityService } from './application/qr-eligibility.service';
import { LabelRendererService } from './application/label-renderer.service';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class QrcodeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eligibility: QrEligibilityService,
    private readonly config: ConfigService,
    private readonly labelRenderer: LabelRendererService,
  ) {}

  /** Token opaco de alta entropia — nunca contém dados do ativo (regra obrigatória #7). */
  private generateToken(): string {
    return randomBytes(24).toString('base64url');
  }

  private resolveUrl(token: string): string {
    const base = this.config.get<string>('APP_BASE_URL', 'http://localhost:5173');
    const path = this.config.get<string>('QR_RESOLVE_PATH', '/a');
    return `${base}${path}/${token}`;
  }

  async issue(assetId: string, user: AuthenticatedUser) {
    const asset = await this.prisma.asset.findFirst({ where: { id: assetId, deletedAt: null } });
    if (!asset) throw new NotFoundException('Ativo não encontrado.');

    const { eligible, reasons } = this.eligibility.evaluate(asset);
    if (!eligible) {
      throw new BadRequestException({ message: 'Ativo não elegível para geração de QR Code.', reasons });
    }

    const existingActive = await this.prisma.qrCode.findFirst({ where: { assetId, active: true } });
    if (existingActive) {
      throw new BadRequestException('Este ativo já possui um QR Code principal ativo. Utilize reimpressão.');
    }

    const qr = await this.prisma.qrCode.create({
      data: { assetId, token: this.generateToken(), version: 1, active: true },
    });
    await this.prisma.qrCodeEvent.create({
      data: { qrCodeId: qr.id, eventType: 'EMITTED', userId: user.userId },
    });
    return qr;
  }

  async reprint(assetId: string, reason: string, user: AuthenticatedUser) {
    const current = await this.prisma.qrCode.findFirst({ where: { assetId, active: true } });
    if (!current) throw new NotFoundException('Este ativo não tem QR Code ativo para reimprimir.');

    await this.prisma.qrCodeEvent.create({
      data: { qrCodeId: current.id, eventType: 'REPRINTED', reason, userId: user.userId },
    });
    return current;
  }

  async replace(assetId: string, reason: string, user: AuthenticatedUser) {
    const current = await this.prisma.qrCode.findFirst({ where: { assetId, active: true } });
    if (current) {
      await this.prisma.qrCode.update({ where: { id: current.id }, data: { active: false } });
      await this.prisma.qrCodeEvent.create({
        data: { qrCodeId: current.id, eventType: 'REPLACED', reason, userId: user.userId },
      });
    }
    const nextVersion = (current?.version ?? 0) + 1;
    const qr = await this.prisma.qrCode.create({
      data: { assetId, token: this.generateToken(), version: nextVersion, active: true },
    });
    await this.prisma.qrCodeEvent.create({
      data: { qrCodeId: qr.id, eventType: 'EMITTED', reason, userId: user.userId },
    });
    return qr;
  }

  async deactivate(assetId: string, reason: string, user: AuthenticatedUser) {
    const current = await this.prisma.qrCode.findFirst({ where: { assetId, active: true } });
    if (!current) throw new NotFoundException('Este ativo não tem QR Code ativo.');
    await this.prisma.qrCode.update({ where: { id: current.id }, data: { active: false } });
    await this.prisma.qrCodeEvent.create({
      data: { qrCodeId: current.id, eventType: 'DEACTIVATED', reason, userId: user.userId },
    });
    return { deactivated: true };
  }

  async renderPng(assetId: string): Promise<Buffer> {
    const qr = await this.prisma.qrCode.findFirst({ where: { assetId, active: true } });
    if (!qr) throw new NotFoundException('Este ativo não tem QR Code ativo.');
    return QRCode.toBuffer(this.resolveUrl(qr.token), { errorCorrectionLevel: 'M', margin: 1, width: 400 });
  }

  async renderLabelPng(assetId: string): Promise<Buffer> {
    const asset = await this.prisma.asset.findFirst({ where: { id: assetId, deletedAt: null } });
    if (!asset) throw new NotFoundException('Ativo não encontrado.');
    const qr = await this.prisma.qrCode.findFirst({ where: { assetId, active: true } });
    if (!qr) throw new NotFoundException('Este ativo não tem QR Code ativo.');

    return this.labelRenderer.render({
      internalCode: asset.internalCode,
      designation: asset.designation,
      category: asset.category ?? undefined,
      identifier: asset.plate ?? asset.serialNumber ?? undefined,
      qrUrl: this.resolveUrl(qr.token),
    });
  }

  async history(assetId: string) {
    return this.prisma.qrCode.findMany({
      where: { assetId },
      include: { events: { orderBy: { createdAt: 'desc' } } },
      orderBy: { version: 'desc' },
    });
  }

  /** Resolução por scan (secção 4): devolve o ativo associado ao token, registando o evento. */
  async resolveToken(token: string, user?: AuthenticatedUser) {
    const qr = await this.prisma.qrCode.findUnique({ where: { token } });
    if (!qr || !qr.active) throw new NotFoundException('QR Code inválido ou inativo.');

    await this.prisma.qrCodeEvent.create({
      data: { qrCodeId: qr.id, eventType: 'SCANNED', userId: user?.userId },
    });

    // A filtragem por permissão do que é devolvido (documentos, custos, etc.)
    // é responsabilidade do controller/serializer consumidor, com base em
    // `user.permissions` — aqui devolve-se o ativo completo para o backend.
    return this.prisma.asset.findUnique({
      where: { id: qr.assetId },
      include: {
        photos: true,
        documents: true,
        movementsAsAsset: { orderBy: { createdAt: 'desc' }, take: 10 },
        maintenanceOrders: { orderBy: { createdAt: 'desc' }, take: 10 },
        breakdowns: { where: { status: { not: 'CLOSED' } } },
      },
    });
  }
}
