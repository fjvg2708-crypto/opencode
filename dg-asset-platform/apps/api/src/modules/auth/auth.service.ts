import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { createHmac, randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateCredentials(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (!user || !user.active || user.deletedAt) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas.');
    return user;
  }

  /** Índice determinístico do refresh token (pepper + SHA-256) para permitir lookup direto sem scan; o token em si nunca é gravado. */
  private hashRefreshToken(token: string): string {
    const pepper = this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret';
    return createHmac('sha256', pepper).update(token).digest('hex');
  }

  private extractRolesAndPermissions(user: any) {
    const roles = user.roles.map((ur: any) => ur.role.name as string);
    const permissions = new Set<string>();
    for (const ur of user.roles) {
      for (const rp of ur.role.permissions) {
        permissions.add(`${rp.permission.module}:${rp.permission.action}`);
      }
    }
    return { roles, permissions: Array.from(permissions) };
  }

  async login(email: string, password: string) {
    const user = await this.validateCredentials(email, password);
    const { roles, permissions } = this.extractRolesAndPermissions(user);

    const payload = { sub: user.id, email: user.email, roles, permissions };
    const accessToken = this.jwt.sign(payload);

    const refreshToken = randomUUID();
    const ttlDays = 7;
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, roles, permissions },
    };
  }

  async refresh(presentedToken: string) {
    const tokenHash = this.hashRefreshToken(presentedToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revoked: false, expiresAt: { gt: new Date() } },
    });
    if (!stored) throw new UnauthorizedException('Refresh token inválido ou expirado.');

    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: stored.userId },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    const { roles, permissions } = this.extractRolesAndPermissions(user);
    const accessToken = this.jwt.sign({ sub: user.id, email: user.email, roles, permissions });

    const newRefreshToken = randomUUID();
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashRefreshToken(newRefreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }
}
