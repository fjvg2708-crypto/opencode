import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MovementsService } from './movements.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ConfirmReturnDto, CreateMovementDto } from './dto/create-movement.dto';

@ApiTags('movements')
@Controller('movements')
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Post()
  @RequirePermissions('movements:create')
  create(@Body() dto: CreateMovementDto, @CurrentUser() user: AuthenticatedUser) {
    return this.movementsService.create(dto, user);
  }

  @Patch(':id/confirm-return')
  @RequirePermissions('movements:update')
  confirmReturn(@Param('id') id: string, @Body() dto: ConfirmReturnDto, @CurrentUser() user: AuthenticatedUser) {
    return this.movementsService.confirmReturn(id, dto, user);
  }

  @Get('asset/:assetId')
  @RequirePermissions('movements:read')
  findByAsset(@Param('assetId') assetId: string) {
    return this.movementsService.findByAsset(assetId);
  }

  @Get('pending')
  @RequirePermissions('movements:read')
  findPending() {
    return this.movementsService.findPending();
  }
}
