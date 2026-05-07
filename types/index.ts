// Global types for IM Financial Dashboard

export type Company = 'IM' | 'WSH' | 'Abundant' | 'All';

export type UserRole = 'admin' | 'viewer';

export interface AppUser {
  id: string;
  username: string;
  role: UserRole;
  created_at: string;
}

export interface CompanyRecord {
  id: string;
  name: string;
  code: Company;
}

export interface UploadBatch {
  id: string;
  company_id: string;
  company_code: Company;
  filename: string;
  period_start: string;
  period_end: string;
  uploaded_by: string;
  uploaded_at: string;
  row_count: number;
  deleted_at: string | null;
}

export interface PLEntry {
  id: string;
  batch_id: string;
  company_id: string;
  company_code: Company;
  category: string;
  description: string;   // formerly "vendor"
  amount: number;
  entry_date: string;    // YYYY-MM-DD
  entry_type: 'income' | 'expense';
}

export interface AIQuestion {
  id: string;
  asked_by: string;
  question: string;
  answer: string | null;
  created_at: string;
}

export interface AISettings {
  provider: 'claude' | 'openai';
  model: string;
  has_key: boolean;
}

export interface DateRange {
  from: string;  // YYYY-MM-DD
  to: string;    // YYYY-MM-DD
}

export type DateFilter =
  | { type: 'all' }
  | { type: 'month'; year: number; month: number }
  | { type: 'custom'; range: DateRange };

export interface KPIData {
  totalIncome: number;
  totalExpenses: number;
  netPL: number;
  plMargin: number;
  prevNetPL?: number;   // for % change
}

export interface CategoryTotal {
  category: string;
  total: number;
  entries: PLEntry[];
  color: string;
}

// P&L grouped data — multi-company structure
export interface CompanyAmounts {
  IM: number;
  WSH: number;
  Abundant: number;
}

export interface PLItem {
  description: string;
  amount: CompanyAmounts;
}

export interface PLGroup {
  category: string;
  color: string;
  total: CompanyAmounts;      // per-company totals
  items?: PLItem[];            // line-item breakdown
  // Legacy support
  entries?: { description: string; amount: number; company?: Company }[];
}
