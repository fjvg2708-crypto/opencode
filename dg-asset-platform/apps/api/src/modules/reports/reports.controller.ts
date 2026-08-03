import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('fleet-status')
  @RequirePermissions('reports:read')
  fleetStatus() {
    return this.reportsService.fleetStatusSummary();
  }

  @Get('costs-by-asset')
  @RequirePermissions('reports:read')
  costsByAsset(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.costsByAsset(from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }

  @Get('costs-by-work')
  @RequirePermissions('reports:read')
  costsByWork(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.costsByWork(from ? new Date(from) : undefined, to ? new Date(to) : undefined);
  }

  @Get('breakdowns-open')
  @RequirePermissions('reports:read')
  breakdownsOpen() {
    return this.reportsService.openBreakdownsSummary();
  }

  @Get('parts-not-returned')
  @RequirePermissions('reports:read')
  partsNotReturned() {
    return this.reportsService.partsNotReturnedSummary();
  }

  @Get('monthly-direction')
  @RequirePermissions('reports:read')
  monthlyDirection(@Query('year') year: string, @Query('month') month: string) {
    return this.reportsService.monthlyDirectionReport(parseInt(year, 10), parseInt(month, 10));
  }
}
