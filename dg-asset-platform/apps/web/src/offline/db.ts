import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface QueuedOperation {
  clientOperationId: string;
  type: 'MOVEMENT' | 'BREAKDOWN' | 'ASSET_READING' | 'QR_SCAN';
  payload: Record<string, unknown>;
  createdAt: string;
  status: 'QUEUED' | 'SYNCING' | 'SYNCED' | 'ERROR';
  errorMessage?: string;
}

interface CachedAsset {
  id: string;
  data: unknown;
  cachedAt: string;
}

interface DgOfflineDb extends DBSchema {
  operations: { key: string; value: QueuedOperation; indexes: { 'by-status': string } };
  assetsCache: { key: string; value: CachedAsset };
}

let dbPromise: Promise<IDBPDatabase<DgOfflineDb>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<DgOfflineDb>('dg-asset-platform', 1, {
      upgrade(db) {
        const store = db.createObjectStore('operations', { keyPath: 'clientOperationId' });
        store.createIndex('by-status', 'status');
        db.createObjectStore('assetsCache', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

/** Enfileira uma operação registada offline (secção 24) para envio posterior. */
export async function enqueueOperation(op: Omit<QueuedOperation, 'createdAt' | 'status'>) {
  const db = await getDb();
  await db.put('operations', { ...op, createdAt: new Date().toISOString(), status: 'QUEUED' });
}

export async function listQueuedOperations(): Promise<QueuedOperation[]> {
  const db = await getDb();
  return db.getAllFromIndex('operations', 'by-status', 'QUEUED');
}

export async function markOperationStatus(clientOperationId: string, status: QueuedOperation['status'], errorMessage?: string) {
  const db = await getDb();
  const existing = await db.get('operations', clientOperationId);
  if (!existing) return;
  await db.put('operations', { ...existing, status, errorMessage });
}

export async function cacheAsset(id: string, data: unknown) {
  const db = await getDb();
  await db.put('assetsCache', { id, data, cachedAt: new Date().toISOString() });
}

export async function getCachedAsset(id: string) {
  const db = await getDb();
  return db.get('assetsCache', id);
}

export function generateClientOperationId(): string {
  return crypto.randomUUID();
}
