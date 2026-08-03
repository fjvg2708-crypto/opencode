import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { generateInternalCode } from '../assets/domain/internal-code.util';
import { CreateCostCenterDto, CreatePartnerDto, CreatePersonDto, CreateWarehouseDto, CreateWorkDto } from './dto/org.dto';

@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  // Obras
  createWork(dto: CreateWorkDto) {
    return this.prisma.work.create({
      data: { ...dto, internalCode: generateInternalCode('OB') },
    });
  }
  listWorks() {
    return this.prisma.work.findMany({ where: { deletedAt: null } });
  }

  // Armazéns
  createWarehouse(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({
      data: { ...dto, internalCode: generateInternalCode('AR') },
    });
  }
  listWarehouses() {
    return this.prisma.warehouse.findMany({ where: { deletedAt: null } });
  }

  // Centros de custo
  createCostCenter(dto: CreateCostCenterDto) {
    return this.prisma.costCenter.create({
      data: { ...dto, internalCode: generateInternalCode('CC') },
    });
  }
  listCostCenters() {
    return this.prisma.costCenter.findMany();
  }

  // Colaboradores
  createPerson(dto: CreatePersonDto) {
    return this.prisma.person.create({
      data: { ...dto, internalCode: generateInternalCode('COL') },
    });
  }
  listPersons() {
    return this.prisma.person.findMany({ where: { deletedAt: null } });
  }

  // Parceiros: fornecedores, clientes, oficinas
  createPartner(dto: CreatePartnerDto) {
    return this.prisma.partner.create({
      data: { ...dto, internalCode: generateInternalCode('PT') },
    });
  }
  listPartners(type?: 'SUPPLIER' | 'CLIENT' | 'WORKSHOP') {
    return this.prisma.partner.findMany({
      where: { deletedAt: null, ...(type ? { type } : {}) },
    });
  }
}
