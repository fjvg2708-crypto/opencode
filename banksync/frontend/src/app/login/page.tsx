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
import { Logo } from "@/components/brand/Logo";
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
    <div className="min-h-screen bg-[#0033CC] flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #001f80 0%, #0033CC 50%, #0055ff 100%)" }}>

      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/3 rounded-full" />
      </div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Blue header panel with logo */}
        <div className="bg-[#0033CC] px-8 pt-10 pb-8 flex flex-col items-center"
          style={{ background: "linear-gradient(160deg, #001f80 0%, #0033CC 100%)" }}>
          <Logo size={80} variant="color" />
          <h1 className="text-white text-2xl font-bold mt-5 tracking-tight">DG BankSync</h1>
          <p className="text-blue-200 text-sm mt-1 tracking-widest uppercase font-medium">Portugal</p>
          <p className="text-blue-300 text-xs mt-3 opacity-80">Sistema interno de gestão financeira</p>
        </div>

        {/* Form panel */}
        <div className="px-8 py-8">

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
        </div>{/* /form panel */}
      </div>{/* /card */}
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
