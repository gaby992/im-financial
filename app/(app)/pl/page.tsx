'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { formatCurrency, COMPANIES } from '@/lib/utils';
import { ChevronDown, ChevronRight, Download, Upload } from 'lucide-react';

interface Category { category: string; type: string; total: number; transactions: { name: string; amount: number }[]; }
interface Summary { totalIncome: number; totalExpenses: number; netPL: number; margin: number; }

export default function PLPage() {
  const { company } = useApp();
  const [data,      setData]      = useState<{ hasData: boolean; summary: Summary | null; categories: Category[] } | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    fetch(`/api/data?company=${company}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [company]);

  const toggle = (cat: string) =>
    setExpanded(prev => { const s = new Set(prev); s.has(cat) ? s.delete(cat) : s.add(cat); return s; });

  const companyLabel = company === 'All' ? 'All Companies' : COMPANIES[company as keyof typeof COMPANIES]?.name ?? company;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" /></div>;

  if (!data?.hasData) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-5">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#0EA5E9,#8B5CF6)' }}>
        <Upload size={28} className="text-white" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">No data for {companyLabel}</h2>
        <p className="text-slate-500 text-sm mt-1">Upload a QuickBooks P&L file to see your P&L detail here.</p>
      </div>
      <Link href="/upload" className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm">
        <Upload size={15} /> Upload Statement
      </Link>
    </div>
  );

  const { summary, categories } = data;
  const incCats = categories.filter(c => c.type === 'income');
  const expCats = categories.filter(c => c.type === 'expense');

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">P&L Detail</h1>
          <p className="text-sm text-slate-500 mt-0.5">{companyLabel}</p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full border" style={{ background:'rgba(14,165,233,0.1)', color:'#0EA5E9', borderColor:'rgba(14,165,233,0.2)' }}>
          {categories.length} categories · {categories.reduce((s,c) => s + c.transactions.length, 0)} transactions
        </span>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="kpi-card">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Income</p>
          <p className="text-xl font-bold text-positive mt-1">{formatCurrency(summary?.totalIncome ?? 0)}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Expenses</p>
          <p className="text-xl font-bold text-negative mt-1">{formatCurrency(summary?.totalExpenses ?? 0)}</p>
        </div>
        <div className="kpi-card">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Net P&L</p>
          <p className={`text-xl font-bold mt-1 ${(summary?.netPL ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>{formatCurrency(summary?.netPL ?? 0)}</p>
          <p className="text-xs text-slate-500">{summary?.margin ?? 0}% margin</p>
        </div>
      </div>

      {/* Category table */}
      <div className="card overflow-hidden">
        {/* INCOME */}
        {incCats.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-positive bg-positive/5">Income</div>
            {incCats.map(cat => <CategoryRow key={cat.category} cat={cat} expanded={expanded.has(cat.category)} onToggle={() => toggle(cat.category)} />)}
            <div className="flex justify-between px-4 py-3 font-bold text-sm border-t border-positive/20 bg-positive/5">
              <span className="text-positive">Total Income</span>
              <span className="text-positive font-mono">{formatCurrency(incCats.reduce((s,c) => s+c.total,0))}</span>
            </div>
          </>
        )}

        {/* EXPENSES */}
        {expCats.length > 0 && (
          <>
            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-negative bg-negative/5 border-t border-bg-border">Expenses</div>
            {expCats.map(cat => <CategoryRow key={cat.category} cat={cat} expanded={expanded.has(cat.category)} onToggle={() => toggle(cat.category)} />)}
            <div className="flex justify-between px-4 py-3 font-bold text-sm border-t border-negative/20 bg-negative/5">
              <span className="text-negative">Total Expenses</span>
              <span className="text-negative font-mono">{formatCurrency(expCats.reduce((s,c) => s+c.total,0))}</span>
            </div>
          </>
        )}

        {/* Net */}
        <div className="flex justify-between px-4 py-4 border-t-2 border-slate-600" style={{ background:'#0F0F1A' }}>
          <span className="font-bold text-white text-base">NET P&L</span>
          <span className={`font-bold font-mono text-xl ${(summary?.netPL ?? 0) >= 0 ? 'text-positive' : 'text-negative'}`}>{formatCurrency(summary?.netPL ?? 0)}</span>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ cat, expanded, onToggle }: { cat: Category; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-hover transition-colors border-b border-bg-border/50 text-left">
        <div className="flex items-center gap-2">
          {cat.transactions.length > 0
            ? (expanded ? <ChevronDown size={13} className="text-slate-500" /> : <ChevronRight size={13} className="text-slate-500" />)
            : <span className="w-3" />}
          <span className="text-sm font-medium text-white">{cat.category}</span>
          <span className="text-xs text-slate-600">{cat.transactions.length} txn{cat.transactions.length !== 1 ? 's' : ''}</span>
        </div>
        <span className={`text-sm font-semibold tabular-nums ${cat.type === 'income' ? 'text-positive' : 'text-slate-300'}`}>
          {formatCurrency(cat.total)}
        </span>
      </button>
      {expanded && cat.transactions.map((tx, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-2 pl-10 border-b border-bg-border/30 bg-bg-base/30">
          <span className="text-xs text-slate-400 truncate">{tx.name || '—'}</span>
          <span className="text-xs font-mono text-slate-300 ml-4 flex-shrink-0">{formatCurrency(tx.amount)}</span>
        </div>
      ))}
    </>
  );
}
