import { Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { generateInternalCode } from '../assets/domain/internal-code.util';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await argon2.hash(dto.password);
    const roles = await this.prisma.role.findMany({ where: { name: { in: dto.roles } } });

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        internalCode: generateInternalCode('USR'),
        roles: { create: roles.map((role) => ({ roleId: role.id })) },
      },
      select: { id: true, name: true, email: true, internalCode: true, active: true },
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      where: { deletedAt: null },
      include: { roles: { include: { role: true } } },
    });
  }

  async findOneOrThrow(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException('Utilizador não encontrado.');
    return user;
  }

  async deactivate(id: string) {
    await this.findOneOrThrow(id);
    return this.prisma.user.update({ where: { id }, data: { active: false } });
  }
}
