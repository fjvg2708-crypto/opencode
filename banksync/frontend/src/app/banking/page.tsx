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
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Plus, RefreshCw, Link2, Wallet, X } from "lucide-react";
import { useForm } from "react-hook-form";

export default function BankingPage() {
  const params = useSearchParams();
  const { selectedCompanyId } = useAuthStore();
  const companyId = params.get("company") || selectedCompanyId;
  const qc = useQueryClient();
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showConnectSE, setShowConnectSE] = useState(false);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts", companyId],
    queryFn: () => api.get(`/banking/${companyId}/accounts`).then((r) => r.data),
    enabled: !!companyId,
  });

  const { data: connections = [] } = useQuery({
    queryKey: ["connections", companyId],
    queryFn: () => api.get(`/banking/${companyId}/connections`).then((r) => r.data),
    enabled: !!companyId,
  });

  const addAccountMutation = useMutation({
    mutationFn: (data: any) => api.post(`/banking/${companyId}/accounts`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["accounts"] }); setShowAddAccount(false); },
  });

  const { register, handleSubmit, reset } = useForm();
  const onAddAccount = handleSubmit((data) => addAccountMutation.mutate(data));

  const totalBalance = accounts.reduce((s: number, a: any) => s + Number(a.balance), 0);

  return (
    <AppLayout>
      <Header title="Contas Bancárias" subtitle="Gestão de contas e ligações PSD2" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-sm text-gray-500">Total de Contas</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{accounts.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-gray-500">Saldo Total</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalBalance)}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-gray-500">Ligações Ativas</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {connections.filter((c: any) => c.status === "active").length}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={() => setShowConnectSE(true)} variant="primary">
            <Link2 className="h-4 w-4" /> Ligar via PSD2 (Salt Edge)
          </Button>
          <Button onClick={() => setShowAddAccount(true)} variant="outline">
            <Plus className="h-4 w-4" /> Adicionar Conta Manual
          </Button>
        </div>

        {/* Add Manual Account Form */}
        {showAddAccount && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nova Conta Manual</CardTitle>
                <button onClick={() => setShowAddAccount(false)}><X className="h-4 w-4 text-gray-400" /></button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={onAddAccount} className="grid grid-cols-2 gap-4">
                <Input label="Nome da Conta" {...register("name", { required: true })} />
                <Input label="IBAN" {...register("iban")} />
                <Input label="Banco" {...register("bank_name")} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moeda</label>
                  <select {...register("currency")} defaultValue="EUR" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddAccount(false)}>Cancelar</Button>
                  <Button type="submit" loading={addAccountMutation.isPending}>Criar Conta</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Salt Edge Connect Info */}
        {showConnectSE && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ligar Banco via PSD2</CardTitle>
                <button onClick={() => setShowConnectSE(false)}><X className="h-4 w-4 text-gray-400" /></button>
              </div>
            </CardHeader>
            <CardContent>
              <SaltEdgeConnectForm companyId={companyId!} onClose={() => setShowConnectSE(false)} />
            </CardContent>
          </Card>
        )}

        {/* Accounts List */}
        <Card>
          <CardHeader><CardTitle>Contas Configuradas</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-2">
                {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : accounts.length === 0 ? (
              <div className="p-12 text-center">
                <Wallet className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma conta configurada</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Conta", "IBAN", "Banco", "Tipo", "Saldo", "Último Sync", "Estado"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {accounts.map((acc: any) => (
                    <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{acc.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono text-xs">{acc.iban || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{acc.bank_name || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{acc.account_type}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(acc.balance, acc.currency)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{acc.last_synced_at ? formatDateTime(acc.last_synced_at) : "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={acc.is_active ? "active" : "inactive"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Connections */}
        {connections.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Ligações PSD2</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Banco", "Estado", "Última Sincronização", "Validade", "Ações"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {connections.map((conn: any) => (
                    <tr key={conn.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{conn.provider_name}</td>
                      <td className="px-4 py-3"><StatusBadge status={conn.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{conn.last_sync_at ? formatDateTime(conn.last_sync_at) : "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{conn.consent_expires_at ? formatDateTime(conn.consent_expires_at) : "—"}</td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost">
                          <RefreshCw className="h-3.5 w-3.5" /> Sincronizar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

function SaltEdgeConnectForm({ companyId, onClose }: { companyId: string; onClose: () => void }) {
  const [connectUrl, setConnectUrl] = useState<string | null>(null);
  const { register, handleSubmit } = useForm();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      api.post(`/banking/${companyId}/connections/salt-edge`, data, {
        params: { return_to: `${window.location.origin}/banking/callback` },
      }).then((r) => r.data),
    onSuccess: (data) => setConnectUrl(data.connect_url),
  });

  if (connectUrl) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-600 mb-4">Clique no botão abaixo para autorizar o acesso à sua conta bancária:</p>
        <a href={connectUrl} target="_blank" rel="noopener noreferrer">
          <Button>Abrir Portal de Autorização Bancária</Button>
        </a>
        <button onClick={onClose} className="block mt-3 text-sm text-gray-500 mx-auto hover:underline">Fechar</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid grid-cols-2 gap-4">
      <Input label="Nome do Banco" {...register("provider_name", { required: true })} placeholder="ex: Millennium BCP" />
      <Input label="Código do Banco (opcional)" {...register("provider_code")} placeholder="ex: millenniumbcp_pt" />
      <div className="col-span-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" loading={mutation.isPending}>Iniciar Ligação PSD2</Button>
      </div>
    </form>
  );
}
