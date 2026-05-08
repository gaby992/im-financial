'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { formatCurrency, COMPANIES } from '@/lib/utils';
import { Upload } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface Summary { totalIncome: number; totalExpenses: number; netPL: number; margin: number; }
interface TrendItem { month: string; income: number; expenses: number; net: number; }
interface BreakdownItem { name: string; value: number; color: string; }

function buildApiUrl(company: string, dateFilter: any) {
  const params = new URLSearchParams();
  params.set('company', company);
  if (company === 'All') params.set('mode', 'companies');
  if (dateFilter.type === 'month')  params.set('period', `${dateFilter.year}-${String(dateFilter.month).padStart(2,'0')}`);
  if (dateFilter.type === 'custom') { params.set('from', dateFilter.range.from); params.set('to', dateFilter.range.to); }
  return `/api/data?${params}`;
}

const Tooltip_ = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card p-3 text-xs space-y-1">
      <p className="font-semibold text-slate-300">{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>)}
    </div>
  );
};

function KPICard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="kpi-card">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold mt-1" style={{ color: color ?? '#fff' }}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { company, dateFilter } = useApp();
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch(buildApiUrl(company, dateFilter))
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [company, dateFilter]);

  useEffect(() => { load(); }, [load]);

  const companyLabel = company === 'All' ? 'All Companies' : COMPANIES[company as keyof typeof COMPANIES]?.name ?? company;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
    </div>
  );

  if (!data?.hasData) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-5 animate-slide-up">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#0EA5E9,#8B5CF6)' }}>
        <Upload size={32} className="text-white" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white">No data yet for {companyLabel}</h2>
        <p className="text-slate-500 text-sm max-w-sm">Upload a QuickBooks P&L Detail Excel file to start seeing your financials here.</p>
      </div>
      <Link href="/upload" className="btn-primary px-6 py-3 flex items-center gap-2 text-sm font-semibold">
        <Upload size={16} /> Upload First Statement
      </Link>
    </div>
  );

  const summary  = data.summary as Summary;
  const trend    = (data.trend ?? []) as TrendItem[];
  const breakdown = (data.breakdown ?? []) as BreakdownItem[];
  const isPos    = (summary?.netPL ?? 0) >= 0;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">{companyLabel}</p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full border" style={{ background:'rgba(14,165,233,0.1)', color:'#0EA5E9', borderColor:'rgba(14,165,233,0.2)' }}>
          Live QB Data
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Total Income"   value={formatCurrency(summary?.totalIncome ?? 0)}   color="#10B981" />
        <KPICard label="Total Expenses" value={formatCurrency(summary?.totalExpenses ?? 0)} color="#F43F5E" />
        <KPICard label="Net P&L"        value={formatCurrency(summary?.netPL ?? 0)}         color={isPos ? '#10B981' : '#F43F5E'} sub={`${summary?.margin ?? 0}% margin`} />
        <KPICard label="P&L Margin"     value={`${summary?.margin ?? 0}%`}                  color={isPos ? '#10B981' : '#F43F5E'} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 card p-5">
          <p className="text-sm font-semibold text-white mb-4">Income vs Expenses — Monthly</p>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trend} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => '$'+(v/1000).toFixed(0)+'k'} />
                <Tooltip content={<Tooltip_ />} />
                <Bar dataKey="income"   name="Income"   fill="#0EA5E9" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#EC4899" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-sm text-center py-16">No monthly data</p>}
        </div>

        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-4">Expense Breakdown</p>
          {breakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={breakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                    {breakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))}
                    contentStyle={{ background:'#0F0F1A', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, fontSize:11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {breakdown.slice(0, 5).map(c => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                      <span className="text-slate-400">{c.name}</span>
                    </span>
                    <span className="text-slate-300 font-medium">{formatCurrency(c.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-slate-500 text-sm text-center py-16">No expense data</p>}
        </div>
      </div>

      {trend.length > 1 && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-4">Net P&L Trend</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#64748B', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => '$'+(v/1000).toFixed(0)+'k'} />
              <Tooltip content={<Tooltip_ />} />
              <Area type="monotone" dataKey="net" name="Net P&L" stroke="#8B5CF6" strokeWidth={2} fill="url(#netGrad)" dot={{ fill:'#8B5CF6', r:4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
