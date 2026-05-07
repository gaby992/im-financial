// IM data — loaded from Supabase uploads
// Hardcoded data removed; app reads from real QB uploads via /api/data

import { PLGroup } from '@/types';

export const IM_INCOME: PLGroup[] = [];
export const IM_EXPENSES: PLGroup[] = [];

export const IM_SUMMARY = {
  totalIncome:   0,
  totalExpenses: 0,
  netPL:         0,
  margin:        0,
};

export const IM_MONTHLY_TREND: { month: string; income: number; expenses: number; net: number }[] = [];
export const IM_EXPENSE_BREAKDOWN: { name: string; value: number; color: string }[] = [];
