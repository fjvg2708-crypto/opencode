import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Marca um endpoint com a permissão granular "modulo:acao" necessária
 * (ex. "assets:create", "maintenance:close", "qrcode:reprint").
 * Avaliado pelo PermissionsGuard contra as permissões do utilizador autenticado.
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
