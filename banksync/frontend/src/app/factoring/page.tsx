"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Layers, X, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";

export default function FactoringPage() {
  const params = useSearchParams();
  const { selectedCompanyId } = useAuthStore();
  const companyId = params.get("company") || selectedCompanyId;
  const qc = useQueryClient();
  const [tab, setTab] = useState<"invoices" | "batches">("invoices");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showBatch, setShowBatch] = useState(false);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["factoring-invoices", companyId],
    queryFn: () => api.get(`/factoring/${companyId}/invoices`).then((r) => r.data),
    enabled: !!companyId,
  });

  const { data: batches = [] } = useQuery({
    queryKey: ["factoring-batches", companyId],
    queryFn: () => api.get(`/factoring/${companyId}/batches`).then((r) => r.data),
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post(`/factoring/${companyId}/invoices`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["factoring-invoices"] }); setShowAdd(false); reset(); },
  });

  const batchMutation = useMutation({
    mutationFn: (d: any) => api.post(`/factoring/${companyId}/batches`, { ...d, invoice_ids: selectedInvoices }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["factoring-batches", "factoring-invoices"] }); setShowBatch(false); setSelectedInvoices([]); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/factoring/${companyId}/invoices/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["factoring-invoices"] }),
  });

  const { register, handleSubmit, reset } = useForm();
  const { register: batchRegister, handleSubmit: batchSubmit } = useForm();

  const totalPending = invoices.filter((i: any) => ["draft", "submitted"].includes(i.status))
    .reduce((s: number, i: any) => s + Number(i.net_amount), 0);

  return (
    <AppLayout>
      <Header title="Factoring" subtitle="Gestão de faturas para desconto" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="stat-card"><p className="text-sm text-gray-500">Total Faturas</p><p className="text-3xl font-bold mt-1">{invoices.length}</p></div>
          <div className="stat-card"><p className="text-sm text-gray-500">Valor Pendente</p><p className="text-3xl font-bold mt-1">{formatCurrency(totalPending)}</p></div>
          <div className="stat-card"><p className="text-sm text-gray-500">Total Lotes</p><p className="text-3xl font-bold mt-1">{batches.length}</p></div>
          <div className="stat-card"><p className="text-sm text-gray-500">Selecionadas</p><p className="text-3xl font-bold mt-1">{selectedInvoices.length}</p></div>
        </div>

        {/* Tabs + Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => setTab("invoices")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "invoices" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>Faturas</button>
            <button onClick={() => setTab("batches")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === "batches" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>Lotes</button>
          </div>
          <div className="flex gap-2">
            {selectedInvoices.length > 0 && (
              <Button variant="secondary" onClick={() => setShowBatch(true)}>
                <Layers className="h-4 w-4" /> Criar Lote ({selectedInvoices.length})
              </Button>
            )}
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" /> Nova Fatura
            </Button>
          </div>
        </div>

        {/* Add Form */}
        {showAdd && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nova Fatura de Factoring</CardTitle>
                <button onClick={() => setShowAdd(false)}><X className="h-4 w-4 text-gray-400" /></button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="grid grid-cols-3 gap-4">
                <Input label="N.º Fatura" {...register("invoice_number", { required: true })} />
                <Input label="Devedor" {...register("debtor_name", { required: true })} />
                <Input label="NIF Devedor" {...register("debtor_nif")} />
                <Input label="Data Fatura" type="date" {...register("invoice_date", { required: true })} />
                <Input label="Data Vencimento" type="date" {...register("due_date", { required: true })} />
                <Input label="Taxa Adiantamento (%)" type="number" step="0.01" {...register("advance_rate")} />
                <Input label="Valor Bruto (€)" type="number" step="0.01" {...register("gross_amount", { required: true })} />
                <Input label="IVA (€)" type="number" step="0.01" defaultValue="0" {...register("vat_amount")} />
                <Input label="Valor Líquido (€)" type="number" step="0.01" {...register("net_amount", { required: true })} />
                <div className="col-span-3 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancelar</Button>
                  <Button type="submit" loading={createMutation.isPending}>Guardar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Batch Form */}
        {showBatch && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Criar Lote de Factoring</CardTitle>
                <button onClick={() => setShowBatch(false)}><X className="h-4 w-4 text-gray-400" /></button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={batchSubmit((d) => batchMutation.mutate(d))} className="grid grid-cols-2 gap-4">
                <Input label="N.º Lote" {...batchRegister("batch_number", { required: true })} />
                <Input label="Nome do Factor" {...batchRegister("factor_name", { required: true })} />
                <div className="col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowBatch(false)}>Cancelar</Button>
                  <Button type="submit" loading={batchMutation.isPending}>Criar Lote</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {tab === "invoices" ? (
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="w-10 px-4 py-3"></th>
                      {["Fatura", "Devedor", "Data", "Vencimento", "Valor Líquido", "Taxa", "Estado", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invoices.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedInvoices.includes(inv.id)}
                            onChange={(e) => setSelectedInvoices(e.target.checked ? [...selectedInvoices, inv.id] : selectedInvoices.filter((i) => i !== inv.id))}
                            className="rounded" />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{inv.invoice_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{inv.debtor_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.invoice_date)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inv.due_date)}</td>
                        <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(inv.net_amount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{inv.advance_rate ? `${inv.advance_rate}%` : "—"}</td>
                        <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                        <td className="px-4 py-3">
                          {inv.status === "draft" && (
                            <button onClick={() => deleteMutation.mutate(inv.id)} className="text-red-400 hover:text-red-600 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">Nenhuma fatura registada</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Lote", "Factor", "Total", "Adiantado", "Faturas", "Estado", "Data"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {batches.map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{b.batch_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{b.factor_name}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(b.total_amount)}</td>
                      <td className="px-4 py-3 text-sm">{b.total_advanced ? formatCurrency(b.total_advanced) : "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{b.invoice_count}</td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(b.created_at)}</td>
                    </tr>
                  ))}
                  {batches.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Nenhum lote criado</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
