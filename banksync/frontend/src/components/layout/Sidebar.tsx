"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import {
  LayoutDashboard, Building2, CreditCard, ArrowLeftRight,
  FileUp, Receipt, CheckSquare, Settings, LogOut, ChevronDown
} from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { LogoFull } from "@/components/brand/Logo";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/banking", label: "Contas Bancárias", icon: CreditCard },
  { href: "/transactions", label: "Movimentos", icon: ArrowLeftRight },
  { href: "/factoring", label: "Factoring", icon: Receipt },
  { href: "/confirming", label: "Confirming", icon: CheckSquare },
  { href: "/imports", label: "Importação", icon: FileUp },
  { href: "/companies", label: "Empresas", icon: Building2 },
  { href: "/settings", label: "Definições", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, selectedCompanyId, setSelectedCompany, logout } = useAuthStore();
  const [companyOpen, setCompanyOpen] = useState(false);

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: () => api.get("/companies").then((r) => r.data),
    enabled: !!user,
  });

  const selectedCompany = companies.find((c: any) => c.id === selectedCompanyId);

  return (
    <aside className="flex flex-col w-64 min-h-screen text-white"
      style={{ background: "linear-gradient(180deg, #001f80 0%, #0033CC 60%, #0044ee 100%)" }}>

      {/* Logo header */}
      <div className="px-5 py-5 border-b border-white/10">
        <LogoFull size={40} textColor="white" />
      </div>

      {/* Company selector */}
      <div className="px-4 py-3 border-b border-white/10">
        <button
          onClick={() => setCompanyOpen(!companyOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
        >
          <span className="truncate">{selectedCompany?.name || "Selecionar empresa"}</span>
          <ChevronDown className={cn("h-4 w-4 flex-shrink-0 transition-transform", companyOpen && "rotate-180")} />
        </button>
        {companyOpen && (
          <div className="mt-1 bg-[#001f80] rounded-lg overflow-hidden">
            {companies.map((c: any) => (
              <button
                key={c.id}
                onClick={() => { setSelectedCompany(c.id); setCompanyOpen(false); }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors",
                  c.id === selectedCompanyId && "bg-white/15 font-medium"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={selectedCompanyId ? `${href}?company=${selectedCompanyId}` : href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-white/20 text-white font-semibold shadow-sm"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-white/20 border border-white/30 rounded-full flex items-center justify-center text-xs font-bold uppercase">
            {user?.full_name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-white/50 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
