// Abundant data — loaded from Supabase uploads
import { PLGroup } from '@/types';

export const ABUNDANT_NOTE = 'Abundant Legacy Trust does not generate operating income. Expenses reflect trust distributions and personal household obligations.';

export const ABUNDANT_EXPENSES: PLGroup[] = [];

export const ABUNDANT_SUMMARY = {
  totalIncome:   0,
  totalExpenses: 0,
  netPL:         0,
  isTrust:       true,
};

export const ABUNDANT_MONTHLY_TREND: { month: string; expenses: number }[] = [];
export const ABUNDANT_EXPENSE_BREAKDOWN: { name: string; value: number; color: string }[] = [];
