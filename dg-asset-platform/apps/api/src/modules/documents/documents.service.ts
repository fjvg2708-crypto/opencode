import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/document.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDocumentDto, user: AuthenticatedUser) {
    const document = await this.prisma.document.create({
      data: {
        assetId: dto.assetId,
        type: dto.type,
        title: dto.title,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        issuer: dto.issuer,
        storageKey: dto.storageKey,
        confidentiality: dto.confidentiality ?? 'INTERNAL',
        uploadedById: user.userId,
      },
    });

    if (dto.expiryDate) {
      const expiresInDays = (new Date(dto.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      if (expiresInDays <= 30) {
        await this.prisma.alert.create({
          data: {
            type: 'DOCUMENT_EXPIRING',
            severity: expiresInDays < 0 ? 'CRITICAL' : 'NORMAL',
            entityType: 'Document',
            entityId: document.id,
            message: `Documento "${dto.title}" ${expiresInDays < 0 ? 'expirado' : 'a expirar em breve'}.`,
          },
        });
      }
    }

    return document;
  }

  findByAsset(assetId: string) {
    return this.prisma.document.findMany({ where: { assetId, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }

  async remove(id: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) throw new NotFoundException('Documento não encontrado.');
    // Soft delete — regra obrigatória #8/secção 30: nada crítico é apagado definitivamente.
    return this.prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  findExpiringSoon(withinDays = 30) {
    const threshold = new Date(Date.now() + withinDays * 24 * 60 * 60 * 1000);
    return this.prisma.document.findMany({
      where: { deletedAt: null, expiryDate: { lte: threshold } },
      orderBy: { expiryDate: 'asc' },
    });
  }
}
