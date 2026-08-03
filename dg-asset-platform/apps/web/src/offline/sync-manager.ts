import { api } from '../api/client';
import { listQueuedOperations, markOperationStatus, type QueuedOperation } from './db';

export interface SyncSummary {
  applied: number;
  alreadyApplied: number;
  errors: number;
}

/**
 * Envia a fila local para /sync/batch quando há ligação. Idempotente:
 * reenviar a mesma operação nunca duplica dados no servidor (secção 24).
 */
export async function syncOfflineQueue(): Promise<SyncSummary> {
  const pending = await listQueuedOperations();
  if (pending.length === 0) return { applied: 0, alreadyApplied: 0, errors: 0 };

  const operations = pending.map((op) => ({
    clientOperationId: op.clientOperationId,
    type: op.type,
    payload: op.payload,
  }));

  const results = await api.post<
    { clientOperationId: string; status: 'APPLIED' | 'ALREADY_APPLIED' | 'ERROR'; errorMessage?: string }[]
  >('/sync/batch', { operations });

  const summary: SyncSummary = { applied: 0, alreadyApplied: 0, errors: 0 };
  for (const result of results) {
    if (result.status === 'ERROR') {
      summary.errors++;
      await markOperationStatus(result.clientOperationId, 'ERROR', result.errorMessage);
    } else {
      if (result.status === 'APPLIED') summary.applied++;
      else summary.alreadyApplied++;
      await markOperationStatus(result.clientOperationId, 'SYNCED');
    }
  }
  return summary;
}

export function watchConnectivity(onOnline: () => void) {
  window.addEventListener('online', onOnline);
  return () => window.removeEventListener('online', onOnline);
}

export type { QueuedOperation };
