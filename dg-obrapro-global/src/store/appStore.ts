import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// TODO: Replace these inline types with imports from '../types' once that file is created.

// ---------------------------------------------------------------------------
// Inline type definitions
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'engineer' | 'viewer';
  avatar?: string;
  country: string;
  companyIds: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  projectId?: string;
  companyId?: string;
}

export interface DateRange {
  from: string | null;
  to: string | null;
}

export interface Filters {
  dateRange: DateRange;
  statusFilter: string[];
  countryFilter: string[];
}

// ---------------------------------------------------------------------------
// Mock users for login simulation
// ---------------------------------------------------------------------------

const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'usr-001',
    name: 'Diego Gonçalves',
    email: 'diego@dgobrapro.com',
    password: 'admin123',
    role: 'admin',
    avatar: undefined,
    country: 'BR',
    companyIds: ['cmp-001', 'cmp-002', 'cmp-003'],
  },
  {
    id: 'usr-002',
    name: 'Ana Silva',
    email: 'ana@construtora.com.br',
    password: 'manager123',
    role: 'manager',
    avatar: undefined,
    country: 'BR',
    companyIds: ['cmp-001'],
  },
  {
    id: 'usr-003',
    name: 'Carlos Mendes',
    email: 'carlos@construcoes.pt',
    password: 'engineer123',
    role: 'engineer',
    avatar: undefined,
    country: 'PT',
    companyIds: ['cmp-002'],
  },
  {
    id: 'usr-004',
    name: 'Lucía Fernández',
    email: 'lucia@obras.ar',
    password: 'viewer123',
    role: 'viewer',
    avatar: undefined,
    country: 'AR',
    companyIds: ['cmp-003'],
  },
];

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  authError: string | null;
}

interface AppState {
  darkMode: boolean;
  selectedCountry: string | null;
  selectedCompany: string | null;
  selectedProject: string | null;
}

interface NotificationsState {
  notifications: Notification[];
}

interface FiltersState {
  filters: Filters;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearAuthError: () => void;
}

interface AppActions {
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
  setSelectedCountry: (country: string | null) => void;
  setSelectedCompany: (companyId: string | null) => void;
  setSelectedProject: (projectId: string | null) => void;
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface FilterActions {
  setDateRange: (range: DateRange) => void;
  setStatusFilter: (statuses: string[]) => void;
  setCountryFilter: (countries: string[]) => void;
  resetFilters: () => void;
}

// ---------------------------------------------------------------------------
// Combined store type
// ---------------------------------------------------------------------------

type AppStore = AuthState &
  AppState &
  NotificationsState &
  FiltersState &
  AuthActions &
  AppActions &
  NotificationActions &
  FilterActions;

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

const DEFAULT_FILTERS: Filters = {
  dateRange: { from: null, to: null },
  statusFilter: [],
  countryFilter: [],
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    title: 'Prazo se aproximando',
    message: 'O projeto "Edifício Central" tem prazo em 3 dias.',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    projectId: 'prj-001',
  },
  {
    id: 'notif-002',
    title: 'Orçamento excedido',
    message: 'O projeto "Residencial Norte" ultrapassou 85% do orçamento.',
    type: 'error',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 h ago
    projectId: 'prj-002',
  },
  {
    id: 'notif-003',
    title: 'Etapa concluída',
    message: 'A fundação do "Complexo Industrial" foi concluída com sucesso.',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    projectId: 'prj-003',
  },
];

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

let notificationCounter = 100;

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ---- Auth state ----
        currentUser: null,
        isAuthenticated: false,
        authError: null,

        login: async (email: string, password: string): Promise<boolean> => {
          // Simulate async auth call
          await new Promise<void>((resolve) => setTimeout(resolve, 500));

          const found = MOCK_USERS.find(
            (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
          );

          if (!found) {
            set({ authError: 'E-mail ou senha incorretos.' }, false, 'auth/loginFailed');
            return false;
          }

          // Destructure password out so it's not stored in state
          const { password: _pw, ...user } = found;
          set(
            { currentUser: user, isAuthenticated: true, authError: null },
            false,
            'auth/loginSuccess',
          );
          return true;
        },

        logout: () =>
          set(
            {
              currentUser: null,
              isAuthenticated: false,
              authError: null,
              selectedCompany: null,
              selectedProject: null,
            },
            false,
            'auth/logout',
          ),

        clearAuthError: () => set({ authError: null }, false, 'auth/clearError'),

        // ---- App state ----
        darkMode: false,
        selectedCountry: null,
        selectedCompany: null,
        selectedProject: null,

        setDarkMode: (enabled: boolean) =>
          set({ darkMode: enabled }, false, 'app/setDarkMode'),

        toggleDarkMode: () =>
          set({ darkMode: !get().darkMode }, false, 'app/toggleDarkMode'),

        setSelectedCountry: (country: string | null) =>
          set(
            { selectedCountry: country, selectedCompany: null, selectedProject: null },
            false,
            'app/setSelectedCountry',
          ),

        setSelectedCompany: (companyId: string | null) =>
          set(
            { selectedCompany: companyId, selectedProject: null },
            false,
            'app/setSelectedCompany',
          ),

        setSelectedProject: (projectId: string | null) =>
          set({ selectedProject: projectId }, false, 'app/setSelectedProject'),

        // ---- Notifications state ----
        notifications: INITIAL_NOTIFICATIONS,

        addNotification: (payload) => {
          const notification: Notification = {
            id: `notif-${++notificationCounter}`,
            read: false,
            createdAt: new Date().toISOString(),
            ...payload,
          };
          set(
            (state) => ({ notifications: [notification, ...state.notifications] }),
            false,
            'notifications/add',
          );
        },

        markAsRead: (id: string) =>
          set(
            (state) => ({
              notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n,
              ),
            }),
            false,
            'notifications/markAsRead',
          ),

        markAllAsRead: () =>
          set(
            (state) => ({
              notifications: state.notifications.map((n) => ({ ...n, read: true })),
            }),
            false,
            'notifications/markAllAsRead',
          ),

        removeNotification: (id: string) =>
          set(
            (state) => ({
              notifications: state.notifications.filter((n) => n.id !== id),
            }),
            false,
            'notifications/remove',
          ),

        clearNotifications: () =>
          set({ notifications: [] }, false, 'notifications/clearAll'),

        // ---- Filters state ----
        filters: DEFAULT_FILTERS,

        setDateRange: (range: DateRange) =>
          set(
            (state) => ({ filters: { ...state.filters, dateRange: range } }),
            false,
            'filters/setDateRange',
          ),

        setStatusFilter: (statuses: string[]) =>
          set(
            (state) => ({ filters: { ...state.filters, statusFilter: statuses } }),
            false,
            'filters/setStatusFilter',
          ),

        setCountryFilter: (countries: string[]) =>
          set(
            (state) => ({ filters: { ...state.filters, countryFilter: countries } }),
            false,
            'filters/setCountryFilter',
          ),

        resetFilters: () =>
          set({ filters: DEFAULT_FILTERS }, false, 'filters/reset'),
      }),
      {
        name: 'dg-obrapro-global-store',
        // Only persist non-sensitive, UI-relevant state
        partialize: (state) => ({
          darkMode: state.darkMode,
          selectedCountry: state.selectedCountry,
          selectedCompany: state.selectedCompany,
          selectedProject: state.selectedProject,
          // Persist auth so users survive page refresh
          currentUser: state.currentUser,
          isAuthenticated: state.isAuthenticated,
        }),
      },
    ),
    { name: 'DGObraProGlobal' },
  ),
);

// ---------------------------------------------------------------------------
// Derived selectors (stable references — use inside components)
// ---------------------------------------------------------------------------

export const selectUnreadCount = (state: AppStore): number =>
  state.notifications.filter((n) => !n.read).length;

export const selectUnreadNotifications = (state: AppStore): Notification[] =>
  state.notifications.filter((n) => !n.read);
