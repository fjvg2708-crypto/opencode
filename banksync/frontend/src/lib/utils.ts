import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = "EUR") {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("pt-PT").format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("pt-PT", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

export const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  submitted: "Submetido",
  approved: "Aprovado",
  advanced: "Adiantado",
  collected: "Cobrado",
  cancelled: "Cancelado",
  sent: "Enviado",
  accepted: "Aceite",
  paid: "Pago",
  rejected: "Rejeitado",
  pending: "Pendente",
  processing: "A processar",
  completed: "Concluído",
  failed: "Falhado",
  partial: "Parcial",
  active: "Ativo",
  inactive: "Inativo",
  error: "Erro",
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  advanced: "bg-purple-100 text-purple-700",
  collected: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  paid: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  error: "bg-red-100 text-red-700",
};
