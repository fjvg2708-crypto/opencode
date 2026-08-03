/**
 * Contrato que qualquer conector de sistema externo (PHC, Primavera, SAP,
 * Sage, Odoo, Dynamics, REST/SOAP genérico, CSV, SFTP, BD autorizada, ...)
 * tem de implementar. Nenhum módulo de negócio depende disto — apenas o
 * Integration Hub. Adicionar um conector novo nunca implica alterar
 * `assets`, `movements`, `maintenance`, etc. (regra obrigatória #13/#14).
 */
export interface ConnectorTestResult {
  ok: boolean;
  message?: string;
  latencyMs?: number;
}

export interface PullResult<T = unknown> {
  entityType: string;
  records: T[];
  cursor?: string;
}

export interface PushResult {
  entityType: string;
  externalId?: string;
  status: 'OK' | 'ERROR' | 'CONFLICT';
  message?: string;
}

export interface Connector {
  readonly name: string;

  test(): Promise<ConnectorTestResult>;

  pull(entityType: string, since?: Date, cursor?: string): Promise<PullResult>;

  push(entityType: string, payload: Record<string, unknown>): Promise<PushResult>;
}
