// Abundant Legacy Trust — Jan 1–Mar 31, 2026
// NOTE: Trust structure — no operating income, only trust disbursements/expenses
import { PLGroup } from '@/types';

export const ABUNDANT_NOTE = 'Abundant Legacy Trust does not generate operating income. Expenses reflect trust distributions and personal household obligations.';

export const ABUNDANT_EXPENSES: PLGroup[] = [
  {
    category: 'Mortgage — 140 Cove',
    color: '#3B82F6',
    total: { IM: 0, WSH: 0, Abundant: 12628.47 },
    items: [
      { description: 'RoundPoint Mortgage (3 months)', amount: { IM: 0, WSH: 0, Abundant: 12628.47 } },
    ],
  },
  {
    category: 'Education & Training',
    color: '#0EA5E9',
    total: { IM: 0, WSH: 0, Abundant: 3363.75 },
    items: [
      { description: 'BB Tuition Management',   amount: { IM: 0, WSH: 0, Abundant: 3322.50 } },
      { description: 'The Galloway School',     amount: { IM: 0, WSH: 0, Abundant: 41.25 } },
    ],
  },
  {
    category: 'Vehicle — Lease (Ally)',
    color: '#8B5CF6',
    total: { IM: 0, WSH: 0, Abundant: 1232.88 },
    items: [
      { description: 'Ally Auto Lease Payment (3 months)', amount: { IM: 0, WSH: 0, Abundant: 1232.88 } },
    ],
  },
  {
    category: 'State Farm Loan',
    color: '#F59E0B',
    total: { IM: 0, WSH: 0, Abundant: 2499.70 },
    items: [
      { description: 'State Farm Loan (3 months)', amount: { IM: 0, WSH: 0, Abundant: 2499.70 } },
    ],
  },
  {
    category: 'Utilities',
    color: '#10B981',
    total: { IM: 0, WSH: 0, Abundant: 1240.09 },
    items: [
      { description: 'GA Power (electricity)', amount: { IM: 0, WSH: 0, Abundant: 720.55 } },
      { description: 'Georgia Natural Gas',    amount: { IM: 0, WSH: 0, Abundant: 519.54 } },
    ],
  },
  {
    category: 'Professional Services',
    color: '#EC4899',
    total: { IM: 0, WSH: 0, Abundant: 1043.28 },
    items: [
      { description: 'Sunlight Financial (2 months)', amount: { IM: 0, WSH: 0, Abundant: 1043.28 } },
    ],
  },
  {
    category: 'Vehicle — Honda Payment',
    color: '#6B7280',
    total: { IM: 0, WSH: 0, Abundant: 815.72 },
    items: [
      { description: 'Honda Payment (2 months)', amount: { IM: 0, WSH: 0, Abundant: 815.72 } },
    ],
  },
  {
    category: 'Interest Expense',
    color: '#F43F5E',
    total: { IM: 0, WSH: 0, Abundant: 326.20 },
    items: [
      { description: 'AmEx Promotional Balance Interest', amount: { IM: 0, WSH: 0, Abundant: 326.20 } },
    ],
  },
  {
    category: 'Accounting & Tax Prep',
    color: '#8B5CF6',
    total: { IM: 0, WSH: 0, Abundant: 349.06 },
    items: [
      { description: 'TechFin LLC / Marietta-Roswell', amount: { IM: 0, WSH: 0, Abundant: 349.06 } },
    ],
  },
  {
    category: 'Medical',
    color: '#06B6D4',
    total: { IM: 0, WSH: 0, Abundant: 530.70 },
    items: [
      { description: 'Pathology & Lab / CVS Pharmacy', amount: { IM: 0, WSH: 0, Abundant: 530.70 } },
    ],
  },
  {
    category: 'Travel',
    color: '#F97316',
    total: { IM: 0, WSH: 0, Abundant: 1073.96 },
    items: [
      { description: 'Sandy Toes (international)',      amount: { IM: 0, WSH: 0, Abundant: 685.20 } },
      { description: 'Grand Hyatt Nassau / Lodging',    amount: { IM: 0, WSH: 0, Abundant: 268.77 } },
      { description: 'Ground Transportation / Fees',    amount: { IM: 0, WSH: 0, Abundant: 119.99 } },
    ],
  },
  {
    category: 'Office Expense',
    color: '#6B7280',
    total: { IM: 0, WSH: 0, Abundant: 325.13 },
    items: [
      { description: 'Anytime Mailbox',    amount: { IM: 0, WSH: 0, Abundant: 131.29 } },
      { description: 'Total Water Treatment', amount: { IM: 0, WSH: 0, Abundant: 193.84 } },
    ],
  },
  {
    category: 'Bank/CC Charges',
    color: '#6B7280',
    total: { IM: 0, WSH: 0, Abundant: 106.58 },
    items: [
      { description: 'Wire Fees + AmEx Late Fee', amount: { IM: 0, WSH: 0, Abundant: 106.58 } },
    ],
  },
  {
    category: 'Vehicle — Fuel (Tesla)',
    color: '#6B7280',
    total: { IM: 0, WSH: 0, Abundant: 32.28 },
    items: [
      { description: 'Tesla Motors Charging (3 months)', amount: { IM: 0, WSH: 0, Abundant: 32.28 } },
    ],
  },
  {
    category: 'Pest Control',
    color: '#6B7280',
    total: { IM: 0, WSH: 0, Abundant: 100 },
    items: [
      { description: 'Rentokil (2 months)', amount: { IM: 0, WSH: 0, Abundant: 100 } },
    ],
  },
  {
    category: 'Meals',
    color: '#F97316',
    total: { IM: 0, WSH: 0, Abundant: 136.95 },
    items: [
      { description: 'Rhythms Cafe', amount: { IM: 0, WSH: 0, Abundant: 136.95 } },
    ],
  },
  {
    category: 'Supplies & Materials',
    color: '#6B7280',
    total: { IM: 0, WSH: 0, Abundant: 35.82 },
    items: [
      { description: 'Amazon Marketplace', amount: { IM: 0, WSH: 0, Abundant: 35.82 } },
    ],
  },
];

export const ABUNDANT_SUMMARY = {
  totalIncome:   0,
  totalExpenses: 28340.27,
  netPL:        -28340.27,   // Trust disbursements
  isTrust: true,
};

export const ABUNDANT_MONTHLY_TREND = [
  { month: 'Jan', expenses: 11682.33 },
  { month: 'Feb', expenses: 9384.98 },
  { month: 'Mar', expenses: 7272.96 },
];

export const ABUNDANT_EXPENSE_BREAKDOWN = [
  { name: 'Mortgage',   value: 12628.47, color: '#3B82F6' },
  { name: 'Education',  value: 3363.75,  color: '#0EA5E9' },
  { name: 'State Farm', value: 2499.70,  color: '#F59E0B' },
  { name: 'Utilities',  value: 1240.09,  color: '#10B981' },
  { name: 'Travel',     value: 1073.96,  color: '#F97316' },
  { name: 'Prof Svcs',  value: 1043.28,  color: '#EC4899' },
  { name: 'Vehicle',    value: 2048.60,  color: '#8B5CF6' },
  { name: 'Other',      value: 4442.42,  color: '#6B7280' },
];
