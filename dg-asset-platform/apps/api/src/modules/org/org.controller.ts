import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrgService } from './org.service';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CreateCostCenterDto, CreatePartnerDto, CreatePersonDto, CreateWarehouseDto, CreateWorkDto } from './dto/org.dto';

@ApiTags('org')
@Controller()
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Post('works')
  @RequirePermissions('works:create')
  createWork(@Body() dto: CreateWorkDto) {
    return this.orgService.createWork(dto);
  }

  @Get('works')
  @RequirePermissions('works:read')
  listWorks() {
    return this.orgService.listWorks();
  }

  @Post('warehouses')
  @RequirePermissions('works:create')
  createWarehouse(@Body() dto: CreateWarehouseDto) {
    return this.orgService.createWarehouse(dto);
  }

  @Get('warehouses')
  @RequirePermissions('works:read')
  listWarehouses() {
    return this.orgService.listWarehouses();
  }

  @Post('cost-centers')
  @RequirePermissions('works:create')
  createCostCenter(@Body() dto: CreateCostCenterDto) {
    return this.orgService.createCostCenter(dto);
  }

  @Get('cost-centers')
  @RequirePermissions('works:read')
  listCostCenters() {
    return this.orgService.listCostCenters();
  }

  @Post('persons')
  @RequirePermissions('partners:create')
  createPerson(@Body() dto: CreatePersonDto) {
    return this.orgService.createPerson(dto);
  }

  @Get('persons')
  @RequirePermissions('partners:read')
  listPersons() {
    return this.orgService.listPersons();
  }

  @Post('partners')
  @RequirePermissions('partners:create')
  createPartner(@Body() dto: CreatePartnerDto) {
    return this.orgService.createPartner(dto);
  }

  @Get('partners')
  @RequirePermissions('partners:read')
  listPartners(@Query('type') type?: 'SUPPLIER' | 'CLIENT' | 'WORKSHOP') {
    return this.orgService.listPartners(type);
  }
}
