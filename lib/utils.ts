import { Company } from '@/types';

export const COMPANIES: Record<Exclude<Company,'All'>, { name: string; color: string; badgeClass: string }> = {
  IM:        { name: 'Interactive Marketing', color: '#0EA5E9', badgeClass: 'badge-im' },
  WSH:       { name: 'Western Star Holdings',  color: '#8B5CF6', badgeClass: 'badge-wsh' },
  Abundant:  { name: 'Abundant Legacy Trust',  color: '#EC4899', badgeClass: 'badge-abundant' },
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Commissions':           '#3B82F6',
  'Coaches':               '#10B981',
  'Contractors - US':      '#F59E0B',
  'Contractors – US':      '#F59E0B',
  'Contractors - Intl':    '#EC4899',
  'Contractors – Intl':    '#EC4899',
  'Salaries - Guaranteed': '#8B5CF6',
  'Salaries – Guaranteed': '#8B5CF6',
  'Marketing':             '#06B6D4',
  'Advertising':           '#06B6D4',
  'Operations':            '#F97316',
  'Software':              '#A78BFA',
  'Travel':                '#34D399',
  'Meals':                 '#FBBF24',
  'Insurance':             '#94A3B8',
  'Legal':                 '#FB7185',
  'Accounting':            '#60A5FA',
  'Income':                '#10B981',
  'Revenue':               '#10B981',
  'Sales':                 '#10B981',
};

export function getCategoryColor(category: string): string {
  // Direct match
  if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
  // Fuzzy match
  const lc = category.toLowerCase();
  if (lc.includes('commission'))   return '#3B82F6';
  if (lc.includes('coach'))        return '#10B981';
  if (lc.includes('contractor') && (lc.includes('intl') || lc.includes('int'))) return '#EC4899';
  if (lc.includes('contractor'))   return '#F59E0B';
  if (lc.includes('salar'))        return '#8B5CF6';
  if (lc.includes('market') || lc.includes('advertis')) return '#06B6D4';
  if (lc.includes('operat') || lc.includes('software')) return '#F97316';
  if (lc.includes('travel'))       return '#34D399';
  if (lc.includes('income') || lc.includes('revenue') || lc.includes('sale')) return '#10B981';
  return '#6B7280'; // default gray
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function getMonthName(month: number): string {
  return new Date(2024, month - 1, 1).toLocaleString('en-US', { month: 'long' });
}

export function classNames(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
