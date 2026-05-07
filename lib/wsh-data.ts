// Western Star Holdings — Jan 1–Mar 31, 2026
import { PLGroup } from '@/types';

export const WSH_INCOME: PLGroup[] = [
  {
    category: 'Sales',
    color: '#10B981',
    total: { IM: 0, WSH: 75000, Abundant: 0 },
    items: [
      { description: 'REI Group (bi-monthly $12,500)', amount: { IM: 0, WSH: 75000, Abundant: 0 } },
    ],
  },
];

export const WSH_EXPENSES: PLGroup[] = [
  {
    category: 'Payroll — Wages',
    color: '#F59E0B',
    total: { IM: 0, WSH: 38523.16, Abundant: 0 },
    items: [
      { description: 'Chelsea Zabala — Gross Pay', amount: { IM: 0, WSH: 22208.75, Abundant: 0 } },
      { description: 'Rafael Zabala — Gross Pay',  amount: { IM: 0, WSH: 16314.41, Abundant: 0 } },
    ],
  },
  {
    category: 'Payroll — Employer Taxes',
    color: '#F97316',
    total: { IM: 0, WSH: 3544.03, Abundant: 0 },
    items: [
      { description: 'Employer Taxes (Chelsea + Rafael)', amount: { IM: 0, WSH: 3544.03, Abundant: 0 } },
    ],
  },
  {
    category: 'Accounting Fees',
    color: '#8B5CF6',
    total: { IM: 0, WSH: 310.44, Abundant: 0 },
    items: [
      { description: 'TechFin CFO/Accounting', amount: { IM: 0, WSH: 310.44, Abundant: 0 } },
    ],
  },
  {
    category: 'Bank Service Charges',
    color: '#6B7280',
    total: { IM: 0, WSH: 217, Abundant: 0 },
    items: [
      { description: 'BofA Monthly Fee + Wire Transfers', amount: { IM: 0, WSH: 217, Abundant: 0 } },
    ],
  },
  {
    category: 'Dues & Subscriptions',
    color: '#06B6D4',
    total: { IM: 0, WSH: 283.50, Abundant: 0 },
    items: [
      { description: 'QuickBooks Payments', amount: { IM: 0, WSH: 283.50, Abundant: 0 } },
    ],
  },
  {
    category: 'Postage & Delivery',
    color: '#6B7280',
    total: { IM: 0, WSH: 5, Abundant: 0 },
    items: [
      { description: 'External Transfer Fee', amount: { IM: 0, WSH: 5, Abundant: 0 } },
    ],
  },
];

export const WSH_SUMMARY = {
  totalIncome:    75000,
  totalExpenses:  42883.13,
  netPL:          32116.87,
  margin:         42.82,
};

export const WSH_MONTHLY_TREND = [
  { month: 'Jan', income: 25000, expenses: 16800, net: 8200 },
  { month: 'Feb', income: 25000, expenses: 14200, net: 10800 },
  { month: 'Mar', income: 25000, expenses: 11883, net: 13117 },
];

export const WSH_EXPENSE_BREAKDOWN = [
  { name: 'Wages',     value: 38523.16, color: '#F59E0B' },
  { name: 'Tax',       value: 3544.03,  color: '#F97316' },
  { name: 'Accounting',value: 310.44,   color: '#8B5CF6' },
  { name: 'Bank Fees', value: 217,      color: '#6B7280' },
  { name: 'QB / Other',value: 288.50,   color: '#06B6D4' },
];
