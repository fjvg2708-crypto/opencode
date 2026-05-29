"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Plus, Building2, X } from "lucide-react";
import { useForm } from "react-hook-form";

export default function CompaniesPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const { user } = useAuthStore();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => api.get("/companies").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => api.post("/companies", d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["companies"] }); setShowAdd(false); reset(); },
  });

  const { register, handleSubmit, reset } = useForm();

  return (
    <AppLayout>
      <Header title="Empresas" subtitle="Gestão de empresas do grupo" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{companies.length} empresa(s) registada(s)</p>
          {["admin", "superadmin"].includes(user?.role || "") && (
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" /> Nova Empresa
            </Button>
          )}
        </div>

        {showAdd && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Registar Nova Empresa</CardTitle>
                <button onClick={() => setShowAdd(false)}><X className="h-4 w-4 text-gray-400" /></button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="grid grid-cols-2 gap-4">
                <Input label="Nome" {...register("name", { required: true })} />
                <Input label="NIF" {...register("nif", { required: true })} placeholder="500000000" />
                <Input label="Email" type="email" {...register("email")} />
                <Input label="Telefone" {...register("phone")} />
                <Input label="Código PHC (futuro)" {...register("phc_code")} />
                <div className="col-span-2">
                  <Input label="Morada" {...register("address")} />
                </div>
                <div className="col-span-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancelar</Button>
                  <Button type="submit" loading={createMutation.isPending}>Criar Empresa</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-40" />
            ))
          ) : companies.map((c: any) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-blue-200 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <StatusBadge status={c.is_active ? "active" : "inactive"} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{c.name}</h3>
              <p className="text-sm text-gray-500 mb-3">NIF: {c.nif}</p>
              <div className="space-y-1 text-xs text-gray-500">
                {c.email && <p>{c.email}</p>}
                {c.phone && <p>{c.phone}</p>}
                {c.phc_code && <p className="font-mono">PHC: {c.phc_code}</p>}
              </div>
              <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
                Desde {formatDate(c.created_at)}
              </p>
            </div>
          ))}
        </div>

        {!isLoading && companies.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma empresa registada</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
