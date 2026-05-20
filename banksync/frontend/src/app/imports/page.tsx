"use client";
import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Upload, FileText, CheckCircle2, XCircle } from "lucide-react";

const ACCEPTED_TYPES = {
  "text/csv": [".csv"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "application/vnd.ms-excel": [".xls"],
  "text/plain": [".mt940", ".sta", ".ofx", ".qif"],
};

export default function ImportsPage() {
  const params = useSearchParams();
  const { selectedCompanyId } = useAuthStore();
  const companyId = params.get("company") || selectedCompanyId;
  const qc = useQueryClient();
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [uploadResult, setUploadResult] = useState<any>(null);

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", companyId],
    queryFn: () => api.get(`/banking/${companyId}/accounts`).then((r) => r.data),
    enabled: !!companyId,
  });

  const { data: imports = [], isLoading } = useQuery({
    queryKey: ["imports", companyId],
    queryFn: () => api.get(`/imports/${companyId}`).then((r) => r.data),
    enabled: !!companyId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      form.append("account_id", selectedAccountId);
      return api.post(`/imports/${companyId}/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data);
    },
    onSuccess: (data) => {
      setUploadResult(data);
      qc.invalidateQueries({ queryKey: ["imports", "transactions"] });
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!selectedAccountId) return;
      if (acceptedFiles[0]) uploadMutation.mutate(acceptedFiles[0]);
    },
    [selectedAccountId, uploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    disabled: !selectedAccountId || uploadMutation.isPending,
  });

  return (
    <AppLayout>
      <Header title="Importação de Ficheiros" subtitle="Importação manual de extratos bancários" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <Card>
          <CardHeader><CardTitle>Importar Extrato Bancário</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Conta de Destino</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Selecione uma conta —</option>
                {accounts.map((acc: any) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} {acc.iban ? `(${acc.iban})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-400 bg-blue-50" :
                !selectedAccountId ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60" :
                "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              {uploadMutation.isPending ? (
                <p className="text-sm text-blue-600 font-medium">A processar ficheiro...</p>
              ) : isDragActive ? (
                <p className="text-sm text-blue-600 font-medium">Largue o ficheiro aqui</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700">Arraste um ficheiro ou clique para selecionar</p>
                  <p className="text-xs text-gray-400 mt-1">CSV, XLSX, MT940, OFX, QIF (máx. 50 MB)</p>
                  {!selectedAccountId && <p className="text-xs text-red-400 mt-2">Selecione uma conta primeiro</p>}
                </>
              )}
            </div>

            {uploadResult && (
              <div className={`rounded-lg p-4 flex items-start gap-3 ${uploadResult.status === "completed" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                {uploadResult.status === "completed" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-medium ${uploadResult.status === "completed" ? "text-green-800" : "text-red-700"}`}>
                    {uploadResult.status === "completed" ? "Importação concluída!" : "Erro na importação"}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {uploadResult.records_imported} de {uploadResult.records_total} registos importados
                  </p>
                  {uploadResult.error_message && (
                    <p className="text-xs text-red-600 mt-1">{uploadResult.error_message}</p>
                  )}
                </div>
                <button onClick={() => setUploadResult(null)} className="ml-auto text-gray-400 hover:text-gray-600">×</button>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 mb-2">Formatos suportados:</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li><span className="font-mono font-bold">CSV/XLSX</span> — Exportações de banca online (BPI, Millennium, CGD, Santander)</li>
                <li><span className="font-mono font-bold">MT940</span> — Formato SWIFT para extratos bancários</li>
                <li><span className="font-mono font-bold">OFX/QIF</span> — Formatos de intercâmbio financeiro</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Histórico de Importações</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : imports.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma importação realizada</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Ficheiro", "Formato", "Importados", "Total", "Data", "Estado"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {imports.map((imp: any) => (
                    <tr key={imp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />{imp.filename}
                      </td>
                      <td className="px-4 py-3"><span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{imp.file_type.toUpperCase()}</span></td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">{imp.records_imported}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{imp.records_total}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(imp.created_at)}</td>
                      <td className="px-4 py-3"><StatusBadge status={imp.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
