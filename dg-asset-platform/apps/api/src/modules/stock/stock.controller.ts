import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CreateArticleDto, StockMovementDto } from './dto/stock.dto';

@ApiTags('stock')
@Controller()
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('articles')
  @RequirePermissions('stock:create')
  createArticle(@Body() dto: CreateArticleDto) {
    return this.stockService.createArticle(dto);
  }

  @Get('articles')
  @RequirePermissions('stock:read')
  listArticles() {
    return this.stockService.listArticles();
  }

  @Get('warehouses/:warehouseId/stock')
  @RequirePermissions('stock:read')
  stockByWarehouse(@Param('warehouseId') warehouseId: string) {
    return this.stockService.stockByWarehouse(warehouseId);
  }

  @Post('stock/movements')
  @RequirePermissions('stock:update')
  registerMovement(@Body() dto: StockMovementDto, @CurrentUser() user: AuthenticatedUser) {
    return this.stockService.registerMovement(dto, user);
  }
}
