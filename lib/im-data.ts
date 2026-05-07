// Real IM data extracted from QuickBooks P&L Detail, Jan 1 – Apr 30, 2026
// Interactive Marketing only (single company view)

import { PLGroup } from '@/types';

// ── INCOME ───────────────────────────────────────────────────────────────────
export const IM_INCOME: PLGroup[] = [
  {
    category: 'Sales & Services',
    color: '#10B981',
    total: { IM: 116645.16, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Christopher Moore',         amount: { IM: 7500,     WSH: 0, Abundant: 0 } },
      { description: 'Diamond Law Center',         amount: { IM: 8000,     WSH: 0, Abundant: 0 } },
      { description: 'Discovery Medical Center',   amount: { IM: 8000,     WSH: 0, Abundant: 0 } },
      { description: 'HighLevel Agency',           amount: { IM: 4201.88,  WSH: 0, Abundant: 0 } },
      { description: 'Infinite Vitality',          amount: { IM: 8600,     WSH: 0, Abundant: 0 } },
      { description: 'Infinite Wellness',          amount: { IM: 4800,     WSH: 0, Abundant: 0 } },
      { description: 'Kapturly',                   amount: { IM: 8000,     WSH: 0, Abundant: 0 } },
      { description: 'Land Profit Generator - Agent',    amount: { IM: 11000, WSH: 0, Abundant: 0 } },
      { description: 'Land Profit Generator - Agent #2', amount: { IM: 2450,  WSH: 0, Abundant: 0 } },
      { description: 'New Medical Center SC',      amount: { IM: 5200,     WSH: 0, Abundant: 0 } },
      { description: 'Re-Selling (sub-accounts)',  amount: { IM: 1670.12,  WSH: 0, Abundant: 0 } },
      { description: 'Real Advisor',               amount: { IM: 10000,    WSH: 0, Abundant: 0 } },
      { description: 'Real Agency - Agent 2',      amount: { IM: 2000,     WSH: 0, Abundant: 0 } },
      { description: 'Real Wave Capital',          amount: { IM: 913.16,   WSH: 0, Abundant: 0 } },
      { description: 'Red Taylor',                 amount: { IM: 9000,     WSH: 0, Abundant: 0 } },
      { description: 'Renewing Function',          amount: { IM: 2300,     WSH: 0, Abundant: 0 } },
      { description: 'Street Smart',               amount: { IM: 6300,     WSH: 0, Abundant: 0 } },
      { description: 'TOTT (Talk of the Town)',    amount: { IM: 9200,     WSH: 0, Abundant: 0 } },
      { description: 'Truka',                      amount: { IM: 7500,     WSH: 0, Abundant: 0 } },
      { description: 'Sales & Services (misc)',    amount: { IM: 10,       WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Uncategorized Income',
    color: '#6B7280',
    total: { IM: 900, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Trust Associates Services transfer', amount: { IM: 900, WSH: 0, Abundant: 0 } },
    ],
  },
];

// ── EXPENSES ─────────────────────────────────────────────────────────────────
export const IM_EXPENSES: PLGroup[] = [
  {
    category: 'Advertising & Marketing',
    color: '#3B82F6',
    total: { IM: 1006.05, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Facebook Ads',               amount: { IM: 1006.05, WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Automobile Expense',
    color: '#6B7280',
    total: { IM: 46.01, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Exxon Mobile',               amount: { IM: 46.01,   WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Bank Service Charges',
    color: '#6B7280',
    total: { IM: 29.95, WSH: 0, Abundant: 0 },
    items: [
      { description: 'BofA Monthly Fee',           amount: { IM: 29.95,   WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Charitable Contributions',
    color: '#EC4899',
    total: { IM: 210, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Go Fund Me',                 amount: { IM: 210,     WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Contractors',
    color: '#F59E0B',
    total: { IM: 24605.25, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Anne Tibay (Gusto)',          amount: { IM: 1191.68, WSH: 0, Abundant: 0 } },
      { description: 'Carmen Todd (Gusto)',         amount: { IM: 42.60,   WSH: 0, Abundant: 0 } },
      { description: 'Doe Reyes (Upwork)',          amount: { IM: 1900.97, WSH: 0, Abundant: 0 } },
      { description: 'G Rangel (Gusto)',            amount: { IM: 4470.00, WSH: 0, Abundant: 0 } },
      { description: 'Justin Moore (Gusto)',        amount: { IM: 17000.00,WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Dues & Subscriptions',
    color: '#8B5CF6',
    total: { IM: 89.94, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Spotify',                    amount: { IM: 41.98,   WSH: 0, Abundant: 0 } },
      { description: 'Amazon Digital',             amount: { IM: 23.98,   WSH: 0, Abundant: 0 } },
      { description: 'Kindle Unlimited',           amount: { IM: 23.98,   WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Education & Training',
    color: '#0EA5E9',
    total: { IM: 8161.09, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Bear & Bull Marketing',      amount: { IM: 8000.00, WSH: 0, Abundant: 0 } },
      { description: 'Audible',                    amount: { IM: 161.09,  WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Gusto Fee',
    color: '#6B7280',
    total: { IM: 249.05, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Gusto Payroll Processing',   amount: { IM: 249.05,  WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Insurance Expense',
    color: '#6B7280',
    total: { IM: 728, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Transamerica Insurance',     amount: { IM: 728,     WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Interest Expense',
    color: '#F43F5E',
    total: { IM: 1098.73, WSH: 0, Abundant: 0 },
    items: [
      { description: 'AmEx Interest Charges',      amount: { IM: 1098.73, WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Meals & Entertainment',
    color: '#F97316',
    total: { IM: 3874.05, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Casi Cielo Sandy Springs',   amount: { IM: 1477.65, WSH: 0, Abundant: 0 } },
      { description: 'Trillium Boise',             amount: { IM: 386.20,  WSH: 0, Abundant: 0 } },
      { description: 'Instacart',                  amount: { IM: 299.22,  WSH: 0, Abundant: 0 } },
      { description: 'Uber Eats',                  amount: { IM: 172.63,  WSH: 0, Abundant: 0 } },
      { description: 'Capital Grille',             amount: { IM: 206.71,  WSH: 0, Abundant: 0 } },
      { description: 'Nuevos Amigos Cocina',       amount: { IM: 198.27,  WSH: 0, Abundant: 0 } },
      { description: 'Other Restaurants/Meals',    amount: { IM: 1133.37, WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Medical',
    color: '#6B7280',
    total: { IM: 1734, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Ansley Eye Care',            amount: { IM: 1535,    WSH: 0, Abundant: 0 } },
      { description: 'One Medical',                amount: { IM: 199,     WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Merchant Fees',
    color: '#6B7280',
    total: { IM: 2729.73, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Stripe Processing Fees',     amount: { IM: 2729.73, WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Office Supplies',
    color: '#6B7280',
    total: { IM: 402.80, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Target / Dick\'s Sporting',  amount: { IM: 402.80,  WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Professional Fees',
    color: '#6B7280',
    total: { IM: 134.75, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Payment Escrow',             amount: { IM: 134.75,  WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'QuickBooks Fees',
    color: '#6B7280',
    total: { IM: 91.96, WSH: 0, Abundant: 0 },
    items: [
      { description: 'QB Payments Discount Rate',  amount: { IM: 91.96,   WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Repairs & Maintenance',
    color: '#6B7280',
    total: { IM: 36, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Aqua Springs Car Wash',      amount: { IM: 36,      WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Software Expense',
    color: '#8B5CF6',
    total: { IM: 36456.38, WSH: 0, Abundant: 0 },
    items: [
      { description: 'HighLevel Inc',              amount: { IM: 3996.00, WSH: 0, Abundant: 0 } },
      { description: 'Manu AI',                    amount: { IM: 6211.01, WSH: 0, Abundant: 0 } },
      { description: 'Inner Circle',               amount: { IM: 4997.00, WSH: 0, Abundant: 0 } },
      { description: 'Closebot',                   amount: { IM: 2319.11, WSH: 0, Abundant: 0 } },
      { description: 'Clickup',                    amount: { IM: 856.32,  WSH: 0, Abundant: 0 } },
      { description: 'Search Atlas',               amount: { IM: 1922.00, WSH: 0, Abundant: 0 } },
      { description: 'G Suite / Google Workspace', amount: { IM: 1336.49, WSH: 0, Abundant: 0 } },
      { description: 'Twilio',                     amount: { IM: 2373.54, WSH: 0, Abundant: 0 } },
      { description: 'Lovable',                    amount: { IM: 711.00,  WSH: 0, Abundant: 0 } },
      { description: 'Adobe',                      amount: { IM: 341.20,  WSH: 0, Abundant: 0 } },
      { description: 'AI Assistant',               amount: { IM: 964.32,  WSH: 0, Abundant: 0 } },
      { description: 'Dropbox',                    amount: { IM: 600.00,  WSH: 0, Abundant: 0 } },
      { description: 'Perspective Software',       amount: { IM: 596.00,  WSH: 0, Abundant: 0 } },
      { description: 'Yext',                       amount: { IM: 600.00,  WSH: 0, Abundant: 0 } },
      { description: 'Creatify AI',                amount: { IM: 516.00,  WSH: 0, Abundant: 0 } },
      { description: 'Quick Ads AI',               amount: { IM: 396.00,  WSH: 0, Abundant: 0 } },
      { description: 'ZipWP',                      amount: { IM: 399.00,  WSH: 0, Abundant: 0 } },
      { description: 'Heygen Technology',          amount: { IM: 502.94,  WSH: 0, Abundant: 0 } },
      { description: 'WAVE',                       amount: { IM: 2530.44, WSH: 0, Abundant: 0 } },
      { description: 'PocketMarketer AI',          amount: { IM: 588.00,  WSH: 0, Abundant: 0 } },
      { description: 'ChatGPT',                    amount: { IM: 80.00,   WSH: 0, Abundant: 0 } },
      { description: 'Claude.AI',                  amount: { IM: 109.53,  WSH: 0, Abundant: 0 } },
      { description: 'OpenAI',                     amount: { IM: 140.00,  WSH: 0, Abundant: 0 } },
      { description: 'Zoom',                       amount: { IM: 135.92,  WSH: 0, Abundant: 0 } },
      { description: 'Slack',                      amount: { IM: 167.13,  WSH: 0, Abundant: 0 } },
      { description: 'ElevenLabs',                 amount: { IM: 55.00,   WSH: 0, Abundant: 0 } },
      { description: 'Zapier',                     amount: { IM: 234.00,  WSH: 0, Abundant: 0 } },
      { description: 'Fathom Video',               amount: { IM: 250.00,  WSH: 0, Abundant: 0 } },
      { description: 'Gamma App',                  amount: { IM: 180.00,  WSH: 0, Abundant: 0 } },
      { description: 'Miro',                       amount: { IM: 200.00,  WSH: 0, Abundant: 0 } },
      { description: 'Loom',                       amount: { IM: 120.00,  WSH: 0, Abundant: 0 } },
      { description: 'Vimeo',                      amount: { IM: 144.00,  WSH: 0, Abundant: 0 } },
      { description: 'Uphex',                      amount: { IM: 291.00,  WSH: 0, Abundant: 0 } },
      { description: 'Clickfunnels',               amount: { IM: 144.00,  WSH: 0, Abundant: 0 } },
      { description: 'Other Software',             amount: { IM: 472.43,  WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Telephone Expense',
    color: '#0EA5E9',
    total: { IM: 3268.05, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Verizon Wireless',           amount: { IM: 1944.79, WSH: 0, Abundant: 0 } },
      { description: 'AT&T',                       amount: { IM: 1323.26, WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Travel Expense',
    color: '#F97316',
    total: { IM: 6170.34, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Delta Airlines',             amount: { IM: 2609.09, WSH: 0, Abundant: 0 } },
      { description: 'Hammock Beach / AIM Hotels', amount: { IM: 1671.93, WSH: 0, Abundant: 0 } },
      { description: 'Grove Hotel / Sheraton',     amount: { IM: 1316.29, WSH: 0, Abundant: 0 } },
      { description: 'Uber Trips',                 amount: { IM: 254.51,  WSH: 0, Abundant: 0 } },
      { description: 'Other Travel',               amount: { IM: 318.52,  WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Uncategorized Expense',
    color: '#6B7280',
    total: { IM: 2025.72, WSH: 0, Abundant: 0 },
    items: [
      { description: 'SBA EIDL Loan Payment',      amount: { IM: 1815.00, WSH: 0, Abundant: 0 } },
      { description: 'Citizens Pay Line of Credit', amount: { IM: 210.72,  WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Upwork Fee',
    color: '#6B7280',
    total: { IM: 156.49, WSH: 0, Abundant: 0 },
    items: [
      { description: 'Upwork Platform Fee',        amount: { IM: 156.49,  WSH: 0, Abundant: 0 } },
    ],
  },
  {
    category: 'Website Expenses',
    color: '#0EA5E9',
    total: { IM: 1402.08, WSH: 0, Abundant: 0 },
    items: [
      { description: 'GoDaddy Domains/Hosting',    amount: { IM: 862.08,  WSH: 0, Abundant: 0 } },
      { description: 'WP Engine Hosting',          amount: { IM: 540.00,  WSH: 0, Abundant: 0 } },
    ],
  },
];

// ── SUMMARY ───────────────────────────────────────────────────────────────────
export const IM_SUMMARY = {
  totalIncome:   117555.16,
  totalExpenses:  97302.82,
  netPL:          22838.74,
  margin:         19.43,   // net / income %
};

// ── MONTHLY TREND (Jan-Apr 2026, IM only, estimated from QB Detail) ──────────
export const IM_MONTHLY_TREND = [
  { month: 'Jan', income: 26800, expenses: 20850, net:  5950 },
  { month: 'Feb', income: 28300, expenses: 24100, net:  4200 },
  { month: 'Mar', income: 34200, expenses: 28900, net:  5300 },
  { month: 'Apr', income: 28255, expenses: 23453, net:  4802 },
];

// ── EXPENSE BREAKDOWN (for donut chart) ─────────────────────────────────────
export const IM_EXPENSE_BREAKDOWN = [
  { name: 'Software',        value: 36456.38, color: '#8B5CF6' },
  { name: 'Contractors',     value: 24605.25, color: '#F59E0B' },
  { name: 'Travel',          value: 6170.34,  color: '#F97316' },
  { name: 'Education',       value: 8161.09,  color: '#0EA5E9' },
  { name: 'Meals',           value: 3874.05,  color: '#EC4899' },
  { name: 'Telephone',       value: 3268.05,  color: '#06B6D4' },
  { name: 'Merchant Fees',   value: 2729.73,  color: '#6B7280' },
  { name: 'Uncategorized',   value: 2025.72,  color: '#475569' },
  { name: 'Other',           value: 10012.21, color: '#334155' },
];
