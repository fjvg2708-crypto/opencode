import { PrismaClient, RoleName } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const MODULES = [
  'assets',
  'qrcode',
  'movements',
  'maintenance',
  'breakdowns',
  'stock',
  'documents',
  'works',
  'partners',
  'reports',
  'alerts',
  'users',
  'integrations',
  'audit',
];
const ACTIONS = ['create', 'read', 'update', 'delete', 'validate', 'close', 'issue', 'reprint', 'manage'];

// Permissões concedidas por papel — "*" = todas as ações do módulo.
const ROLE_GRANTS: Record<RoleName, Record<string, string[] | '*'>> = {
  ADMIN: Object.fromEntries(MODULES.map((m) => [m, '*'])) as any,
  DIRECTION: Object.fromEntries(MODULES.map((m) => [m, ['read']])) as any,
  FLEET_MANAGER: {
    assets: '*', qrcode: '*', movements: '*', maintenance: '*', breakdowns: '*',
    documents: '*', reports: ['read'], alerts: ['read', 'update'], works: ['read'], partners: ['read'],
  },
  EQUIPMENT_MANAGER: {
    assets: '*', qrcode: '*', movements: '*', maintenance: '*', breakdowns: '*',
    stock: ['read'], documents: '*', reports: ['read'], alerts: ['read', 'update'],
  },
  SITE_SUPERVISOR: {
    assets: ['read'], movements: ['create', 'read'], breakdowns: ['create', 'read'],
    maintenance: ['read'], documents: ['read'],
  },
  WAREHOUSE_MANAGER: { stock: '*', assets: ['read', 'update'], movements: ['create', 'read'], works: ['read'] },
  MECHANIC: { maintenance: ['create', 'read', 'update'], assets: ['read'], breakdowns: ['read', 'update'] },
  WORKSHOP: { maintenance: ['read', 'update'], assets: ['read'] },
  DRIVER: { assets: ['read'], movements: ['create', 'read'], breakdowns: ['create', 'read'] },
  OPERATOR: { assets: ['read'], movements: ['create', 'read'], breakdowns: ['create', 'read'] },
  EMPLOYEE: { assets: ['read'], breakdowns: ['create', 'read'] },
  AUDITOR: { audit: ['read'], reports: ['read'], assets: ['read'] },
  INTEGRATION_TECH: { integrations: '*', audit: ['read'] },
};

async function main() {
  console.log('A semear permissões e papéis...');

  const permissionByKey = new Map<string, { id: string }>();
  for (const module of MODULES) {
    for (const action of ACTIONS) {
      const permission = await prisma.permission.upsert({
        where: { module_action: { module, action } },
        create: { module, action },
        update: {},
      });
      permissionByKey.set(`${module}:${action}`, permission);
    }
  }

  for (const roleName of Object.keys(ROLE_GRANTS) as RoleName[]) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      create: { name: roleName },
      update: {},
    });

    const grants = ROLE_GRANTS[roleName];
    for (const [module, actions] of Object.entries(grants)) {
      const resolvedActions = actions === '*' ? ACTIONS : actions;
      for (const action of resolvedActions) {
        const permission = permissionByKey.get(`${module}:${action}`);
        if (!permission) continue;
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
          create: { roleId: role.id, permissionId: permission.id },
          update: {},
        });
      }
    }
  }

  console.log('A criar utilizador administrador de arranque...');
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: 'ADMIN' } });
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@grupodg.pt';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'MudarNoPrimeiroLogin!123';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Administrador Grupo DG',
        email: adminEmail,
        passwordHash: await argon2.hash(adminPassword),
        internalCode: 'USR-ADMIN-0001',
        roles: { create: [{ roleId: adminRole.id }] },
      },
    });
    console.log(`Utilizador administrador criado: ${adminEmail} (defina SEED_ADMIN_PASSWORD em produção).`);
  }

  console.log('A semear artigos de exemplo (óleos/filtros, exceção da regra de devolução)...');
  await prisma.article.upsert({
    where: { internalCode: 'ART-SEED-OLEO' },
    create: { internalCode: 'ART-SEED-OLEO', name: 'Óleo motor 5W30', category: 'OIL', unit: 'L' },
    update: {},
  });
  await prisma.article.upsert({
    where: { internalCode: 'ART-SEED-FILTRO' },
    create: { internalCode: 'ART-SEED-FILTRO', name: 'Filtro de óleo', category: 'FILTER', unit: 'UN' },
    update: {},
  });

  console.log('Seed concluído.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
