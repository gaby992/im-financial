// WSH data — loaded from Supabase uploads
import { PLGroup } from '@/types';

export const WSH_INCOME: PLGroup[] = [];
export const WSH_EXPENSES: PLGroup[] = [];

export const WSH_SUMMARY = {
  totalIncome:   0,
  totalExpenses: 0,
  netPL:         0,
  margin:        0,
};

export const WSH_MONTHLY_TREND: { month: string; income: number; expenses: number; net: number }[] = [];
export const WSH_EXPENSE_BREAKDOWN: { name: string; value: number; color: string }[] = [];
