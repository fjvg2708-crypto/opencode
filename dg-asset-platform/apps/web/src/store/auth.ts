import { create } from 'zustand';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  tryRefresh: () => Promise<boolean>;
  hasPermission: (perm: string) => boolean;
}

const STORAGE_KEY = 'dg-auth';

function persist(state: Pick<AuthState, 'user' | 'accessToken' | 'refreshToken'>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadPersisted(): Pick<AuthState, 'user' | 'accessToken' | 'refreshToken'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, accessToken: null, refreshToken: null };
    return JSON.parse(raw);
  } catch {
    return { user: null, accessToken: null, refreshToken: null };
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...loadPersisted(),

  async login(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ message: 'Credenciais inválidas.' }));
      throw new Error(body.message ?? 'Não foi possível iniciar sessão.');
    }
    const data = await res.json();
    const next = { user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken };
    set(next);
    persist(next);
  },

  logout() {
    const next = { user: null, accessToken: null, refreshToken: null };
    set(next);
    localStorage.removeItem(STORAGE_KEY);
  },

  async tryRefresh() {
    const { refreshToken } = get();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) throw new Error('refresh failed');
      const data = await res.json();
      set((state) => {
        const next = { ...state, accessToken: data.accessToken, refreshToken: data.refreshToken };
        persist(next);
        return next;
      });
      return true;
    } catch {
      get().logout();
      return false;
    }
  },

  hasPermission(perm: string) {
    const { user } = get();
    if (!user) return false;
    return user.roles.includes('ADMIN') || user.permissions.includes(perm);
  },
}));
