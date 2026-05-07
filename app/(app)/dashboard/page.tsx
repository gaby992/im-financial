'use client';
import { useApp } from '@/lib/context';
import { formatCurrency, formatPercent, COMPANIES } from '@/lib/utils';
import { IM_SUMMARY, IM_MONTHLY_TREND, IM_EXPENSE_BREAKDOWN } from '@/lib/im-data';
import { WSH_SUMMARY, WSH_MONTHLY_TREND, WSH_EXPENSE_BREAKDOWN } from '@/lib/wsh-data';
import { ABUNDANT_SUMMARY, ABUNDANT_MONTHLY_TREND, ABUNDANT_EXPENSE_BREAKDOWN } from '@/lib/abundant-data';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ── helpers ──────────────────────────────────────────────────────────────────
function getDataForCompany(company: string) {
  if (company === 'WSH')      return { summary: WSH_SUMMARY,      trend: WSH_MONTHLY_TREND,      breakdown: WSH_EXPENSE_BREAKDOWN,      period: 'Jan – Mar 2026' };
  if (company === 'Abundant') return { summary: ABUNDANT_SUMMARY,  trend: ABUNDANT_MONTHLY_TREND,  breakdown: ABUNDANT_EXPENSE_BREAKDOWN,  period: 'Jan – Mar 2026' };
  if (company === 'All') {
    // Combine IM + WSH (Abundant is a trust, treated separately)
    const combinedTrend = [
      { month: 'Jan', income: 26800 + 25000,  expenses: 20850 + 16800,  net:  5950 +  8200 },
      { month: 'Feb', income: 28300 + 25000,  expenses: 24100 + 14200,  net:  4200 + 10800 },
      { month: 'Mar', income: 34200 + 25000,  expenses: 28900 + 11883,  net:  5300 + 13117 },
      { month: 'Apr', income: 28255,          expenses: 23453,          net:  4802          },
    ];
    return {
      summary: {
        totalIncome:   IM_SUMMARY.totalIncome   + WSH_SUMMARY.totalIncome,
        totalExpenses: IM_SUMMARY.totalExpenses + WSH_SUMMARY.totalExpenses + ABUNDANT_SUMMARY.totalExpenses,
        netPL:         IM_SUMMARY.netPL         + WSH_SUMMARY.netPL        - ABUNDANT_SUMMARY.totalExpenses,
        margin:        0,
        isTrust:       false,
      },
      trend: combinedTrend,
      breakdown: [
        { name: 'IM Software',     value: 36456, color: '#8B5CF6' },
        { name: 'WSH Payroll',     value: 38523, color: '#F59E0B' },
        { name: 'IM Contractors',  value: 24605, color: '#F97316' },
        { name: 'Abundant Mtg',   value: 12628, color: '#3B82F6' },
        { name: 'IM Travel',       value:  6170, color: '#EC4899' },
        { name: 'Other',           value: 49914, color: '#6B7280' },
      ],
      period: 'Jan – Apr 2026 (IM) / Jan – Mar 2026 (WSH, Abundant)',
    };
  }
  return { summary: IM_SUMMARY, trend: IM_MONTHLY_TREND, breakdown: IM_EXPENSE_BREAKDOWN, period: 'Jan – Apr 2026' };
}

function KPICard({ label, value, sub, positive, accent }: { label: string; value: string; sub?: string; positive?: boolean; accent?: string }) {
  return (
    <div className="kpi-card">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${
        positive === undefined ? 'text-white' : positive ? 'text-positive' : 'text-negative'
      }`} style={accent ? { color: accent } : undefined}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-3 text-xs space-y-1">
      <p className="font-semibold text-slate-300">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { company } = useApp();
  const { summary, trend, breakdown, period } = getDataForCompany(company);
  const companyLabel = company === 'All' ? 'All Companies' : COMPANIES[company as keyof typeof COMPANIES]?.name ?? company;
  const isTrust = 'isTrust' in summary && (summary as any).isTrust;
  const isPositive = summary.netPL >= 0;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">{companyLabel} · {period}</p>
        </div>
        <div className="flex items-center gap-2">
          {isTrust && (
            <span className="text-xs px-3 py-1 rounded-full border" style={{ background:'rgba(139,92,246,0.1)', color:'#8B5CF6', borderColor:'rgba(139,92,246,0.2)' }}>
              Trust Entity
            </span>
          )}
          <span className="text-xs px-3 py-1 rounded-full border" style={{ background:'rgba(14,165,233,0.1)', color:'#0EA5E9', borderColor:'rgba(14,165,233,0.2)' }}>
            Live QB Data
          </span>
        </div>
      </div>

      {/* Trust notice */}
      {isTrust && (
        <div className="card p-4 flex gap-3 border-l-4" style={{ borderLeftColor: '#8B5CF6' }}>
          <p className="text-sm text-slate-400">
            <span className="text-white font-semibold">Abundant Legacy Trust</span> — This is a trust entity, not an operating company. It does not generate income; figures below represent trust disbursements and obligations.
          </p>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        {!isTrust && <KPICard label="Total Income"    value={formatCurrency(summary.totalIncome)}    sub={period} />}
        {isTrust  && <KPICard label="Trust Disbursements" value={formatCurrency(summary.totalExpenses)} sub={period} positive={false} />}
        <KPICard label="Total Expenses"  value={formatCurrency(summary.totalExpenses)}  sub={period} />
        <KPICard label="Net P&L"
          value={formatCurrency(summary.netPL)}
          sub={isTrust ? 'Trust deficit (normal)' : (formatPercent('margin' in summary ? (summary as any).margin : 0) + ' margin')}
          positive={isPositive} />
        {!isTrust && <KPICard label="P&L Margin" value={formatPercent('margin' in summary ? (summary as any).margin : 0)} positive={isPositive} />}
        {isTrust  && <KPICard label="Avg/Month"  value={formatCurrency(summary.totalExpenses / 3)} sub="3-month average" />}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 card p-5">
          <p className="text-sm font-semibold text-white mb-4">
            {isTrust ? 'Monthly Disbursements' : 'Income vs Expenses — Monthly'}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            {isTrust ? (
              <BarChart data={trend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="expenses" name="Disbursements" fill="#8B5CF6" radius={[4,4,0,0]} />
              </BarChart>
            ) : (
              <BarChart data={trend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income"   name="Income"   fill="#0EA5E9" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#EC4899" radius={[4,4,0,0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-4">Expense Breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={breakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
                {breakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => formatCurrency(Number(v))}
                contentStyle={{ background:'#0F0F1A', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, fontSize:11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {breakdown.slice(0,5).map(c => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  <span className="text-slate-400">{c.name}</span>
                </span>
                <span className="text-slate-300 font-medium">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Net Trend — only for non-trust */}
      {!isTrust && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-4">Net P&L Trend</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="net" name="Net P&L" stroke="#8B5CF6" strokeWidth={2} fill="url(#netGrad)" dot={{ fill: '#8B5CF6', r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
