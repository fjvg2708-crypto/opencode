// ============================================================
// DG ObraPro Global — Core Type Definitions
// Grupo DG | Portugal · Angola · Guiné
// ============================================================

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export enum ProjectStatus {
  Planeamento = "Planeamento",
  EmCurso = "Em Curso",
  Suspenso = "Suspenso",
  Concluido = "Concluído",
  Cancelado = "Cancelado",
}

export enum RecordStatus {
  Rascunho = "Rascunho",
  Submetido = "Submetido",
  Validado = "Validado",
  Rejeitado = "Rejeitado",
}

export enum UserRole {
  SuperAdmin = "SuperAdmin",
  DirectorPais = "Diretor de País",
  DiretorObra = "Diretor de Obra",
  Encarregado = "Encarregado",
  Tecnico = "Técnico",
  Observador = "Observador",
}

export enum ActivityCategory {
  Estruturas = "Estruturas",
  Alvenaria = "Alvenaria",
  Impermeabilizacao = "Impermeabilização",
  Revestimentos = "Revestimentos",
  Instalacoes = "Instalações",
  Terraplenagem = "Terraplenagem",
  Betao = "Betão",
  Carpintaria = "Carpintaria",
  Serralharia = "Serralharia",
  Pintura = "Pintura",
  Pavimentacao = "Pavimentação",
  Cobertura = "Cobertura",
  Fundacoes = "Fundações",
  Demolicao = "Demolição",
  Exterior = "Exterior",
}

// ─────────────────────────────────────────────
// Core Entities
// ─────────────────────────────────────────────

export interface Country {
  id: string;
  name: string;
  /** Unicode flag emoji, e.g. "🇵🇹" */
  flag: string;
  /** ISO 4217 currency code, e.g. "EUR", "AOA", "GNF" */
  currency: string;
  /** Human-readable currency name */
  currencyName: string;
  /** Primary language spoken */
  language: string;
  /** IANA timezone identifier, e.g. "Europe/Lisbon" */
  timezone: string;
  active: boolean;
  /** IDs of companies operating in this country */
  companies: string[];
}

export interface Company {
  id: string;
  name: string;
  /** Emoji used as logo placeholder in the UI */
  logo: string;
  /** Brand hex colour, e.g. "#1E40AF" */
  color: string;
  countryId: string;
  managerName: string;
  active: boolean;
}

export interface Team {
  id: string;
  name: string;
  projectId: string;
  /** Total headcount on this team */
  members: number;
  /** Main trade or specialisation, e.g. "Betão Armado" */
  specialty: string;
}

export interface Project {
  id: string;
  name: string;
  /** Human-readable address / area description */
  location: string;
  client: string;
  /** Diretor de Obra */
  directorName: string;
  /** Encarregado Geral */
  encarregadoName: string;
  /** ISO 8601 date string "YYYY-MM-DD" */
  startDate: string;
  /** ISO 8601 date string "YYYY-MM-DD" */
  deadline: string;
  status: ProjectStatus;
  countryId: string;
  companyId: string;
  /** Overall completion percentage 0–100 */
  progress: number;
  /** Total contracted budget in local currency (major units) */
  budget: number;
  /** Amount spent to date in local currency */
  spent: number;
  /** Team objects embedded in the project */
  teams: Team[];
  /** WGS-84 latitude */
  lat: number;
  /** WGS-84 longitude */
  lng: number;
  description?: string;
}

export interface Activity {
  id: string;
  name: string;
  category: ActivityCategory;
  /** Measurement unit, e.g. "m²", "m³", "ml", "un", "kg", "t" */
  unit: string;
  /** Emoji icon for UI display */
  icon: string;
  description?: string;
}

export interface DailyRecord {
  id: string;
  projectId: string;
  activityId: string;
  /** ISO 8601 date string "YYYY-MM-DD" */
  date: string;
  /** Array of photo URLs or base64 data URIs */
  photos: string[];
  /** URL to audio file, or null if no voice note */
  voiceNote: string | null;
  /** Free-text field notes / observations */
  text: string;
  /** Measured quantity of work done */
  quantity: number;
  /** Unit of measure — denormalised for historical accuracy */
  unit: string;
  gpsLat: number | null;
  gpsLng: number | null;
  /** Team ID or free-text team name */
  team: string;
  /** Sub-contractor name, if applicable */
  subEmpreiteiro: string | null;
  /** Name or User ID of the person responsible */
  responsavel: string;
  status: RecordStatus;
  /** User ID of the person who validated this record */
  validatedBy: string | null;
  /** ISO 8601 datetime string */
  createdAt: string;
  /** User ID of the record creator */
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  countryId: string;
  companyId: string;
  /** Project IDs this user has access to */
  projectIds: string[];
  /** Emoji avatar placeholder */
  avatar: string;
  phone?: string;
  /** ISO 8601 datetime string of last login */
  lastLogin?: string;
}

// ─────────────────────────────────────────────
// Dashboard / Analytics Types
// ─────────────────────────────────────────────

export interface GlobalStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  /** Aggregate production value across all records */
  totalProduction: number;
  totalPhotos: number;
  totalRecords: number;
  /** Country ID with the highest recorded activity this period */
  topCountry: string;
  /** Percentage growth in records vs. the equivalent prior-week period */
  weekGrowth: number;
  /** Sum of all project budgets in EUR equivalent */
  totalBudget: number;
  /** Sum of all project expenditure in EUR equivalent */
  totalSpent: number;
}

export interface ProductionData {
  /** Human-readable label for this data point, e.g. "Semana 18" or "Mai" */
  label: string;
  portugal: number;
  angola: number;
  guinea: number;
  total: number;
}

export interface RankingEntry {
  rank: number;
  projectId: string;
  projectName: string;
  companyName: string;
  countryFlag: string;
  /** Overall project completion percentage 0–100 */
  progress: number;
  /** Number of validated records submitted this calendar week */
  recordsThisWeek: number;
  /** Cumulative production volume for the ranking metric */
  totalProduction: number;
  unit: string;
  trend: "up" | "down" | "stable";
}

export interface FeedPost {
  id: string;
  projectId: string;
  projectName: string;
  companyName: string;
  countryFlag: string;
  activityName: string;
  quantity: number;
  unit: string;
  /** Photo URLs (first photo is shown as cover) */
  photos: string[];
  /** ISO 8601 datetime string */
  timestamp: string;
  likes: number;
  responsible: string;
  comment?: string;
  location?: string;
}

// ─────────────────────────────────────────────
// Report Types
// ─────────────────────────────────────────────

export interface MedicaoItem {
  id: string;
  activityId: string;
  activityName: string;
  unit: string;
  /** Accumulated quantity up to (but not including) this period */
  previousQuantity: number;
  /** Quantity measured in this period */
  currentQuantity: number;
  /** previousQuantity + currentQuantity */
  totalQuantity: number;
  /** Total quantity stipulated in the contract */
  contractQuantity: number;
  /** totalQuantity / contractQuantity × 100 */
  percentComplete: number;
  /** Price per unit in local currency */
  unitPrice: number;
  /** currentQuantity × unitPrice */
  periodValue: number;
  /** totalQuantity × unitPrice */
  totalValue: number;
}

export interface MedicaoAuto {
  id: string;
  projectId: string;
  projectName: string;
  /** Sequential measurement number, e.g. 1 = "Auto nº 1" */
  autoNumber: number;
  /** ISO 8601 date — start of measurement period */
  periodStart: string;
  /** ISO 8601 date — end of measurement period */
  periodEnd: string;
  /** ISO 8601 datetime — when the auto was generated */
  generatedAt: string;
  generatedBy: string;
  items: MedicaoItem[];
  /** Sum of all item periodValues */
  subtotal: number;
  /** IVA / VAT rate as a decimal, e.g. 0.23 for 23% */
  vatRate: number;
  vatAmount: number;
  total: number;
  currency: string;
  notes: string;
  approved: boolean;
  approvedBy: string | null;
}

// ─────────────────────────────────────────────
// Map Types
// ─────────────────────────────────────────────

export interface WorldMapMarker {
  id: string;
  projectId: string;
  projectName: string;
  companyName: string;
  countryFlag: string;
  lat: number;
  lng: number;
  status: ProjectStatus;
  /** Project completion percentage 0–100 */
  progress: number;
  /** Hex colour derived from the owning company brand */
  color: string;
  /** Number of records submitted today for this project */
  activeRecordsToday: number;
}

// ─────────────────────────────────────────────
// Utility / helper types
// ─────────────────────────────────────────────

export type DateRangeFilter = {
  start: string; // ISO 8601 date
  end: string;   // ISO 8601 date
};

export type CountryFilter = "all" | "pt" | "ao" | "gn";

export type ProjectFilter = {
  countryId?: string;
  companyId?: string;
  status?: ProjectStatus;
  dateRange?: DateRangeFilter;
};

export type RecordFilter = {
  projectId?: string;
  activityId?: string;
  status?: RecordStatus;
  userId?: string;
  dateRange?: DateRangeFilter;
};
