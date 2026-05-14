import {
  format,
  formatDistanceToNow,
  parseISO,
  isValid,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ---------------------------------------------------------------------------
// Currency formatting
// ---------------------------------------------------------------------------

/**
 * Format a numeric value as a localized currency string.
 *
 * @example
 * formatCurrency(1234567.89, 'BRL') // "R$ 1.234.567,89"
 * formatCurrency(1234567.89, 'USD') // "US$ 1,234,567.89"
 * formatCurrency(1234567.89, 'EUR') // "€ 1.234.567,89"
 */
export function formatCurrency(value: number, currency: string): string {
  const CURRENCY_LOCALE_MAP: Record<string, string> = {
    BRL: 'pt-BR',
    USD: 'en-US',
    EUR: 'pt-PT',
    ARS: 'es-AR',
    CLP: 'es-CL',
    PEN: 'es-PE',
    MXN: 'es-MX',
    COP: 'es-CO',
    UYU: 'es-UY',
    PYG: 'es-PY',
    BOB: 'es-BO',
    VEF: 'es-VE',
  };

  const locale = CURRENCY_LOCALE_MAP[currency] ?? 'pt-BR';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Fallback for unknown currency codes
    return `${currency} ${value.toFixed(2)}`;
  }
}

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

/**
 * Parse a date value (ISO string or Date object) into a Date, returning null
 * when the value cannot be parsed.
 */
function toDate(date: string | Date): Date | null {
  if (date instanceof Date) return isValid(date) ? date : null;
  const parsed = parseISO(date);
  return isValid(parsed) ? parsed : null;
}

/**
 * Format a date using date-fns format tokens. Defaults to 'dd/MM/yyyy'.
 *
 * @example
 * formatDate('2024-03-15')               // "15/03/2024"
 * formatDate('2024-03-15', 'MMMM yyyy') // "março 2024"
 */
export function formatDate(date: string | Date, fmt = 'dd/MM/yyyy'): string {
  const d = toDate(date);
  if (!d) return 'Data inválida';
  return format(d, fmt, { locale: ptBR });
}

// ---------------------------------------------------------------------------
// Relative time
// ---------------------------------------------------------------------------

/**
 * Return a human-friendly relative time string in Portuguese.
 *
 * @example
 * getRelativeTime(new Date(Date.now() - 7200000)) // "há 2 horas"
 */
export function getRelativeTime(date: string | Date): string {
  const d = toDate(date);
  if (!d) return 'Data inválida';
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

type StatusKey =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'delayed'
  | 'on_hold'
  | 'approved'
  | 'rejected'
  | 'draft'
  | 'review'
  | string;

const STATUS_COLOR_MAP: Record<string, string> = {
  active: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  inactive: 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/50',
  pending: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
  in_progress: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
  completed: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
  cancelled: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
  delayed: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
  on_hold: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
  approved: 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30',
  rejected: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30',
  draft: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800/50',
  review: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
};

/**
 * Return a Tailwind CSS class string for a given status.
 * Falls back to a neutral style for unknown statuses.
 */
export function getStatusColor(status: StatusKey): string {
  return STATUS_COLOR_MAP[status.toLowerCase()] ??
    'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/50';
}

const STATUS_LABEL_MAP: Record<string, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  delayed: 'Atrasado',
  on_hold: 'Suspenso',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
  draft: 'Rascunho',
  review: 'Em revisão',
};

/**
 * Return the Portuguese label for a given status key.
 * Falls back to a title-cased version of the raw status string.
 */
export function getStatusLabel(status: StatusKey): string {
  return (
    STATUS_LABEL_MAP[status.toLowerCase()] ??
    status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
  );
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

/**
 * Calculate a completion percentage, clamped between 0 and 100.
 *
 * @example
 * calculateProgress(3, 10) // 30
 * calculateProgress(0, 0)  // 0
 */
export function calculateProgress(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / total) * 100)));
}

// ---------------------------------------------------------------------------
// Quantity formatting
// ---------------------------------------------------------------------------

/**
 * Format a numeric quantity together with its unit label.
 *
 * @example
 * formatQuantity(1234.5, 'm²') // "1.234,50 m²"
 * formatQuantity(50, 'un')     // "50 un"
 */
export function formatQuantity(qty: number, unit: string): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(qty);
  return `${formatted} ${unit}`;
}

// ---------------------------------------------------------------------------
// Country flag emoji
// ---------------------------------------------------------------------------

/**
 * Convert a two-letter ISO 3166-1 alpha-2 country code to its flag emoji.
 *
 * @example
 * getCountryFlag('BR') // "🇧🇷"
 * getCountryFlag('PT') // "🇵🇹"
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🏳️';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 0x1f1e0 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

/**
 * Generate a random unique ID string.
 * Uses `crypto.randomUUID()` when available, otherwise falls back to a
 * Math.random-based approach for environments that lack the Web Crypto API.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---------------------------------------------------------------------------
// Group records by date
// ---------------------------------------------------------------------------

/**
 * Group an array of records by the date portion of a `date` or `createdAt`
 * field (ISO string). Returns a map of "dd/MM/yyyy" → records[].
 *
 * Records without a recognisable date field are placed under the key "Sem data".
 *
 * @example
 * groupByDate([
 *   { id: 1, createdAt: '2024-03-15T10:00:00Z' },
 *   { id: 2, date: '2024-03-15' },
 *   { id: 3, createdAt: '2024-03-16T08:00:00Z' },
 * ])
 * // {
 * //   '15/03/2024': [{ id: 1, ... }, { id: 2, ... }],
 * //   '16/03/2024': [{ id: 3, ... }],
 * // }
 */
export function groupByDate(
  records: Record<string, unknown>[],
): Record<string, Record<string, unknown>[]> {
  const groups: Record<string, Record<string, unknown>[]> = {};

  for (const record of records) {
    const rawDate =
      (record.date as string | Date | undefined) ??
      (record.createdAt as string | Date | undefined) ??
      (record.updatedAt as string | Date | undefined);

    let key = 'Sem data';

    if (rawDate) {
      const d = toDate(rawDate instanceof Date ? rawDate : String(rawDate));
      if (d) key = format(d, 'dd/MM/yyyy', { locale: ptBR });
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(record);
  }

  return groups;
}
