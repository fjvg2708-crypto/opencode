import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { generateInternalCode } from '../assets/domain/internal-code.util';
import { CreateArticleDto, StockMovementDto } from './dto/stock.dto';
import { AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  createArticle(dto: CreateArticleDto) {
    return this.prisma.article.create({
      data: { ...dto, internalCode: generateInternalCode('ART') },
    });
  }

  listArticles() {
    return this.prisma.article.findMany({ where: { deletedAt: null } });
  }

  async stockByWarehouse(warehouseId: string) {
    return this.prisma.stockItem.findMany({ where: { warehouseId }, include: { article: true } });
  }

  /** Regista um movimento de stock e atualiza a quantidade de forma atómica. */
  async registerMovement(dto: StockMovementDto, user: AuthenticatedUser) {
    return this.prisma.$transaction(async (tx) => {
      let stockItem = await tx.stockItem.findUnique({
        where: { articleId_warehouseId: { articleId: dto.articleId, warehouseId: dto.warehouseId } },
      });
      if (!stockItem) {
        stockItem = await tx.stockItem.create({ data: { articleId: dto.articleId, warehouseId: dto.warehouseId } });
      }

      const delta = dto.type === 'OUT' ? -dto.quantity : dto.quantity;
      const newQuantity = stockItem.quantity + delta;
      if (newQuantity < 0) {
        throw new BadRequestException('Stock insuficiente para esta saída.');
      }

      const updated = await tx.stockItem.update({ where: { id: stockItem.id }, data: { quantity: newQuantity } });

      await tx.stockMovement.create({
        data: {
          stockItemId: stockItem.id,
          type: dto.type,
          quantity: dto.quantity,
          reason: dto.reason,
          referenceId: dto.referenceId,
          createdById: user.userId,
        },
      });

      const article = await tx.article.findUnique({ where: { id: dto.articleId } });
      if (article?.minStock != null && updated.quantity < article.minStock) {
        await tx.alert.create({
          data: {
            type: 'STOCK_BELOW_MINIMUM',
            severity: 'HIGH',
            entityType: 'Article',
            entityId: article.id,
            message: `Stock de "${article.name}" abaixo do mínimo no armazém.`,
          },
        });
      }

      return updated;
    });
  }

  async consumeForMaintenance(articleId: string, warehouseId: string, quantity: number, maintenanceOrderId: string, user: AuthenticatedUser) {
    return this.registerMovement(
      { articleId, warehouseId, type: 'OUT', quantity, reason: 'Consumo em manutenção', referenceId: maintenanceOrderId },
      user,
    );
  }
}
