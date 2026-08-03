import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BreakdownsService } from './breakdowns.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { ReportBreakdownDto, UpdateBreakdownStatusDto } from './dto/breakdown.dto';

@ApiTags('breakdowns')
@Controller('breakdowns')
export class BreakdownsController {
  constructor(private readonly breakdownsService: BreakdownsService) {}

  @Post()
  @RequirePermissions('breakdowns:create')
  report(@Body() dto: ReportBreakdownDto, @CurrentUser() user: AuthenticatedUser) {
    return this.breakdownsService.report(dto, user);
  }

  @Patch(':id/status')
  @RequirePermissions('breakdowns:update')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBreakdownStatusDto) {
    return this.breakdownsService.updateStatus(id, dto);
  }

  @Get('asset/:assetId')
  @RequirePermissions('breakdowns:read')
  findByAsset(@Param('assetId') assetId: string) {
    return this.breakdownsService.findByAsset(assetId);
  }

  @Get('open')
  @RequirePermissions('breakdowns:read')
  findOpen() {
    return this.breakdownsService.findOpen();
  }
}
