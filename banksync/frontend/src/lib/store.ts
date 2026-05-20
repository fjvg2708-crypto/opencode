import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  totp_enabled: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  selectedCompanyId: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setSelectedCompany: (id: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      selectedCompanyId: null,
      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("refresh_token", refreshToken);
        }
        set({ user, accessToken });
      },
      setSelectedCompany: (id) => set({ selectedCompanyId: id }),
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
        set({ user: null, accessToken: null, selectedCompanyId: null });
      },
    }),
    { name: "banksync-auth", partialize: (s) => ({ user: s.user, selectedCompanyId: s.selectedCompanyId }) }
  )
);
