"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, ArrowUpCircle, ArrowDownCircle, Filter } from "lucide-react";

export default function TransactionsPage() {
  const params = useSearchParams();
  const { selectedCompanyId } = useAuthStore();
  const companyId = params.get("company") || selectedCompanyId;
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", companyId],
    queryFn: () => api.get(`/banking/${companyId}/accounts`).then((r) => r.data),
    enabled: !!companyId,
  });

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", companyId, search, startDate, endDate, page],
    queryFn: () =>
      api.get(`/banking/${companyId}/transactions`, {
        params: { search: search || undefined, start_date: startDate || undefined, end_date: endDate || undefined, page, page_size: 50 },
      }).then((r) => r.data),
    enabled: !!companyId,
  });

  return (
    <AppLayout>
      <Header title="Movimentos Bancários" subtitle="Consulta de transações por empresa" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex gap-3 flex-wrap items-end">
              <div className="flex-1 min-w-48">
                <Input
                  label="Pesquisa"
                  placeholder="Descrição ou contraparte..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div>
                <Input label="Data início" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Input label="Data fim" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <Button variant="outline" onClick={() => { setSearch(""); setStartDate(""); setEndDate(""); setPage(1); }}>
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center text-gray-500">Nenhum movimento encontrado</div>
            ) : (
              <>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Data", "Descrição", "Contraparte", "Referência", "Tipo", "Valor", "Saldo"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map((txn: any) => (
                      <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(txn.booking_date)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-[250px] truncate">{txn.description || "—"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[180px] truncate">{txn.counterparty_name || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono">{txn.reference || "—"}</td>
                        <td className="px-4 py-3">
                          {txn.transaction_type === "credit" ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                              <ArrowUpCircle className="h-3.5 w-3.5" /> Crédito
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                              <ArrowDownCircle className="h-3.5 w-3.5" /> Débito
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-sm font-semibold ${txn.transaction_type === "credit" ? "text-green-600" : "text-red-500"}`}>
                          {txn.transaction_type === "credit" ? "+" : "-"}{formatCurrency(txn.amount, txn.currency)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {txn.balance_after != null ? formatCurrency(txn.balance_after, txn.currency) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500">{transactions.length} resultado(s)</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
                    <Button size="sm" variant="outline" disabled={transactions.length < 50} onClick={() => setPage((p) => p + 1)}>Próximo</Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
