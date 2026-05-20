"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const qc = new QueryClient();

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Obrigatório"),
  totp_code: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError("");
    try {
      const resp = await api.post("/auth/login", data);
      if (resp.data.requires_2fa) {
        setRequires2FA(true);
        return;
      }
      const { access_token, refresh_token } = resp.data;
      const me = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setAuth(me.data, access_token, refresh_token);
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e.response?.data?.detail || "Erro ao iniciar sessão");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">DG</div>
          <h1 className="text-2xl font-bold text-gray-900">DG BankSync Portugal</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema interno de gestão financeira</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            id="email"
            placeholder="utilizador@empresa.pt"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Senha"
            type="password"
            id="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          {requires2FA && (
            <Input
              label="Código 2FA"
              id="totp_code"
              placeholder="000000"
              maxLength={6}
              error={errors.totp_code?.message}
              {...register("totp_code")}
            />
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" loading={isSubmitting}>
            {requires2FA ? "Verificar 2FA" : "Iniciar Sessão"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <QueryClientProvider client={qc}>
      <LoginForm />
    </QueryClientProvider>
  );
}
