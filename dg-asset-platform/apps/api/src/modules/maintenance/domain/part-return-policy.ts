import { Article, PartUsage } from '@prisma/client';

/**
 * Regra obrigatória (secção 14 do pedido): todas as peças substituídas numa
 * viatura do Grupo DG têm de regressar com a viatura ou ser entregues ao
 * responsável. Únicas exceções automáticas: óleos e filtros
 * (`Article.category ∈ {OIL, FILTER}`), registados automaticamente como
 * `EXEMPT`. Uma ordem de serviço de viatura não pode fechar enquanto
 * existir uma `PartUsage` sem essa contabilização — com foto e (quando
 * aplicável) aprovação do responsável.
 */

export class PartsNotAccountedForError extends Error {
  constructor(public readonly offendingPartUsageIds: string[]) {
    super(
      `A ordem de serviço não pode ser fechada: ${offendingPartUsageIds.length} peça(s) substituída(s) sem confirmação de devolução/entrega.`,
    );
  }
}

export function isExemptFromReturn(article: Pick<Article, 'category'> | null | undefined): boolean {
  return article?.category === 'OIL' || article?.category === 'FILTER';
}

export function derivePartUsageReturnStatus(
  article: Pick<Article, 'category'> | null | undefined,
  requested: PartUsage['returnStatus'] | undefined,
): PartUsage['returnStatus'] {
  if (isExemptFromReturn(article)) return 'EXEMPT';
  return requested ?? null;
}

export interface PartUsageAccountingCheck {
  id: string;
  returnStatus: PartUsage['returnStatus'];
  photoKey: string | null;
  dgConfirmed: boolean;
  nonReturnReason: string | null;
}

export function findUnaccountedPartUsages(usages: PartUsageAccountingCheck[]): string[] {
  return usages
    .filter((u) => {
      if (u.returnStatus === 'EXEMPT') return false;
      if (!u.returnStatus) return true;
      if (u.returnStatus === 'NOT_RETURNED_JUSTIFIED' && !u.nonReturnReason) return true;
      if ((u.returnStatus === 'RETURNED_TO_VEHICLE' || u.returnStatus === 'DELIVERED_TO_RESPONSIBLE') && !u.photoKey) {
        return true;
      }
      if ((u.returnStatus === 'RETURNED_TO_VEHICLE' || u.returnStatus === 'DELIVERED_TO_RESPONSIBLE') && !u.dgConfirmed) {
        return true;
      }
      return false;
    })
    .map((u) => u.id);
}

export function assertOrderCanClose(usages: PartUsageAccountingCheck[]): void {
  const offending = findUnaccountedPartUsages(usages);
  if (offending.length > 0) {
    throw new PartsNotAccountedForError(offending);
  }
}
