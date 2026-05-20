"use client";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, TrendingDown, CreditCard, Receipt, CheckSquare, ArrowLeftRight } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function DashboardPage() {
  const params = useSearchParams();
  const { selectedCompanyId } = useAuthStore();
  const companyId = params.get("company") || selectedCompanyId;

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", companyId],
    queryFn: () => api.get(`/dashboard/${companyId}`).then((r) => r.data),
    enabled: !!companyId,
  });

  if (!companyId) {
    return (
      <AppLayout>
        <Header title="Dashboard" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Selecione uma empresa na barra lateral</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Header title="Dashboard" subtitle={data?.company_name} />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="stat-card animate-pulse h-28 bg-gray-100" />
            ))}
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Saldo Total"
                value={formatCurrency(data.accounts.total_balance)}
                sub={`${data.accounts.total_accounts} conta(s)`}
                icon={<CreditCard className="h-5 w-5 text-blue-600" />}
                color="blue"
              />
              <StatCard
                title="Entradas (30d)"
                value={formatCurrency(data.transactions_30d.total_credits)}
                sub={`${data.transactions_30d.transaction_count} movimentos`}
                icon={<TrendingUp className="h-5 w-5 text-green-600" />}
                color="green"
              />
              <StatCard
                title="Saídas (30d)"
                value={formatCurrency(data.transactions_30d.total_debits)}
                sub={`Fluxo líquido: ${formatCurrency(data.transactions_30d.net_flow)}`}
                icon={<TrendingDown className="h-5 w-5 text-red-500" />}
                color="red"
              />
              <StatCard
                title="Factoring"
                value={formatCurrency(data.factoring.pending_amount)}
                sub={`${data.factoring.total_invoices} fatura(s) pendente(s)`}
                icon={<Receipt className="h-5 w-5 text-purple-600" />}
                color="purple"
              />
            </div>

            {/* Cash Flow Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Fluxo de Caixa — últimos 30 dias</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={data.cash_flow}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: any) => formatCurrency(v)} />
                      <Legend />
                      <Area type="monotone" dataKey="credits" name="Entradas" stroke="#10b981" fill="#d1fae5" stackId="1" />
                      <Area type="monotone" dataKey="debits" name="Saídas" stroke="#ef4444" fill="#fee2e2" stackId="2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Categorias de Despesa</CardTitle></CardHeader>
                <CardContent>
                  {data.category_breakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={data.category_breakdown} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80}>
                          {data.category_breakdown.map((_: any, i: number) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: any) => formatCurrency(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
                      Sem dados disponíveis
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Principais Contrapartes (30d)</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.top_counterparties.slice(0, 6).map((cp: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">{i + 1}</div>
                          <span className="text-sm text-gray-700 truncate max-w-[200px]">{cp.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(cp.total)}</span>
                      </div>
                    ))}
                    {data.top_counterparties.length === 0 && (
                      <p className="text-gray-400 text-sm text-center py-4">Sem dados</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Resumo Financeiro</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <SummaryRow label="Confirming — Pendente" value={formatCurrency(data.confirming.pending_amount)} color="blue" />
                    <SummaryRow label="Confirming — Pago" value={formatCurrency(data.confirming.paid_amount)} color="green" />
                    <SummaryRow label="Factoring — Adiantado" value={formatCurrency(data.factoring.advanced_amount)} color="purple" />
                    <SummaryRow label="Factoring — Total" value={formatCurrency(data.factoring.total_amount)} color="gray" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, sub, icon, color }: any) {
  const bg = { blue: "bg-blue-50", green: "bg-green-50", red: "bg-red-50", purple: "bg-purple-50" }[color];
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{sub}</p>
        </div>
        <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, color }: any) {
  const dot = { blue: "bg-blue-500", green: "bg-green-500", purple: "bg-purple-500", gray: "bg-gray-400" }[color];
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
