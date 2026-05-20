"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Key, User, CheckCircle2, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<"profile" | "2fa" | "password">("profile");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.totp_enabled || false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { register: passReg, handleSubmit: passSubmit, reset: passReset } = useForm();
  const { register: twoFAReg, handleSubmit: twoFASubmit } = useForm();

  const setupMutation = useMutation({
    mutationFn: () => api.post("/auth/2fa/setup"),
    onSuccess: (r) => setQrCode(r.data.qr_code),
  });

  const enableMutation = useMutation({
    mutationFn: (code: string) => api.post("/auth/2fa/enable", { code }),
    onSuccess: () => { setTwoFAEnabled(true); setMsg({ type: "success", text: "2FA ativado com sucesso!" }); },
    onError: () => setMsg({ type: "error", text: "Código inválido" }),
  });

  const disableMutation = useMutation({
    mutationFn: (code: string) => api.post("/auth/2fa/disable", { code }),
    onSuccess: () => { setTwoFAEnabled(false); setQrCode(null); setMsg({ type: "success", text: "2FA desativado" }); },
    onError: () => setMsg({ type: "error", text: "Código inválido" }),
  });

  const changePwMutation = useMutation({
    mutationFn: (d: any) => api.post("/auth/change-password", d),
    onSuccess: () => { passReset(); setMsg({ type: "success", text: "Senha alterada com sucesso!" }); },
    onError: (e: any) => setMsg({ type: "error", text: e.response?.data?.detail || "Erro ao alterar senha" }),
  });

  return (
    <AppLayout>
      <Header title="Definições" subtitle="Conta e segurança" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: "profile", label: "Perfil", icon: User },
            { key: "2fa", label: "Autenticação 2FA", icon: Shield },
            { key: "password", label: "Alterar Senha", icon: Key },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setTab(key as any); setMsg(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>

        {msg && (
          <div className={`rounded-lg p-4 flex items-center gap-3 ${msg.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            {msg.type === "success" ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-500" />}
            <span className={`text-sm font-medium ${msg.type === "success" ? "text-green-800" : "text-red-700"}`}>{msg.text}</span>
          </div>
        )}

        {tab === "profile" && (
          <Card>
            <CardHeader><CardTitle>Informação da Conta</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{user?.full_name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium capitalize">{user?.role}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">2FA</p>
                  <p className={`font-medium ${twoFAEnabled ? "text-green-600" : "text-gray-600"}`}>
                    {twoFAEnabled ? "Ativo" : "Inativo"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 text-xs mb-1">Versão</p>
                  <p className="font-medium text-gray-600">1.0.0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "2fa" && (
          <Card>
            <CardHeader><CardTitle>Autenticação de Dois Fatores (TOTP)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {twoFAEnabled ? (
                <>
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">2FA está ativo</p>
                      <p className="text-xs text-green-600">A sua conta está protegida com autenticação de dois fatores</p>
                    </div>
                  </div>
                  <form onSubmit={twoFASubmit((d) => disableMutation.mutate(d.code))} className="space-y-3">
                    <Input label="Código TOTP para desativar" {...twoFAReg("code", { required: true })} placeholder="000000" maxLength={6} />
                    <Button type="submit" variant="danger" loading={disableMutation.isPending}>Desativar 2FA</Button>
                  </form>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Proteja a sua conta com um código de uso único gerado pela app Google Authenticator ou similar.
                  </p>
                  {!qrCode ? (
                    <Button onClick={() => setupMutation.mutate()} loading={setupMutation.isPending}>
                      <Shield className="h-4 w-4" /> Configurar 2FA
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <img src={`data:image/png;base64,${qrCode}`} alt="QR Code 2FA" className="w-48 h-48 border rounded-lg p-2" />
                      </div>
                      <p className="text-sm text-gray-600 text-center">
                        Digitalize o QR Code com a sua app de autenticação e insira o código gerado:
                      </p>
                      <form onSubmit={twoFASubmit((d) => enableMutation.mutate(d.code))} className="space-y-3">
                        <Input label="Código de verificação" {...twoFAReg("code", { required: true })} placeholder="000000" maxLength={6} />
                        <Button type="submit" loading={enableMutation.isPending}>Verificar e Ativar</Button>
                      </form>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {tab === "password" && (
          <Card>
            <CardHeader><CardTitle>Alterar Senha</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={passSubmit((d) => changePwMutation.mutate(d))} className="space-y-4">
                <Input label="Senha atual" type="password" {...passReg("current_password", { required: true })} />
                <Input label="Nova senha" type="password" {...passReg("new_password", { required: true, minLength: 8 })} />
                <Button type="submit" loading={changePwMutation.isPending}>
                  <Key className="h-4 w-4" /> Alterar Senha
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* PHC Integration Note */}
        <Card>
          <CardHeader><CardTitle>Integração PHC (Futura)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Módulo em desenvolvimento</p>
                <p className="text-xs text-yellow-700 mt-1">
                  A integração com o PHC CS/GO será disponibilizada numa versão futura.
                  Os campos <code className="font-mono bg-yellow-100 px-1 rounded">phc_code</code>, <code className="font-mono bg-yellow-100 px-1 rounded">phc_invoice_id</code> e <code className="font-mono bg-yellow-100 px-1 rounded">phc_purchase_id</code> já estão preparados na estrutura de dados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
