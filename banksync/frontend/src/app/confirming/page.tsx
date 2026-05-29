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
import { Plus, Send, X, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";

export default function ConfirmingPage() {
  const params = useSearchParams();
  const { selectedCompanyId } = useAuthStore();
  const companyId = params.get("company") || selectedCompanyId;
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["confirming-orders", companyId],
    queryFn: () => api.get(`/confirming/${companyId}/orders`).then((r) => r.data),
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post(`/confirming/${companyId}/orders`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["confirming-orders"] }); setShowAdd(false); reset(); },
  });

  const sendMutation = useMutation({
    mutationFn: (id: string) => api.post(`/confirming/${companyId}/orders/${id}/send`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["confirming-orders"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/confirming/${companyId}/orders/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["confirming-orders"] }),
  });

  const { register, handleSubmit, reset } = useForm();

  const totalPending = orders.filter((o: any) => ["draft", "sent"].includes(o.status))
    .reduce((s: number, o: any) => s + Number(o.net_amount), 0);
  const totalPaid = orders.filter((o: any) => o.status === "paid")
    .reduce((s: number, o: any) => s + Number(o.net_amount), 0);

  return (
    <AppLayout>
      <Header title="Confirming" subtitle="Gestão de ordens de pagamento a fornecedores" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="stat-card"><p className="text-sm text-gray-500">Total Ordens</p><p className="text-3xl font-bold mt-1">{orders.length}</p></div>
          <div className="stat-card"><p className="text-sm text-gray-500">Valor Pendente</p><p className="text-3xl font-bold mt-1">{formatCurrency(totalPending)}</p></div>
          <div className="stat-card"><p className="text-sm text-gray-500">Valor Pago</p><p className="text-3xl font-bold mt-1">{formatCurrency(totalPaid)}</p></div>
          <div className="stat-card">
            <p className="text-sm text-gray-500">Ordens Rascunho</p>
            <p className="text-3xl font-bold mt-1">{orders.filter((o: any) => o.status === "draft").length}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" /> Nova Ordem
          </Button>
        </div>

        {showAdd && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nova Ordem de Confirming</CardTitle>
                <button onClick={() => setShowAdd(false)}><X className="h-4 w-4 text-gray-400" /></button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="grid grid-cols-3 gap-4">
                <Input label="N.º Ordem" {...register("order_number", { required: true })} />
                <Input label="Banco" {...register("bank_name", { required: true })} />
                <Input label="Fornecedor" {...register("supplier_name", { required: true })} />
                <Input label="NIF Fornecedor" {...register("supplier_nif")} />
                <Input label="IBAN Fornecedor" {...register("supplier_iban")} />
                <Input label="N.º Fatura" {...register("invoice_number", { required: true })} />
                <Input label="Data Fatura" type="date" {...register("invoice_date", { required: true })} />
                <Input label="Data Vencimento" type="date" {...register("due_date", { required: true })} />
                <Input label="Desc. Pagamento Antecipado (%)" type="number" step="0.01" {...register("early_payment_discount")} />
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

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Ordem", "Banco", "Fornecedor", "Fatura", "Vencimento", "Valor Líquido", "Desc. %", "Estado", "Ações"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.order_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.bank_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.supplier_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.invoice_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(order.due_date)}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(order.net_amount)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.early_payment_discount ? `${order.early_payment_discount}%` : "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {order.status === "draft" && (
                            <>
                              <button onClick={() => sendMutation.mutate(order.id)} title="Enviar ao banco"
                                className="text-blue-400 hover:text-blue-600 transition-colors">
                                <Send className="h-4 w-4" />
                              </button>
                              <button onClick={() => deleteMutation.mutate(order.id)} title="Eliminar"
                                className="text-red-400 hover:text-red-600 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">Nenhuma ordem registada</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
