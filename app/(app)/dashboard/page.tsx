'use client';
import { useApp } from '@/lib/context';
import { formatCurrency, formatPercent, COMPANIES } from '@/lib/utils';
import { IM_SUMMARY, IM_MONTHLY_TREND, IM_EXPENSE_BREAKDOWN } from '@/lib/im-data';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function KPICard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="kpi-card">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${
        positive === undefined ? 'text-white' : positive ? 'text-positive' : 'text-negative'
      }`}>{value}</p>
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
  const companyLabel = company === 'All' ? 'All Companies' : COMPANIES[company as keyof typeof COMPANIES]?.name ?? company;

  const isPositive = IM_SUMMARY.netPL >= 0;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">{companyLabel} · Jan – Apr 2026</p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full border"
          style={{ background:'rgba(14,165,233,0.1)', color:'#0EA5E9', borderColor:'rgba(14,165,233,0.2)' }}>
          Live QB Data
        </span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Total Income"    value={formatCurrency(IM_SUMMARY.totalIncome)}    sub="Jan – Apr 2026" />
        <KPICard label="Total Expenses"  value={formatCurrency(IM_SUMMARY.totalExpenses)}  sub="Jan – Apr 2026" />
        <KPICard label="Net P&L"         value={formatCurrency(IM_SUMMARY.netPL)}          sub={formatPercent(IM_SUMMARY.margin) + ' margin'} positive={isPositive} />
        <KPICard label="P&L Margin"      value={formatPercent(IM_SUMMARY.margin)}          positive={isPositive} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Income vs Expenses — 2 cols */}
        <div className="col-span-2 card p-5">
          <p className="text-sm font-semibold text-white mb-4">Income vs Expenses — Monthly</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={IM_MONTHLY_TREND} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false}
                     tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income"   name="Income"   fill="#0EA5E9" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#EC4899" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense breakdown donut */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-4">Expense Breakdown</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={IM_EXPENSE_BREAKDOWN} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                   paddingAngle={2} dataKey="value">
                {IM_EXPENSE_BREAKDOWN.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => formatCurrency(Number(v))}
                contentStyle={{ background:'#0F0F1A', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, fontSize:11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {IM_EXPENSE_BREAKDOWN.slice(0,5).map(c => (
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

      {/* Net P&L Trend */}
      <div className="card p-5">
        <p className="text-sm font-semibold text-white mb-4">Net P&L Trend</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={IM_MONTHLY_TREND}>
            <defs>
              <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false}
                   tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="net" name="Net P&L" stroke="#8B5CF6" strokeWidth={2}
                  fill="url(#netGrad)" dot={{ fill: '#8B5CF6', r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
