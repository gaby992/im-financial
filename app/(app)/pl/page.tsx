'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { formatCurrency, COMPANIES } from '@/lib/utils';
import { ChevronDown, ChevronRight, Upload } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type ViewMode = 'single' | 'monthly' | 'companies';
interface CategorySingle   { category: string; type: string; total: number; transactions: { name: string; amount: number }[]; }
interface CategoryMonthly  { category: string; type: string; byMonth: Record<string,number>; total: number; }
interface CategoryCompanies{ category: string; type: string; byCompany: { IM:number; WSH:number; Abundant:number }; total: number; }
interface Summary { totalIncome: number; totalExpenses: number; netPL: number; margin: number; }

// ── API URL builder ───────────────────────────────────────────────────────────
function buildApiUrl(company: string, dateFilter: any): { url: string; viewMode: ViewMode } {
  const params = new URLSearchParams();
  params.set('company', company);

  // Date filter
  if (dateFilter.type === 'month')  params.set('period', `${dateFilter.year}-${String(dateFilter.month).padStart(2,'0')}`);
  if (dateFilter.type === 'custom') { params.set('from', dateFilter.range.from); params.set('to', dateFilter.range.to); }

  if (company === 'All') {
    params.set('mode', 'companies');
    return { url: `/api/data?${params}`, viewMode: 'companies' };
  }
  if (dateFilter.type === 'all') {
    params.set('mode', 'monthly');
    return { url: `/api/data?${params}`, viewMode: 'monthly' };
  }
  return { url: `/api/data?${params}`, viewMode: 'single' };
}

// ── Summary strip ─────────────────────────────────────────────────────────────
function SummaryStrip({ summary }: { summary: Summary }) {
  const isPos = summary.netPL >= 0;
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="kpi-card"><p className="text-xs text-slate-500 uppercase tracking-wider">Total Income</p><p className="text-xl font-bold text-positive mt-1">{formatCurrency(summary.totalIncome)}</p></div>
      <div className="kpi-card"><p className="text-xs text-slate-500 uppercase tracking-wider">Total Expenses</p><p className="text-xl font-bold text-negative mt-1">{formatCurrency(summary.totalExpenses)}</p></div>
      <div className="kpi-card">
        <p className="text-xs text-slate-500 uppercase tracking-wider">Net P&L</p>
        <p className={`text-xl font-bold mt-1 ${isPos ? 'text-positive' : 'text-negative'}`}>{formatCurrency(summary.netPL)}</p>
        <p className="text-xs text-slate-500">{summary.margin}% margin</p>
      </div>
    </div>
  );
}

// ── Single column table ───────────────────────────────────────────────────────
function SingleTable({ categories }: { categories: CategorySingle[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggle = (c: string) => setExpanded(prev => { const s = new Set(prev); s.has(c) ? s.delete(c) : s.add(c); return s; });
  const incCats = categories.filter(c => c.type === 'income');
  const expCats = categories.filter(c => c.type === 'expense');
  const totalInc = incCats.reduce((s,c)=>s+c.total,0);
  const totalExp = expCats.reduce((s,c)=>s+c.total,0);

  return (
    <div className="card overflow-hidden">
      {incCats.length > 0 && <>
        <SectionHeader label="Income" color="text-positive" bg="bg-positive/5" />
        {incCats.map(c => <SingleRow key={c.category} cat={c} expanded={expanded.has(c.category)} onToggle={() => toggle(c.category)} />)}
        <TotalRow label="Total Income" amount={totalInc} color="text-positive" bg="bg-positive/5" border="border-positive/20" />
      </>}
      {expCats.length > 0 && <>
        <SectionHeader label="Expenses" color="text-negative" bg="bg-negative/5 border-t border-bg-border" />
        {expCats.map(c => <SingleRow key={c.category} cat={c} expanded={expanded.has(c.category)} onToggle={() => toggle(c.category)} />)}
        <TotalRow label="Total Expenses" amount={totalExp} color="text-negative" bg="bg-negative/5" border="border-negative/20" />
      </>}
      <div className="flex justify-between px-4 py-4 border-t-2 border-slate-600" style={{ background:'#0F0F1A' }}>
        <span className="font-bold text-white text-base">NET P&L</span>
        <span className={`font-bold font-mono text-xl ${totalInc-totalExp>=0?'text-positive':'text-negative'}`}>{formatCurrency(totalInc-totalExp)}</span>
      </div>
    </div>
  );
}

function SingleRow({ cat, expanded, onToggle }: { cat: CategorySingle; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-hover transition-colors border-b border-bg-border/50 text-left">
        <div className="flex items-center gap-2">
          {cat.transactions.length > 0 ? (expanded ? <ChevronDown size={13} className="text-slate-500"/> : <ChevronRight size={13} className="text-slate-500"/>) : <span className="w-3"/>}
          <span className="text-sm font-medium text-white">{cat.category}</span>
          <span className="text-xs text-slate-600">{cat.transactions.length} txns</span>
        </div>
        <span className={`text-sm font-semibold tabular-nums ${cat.type==='income'?'text-positive':'text-slate-300'}`}>{formatCurrency(cat.total)}</span>
      </button>
      {expanded && cat.transactions.map((tx,i) => (
        <div key={i} className="flex items-center justify-between px-4 py-2 pl-10 border-b border-bg-border/30 bg-bg-base/30">
          <span className="text-xs text-slate-400 truncate">{tx.name||'—'}</span>
          <span className="text-xs font-mono text-slate-300 ml-4 flex-shrink-0">{formatCurrency(tx.amount)}</span>
        </div>
      ))}
    </>
  );
}

// ── Monthly columns table ─────────────────────────────────────────────────────
function MonthlyTable({ months, categories }: { months: string[]; categories: CategoryMonthly[] }) {
  const incCats  = categories.filter(c => c.type === 'income');
  const expCats  = categories.filter(c => c.type === 'expense');
  const totalInc = months.reduce((acc,m) => { acc[m] = incCats.reduce((s,c) => s+(c.byMonth[m]??0), 0); return acc; }, {} as Record<string,number>);
  const totalExp = months.reduce((acc,m) => { acc[m] = expCats.reduce((s,c) => s+(c.byMonth[m]??0), 0); return acc; }, {} as Record<string,number>);

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-bg-border bg-bg-hover">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 w-48">Category</th>
            {months.map(m => <th key={m} className="px-4 py-3 text-right text-xs font-semibold text-slate-400">{m}</th>)}
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Total</th>
          </tr>
        </thead>
        <tbody>
          {incCats.length > 0 && <>
            <tr><td colSpan={months.length+2} className="px-4 py-2 text-xs font-bold text-positive bg-positive/5 uppercase tracking-wider">Income</td></tr>
            {incCats.map(c => (
              <tr key={c.category} className="hover:bg-bg-hover border-b border-bg-border/50">
                <td className="px-4 py-3 text-sm text-white font-medium">{c.category}</td>
                {months.map(m => <td key={m} className="px-4 py-3 text-right text-sm text-slate-300 font-mono tabular-nums">{c.byMonth[m] ? formatCurrency(c.byMonth[m]) : '—'}</td>)}
                <td className="px-4 py-3 text-right text-sm text-positive font-bold tabular-nums">{formatCurrency(c.total)}</td>
              </tr>
            ))}
            <tr className="bg-positive/5 border-t border-positive/20">
              <td className="px-4 py-3 text-sm font-bold text-positive">Total Income</td>
              {months.map(m => <td key={m} className="px-4 py-3 text-right text-sm text-positive font-bold font-mono">{formatCurrency(totalInc[m]??0)}</td>)}
              <td className="px-4 py-3 text-right text-sm text-positive font-bold font-mono">{formatCurrency(Object.values(totalInc).reduce((s,v)=>s+v,0))}</td>
            </tr>
          </>}
          {expCats.length > 0 && <>
            <tr><td colSpan={months.length+2} className="px-4 py-2 text-xs font-bold text-negative bg-negative/5 uppercase tracking-wider border-t border-bg-border">Expenses</td></tr>
            {expCats.map(c => (
              <tr key={c.category} className="hover:bg-bg-hover border-b border-bg-border/50">
                <td className="px-4 py-3 text-sm text-white font-medium">{c.category}</td>
                {months.map(m => <td key={m} className="px-4 py-3 text-right text-sm text-slate-300 font-mono tabular-nums">{c.byMonth[m] ? formatCurrency(c.byMonth[m]) : '—'}</td>)}
                <td className="px-4 py-3 text-right text-sm text-negative font-bold tabular-nums">{formatCurrency(c.total)}</td>
              </tr>
            ))}
            <tr className="bg-negative/5 border-t border-negative/20">
              <td className="px-4 py-3 text-sm font-bold text-negative">Total Expenses</td>
              {months.map(m => <td key={m} className="px-4 py-3 text-right text-sm text-negative font-bold font-mono">{formatCurrency(totalExp[m]??0)}</td>)}
              <td className="px-4 py-3 text-right text-sm text-negative font-bold font-mono">{formatCurrency(Object.values(totalExp).reduce((s,v)=>s+v,0))}</td>
            </tr>
          </>}
        </tbody>
        <tfoot>
          <tr style={{ background:'#0F0F1A' }} className="border-t-2 border-slate-600">
            <td className="px-4 py-4 font-bold text-white text-base">NET P&L</td>
            {months.map(m => {
              const net = (totalInc[m]??0)-(totalExp[m]??0);
              return <td key={m} className={`px-4 py-4 text-right font-bold font-mono ${net>=0?'text-positive':'text-negative'}`}>{formatCurrency(net)}</td>;
            })}
            {(() => {
              const net = Object.values(totalInc).reduce((s,v)=>s+v,0) - Object.values(totalExp).reduce((s,v)=>s+v,0);
              return <td className={`px-4 py-4 text-right font-bold text-xl font-mono ${net>=0?'text-positive':'text-negative'}`}>{formatCurrency(net)}</td>;
            })()}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ── Companies columns table ───────────────────────────────────────────────────
const COS = ['IM','WSH','Abundant'] as const;
function CompaniesTable({ categories, summaries }: { categories: CategoryCompanies[]; summaries: Record<string,any> }) {
  const incCats = categories.filter(c => c.type === 'income');
  const expCats = categories.filter(c => c.type === 'expense');

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-bg-border bg-bg-hover">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 w-48">Category</th>
            {COS.map(c => <th key={c} className="px-4 py-3 text-right text-xs font-semibold text-slate-400">{COMPANIES[c].name.split(' ')[0]}</th>)}
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Total</th>
          </tr>
        </thead>
        <tbody>
          {incCats.length > 0 && <>
            <tr><td colSpan={5} className="px-4 py-2 text-xs font-bold text-positive bg-positive/5 uppercase tracking-wider">Income</td></tr>
            {incCats.map(c => (
              <tr key={c.category} className="hover:bg-bg-hover border-b border-bg-border/50">
                <td className="px-4 py-3 text-sm text-white font-medium">{c.category}</td>
                {COS.map(co => <td key={co} className="px-4 py-3 text-right text-sm text-slate-300 font-mono tabular-nums">{c.byCompany[co] ? formatCurrency(c.byCompany[co]) : '—'}</td>)}
                <td className="px-4 py-3 text-right text-sm text-positive font-bold tabular-nums">{formatCurrency(c.total)}</td>
              </tr>
            ))}
            <tr className="bg-positive/5 border-t border-positive/20">
              <td className="px-4 py-3 text-sm font-bold text-positive">Total Income</td>
              {COS.map(co => <td key={co} className="px-4 py-3 text-right text-sm text-positive font-bold font-mono">{formatCurrency(summaries?.[co]?.totalIncome??0)}</td>)}
              <td className="px-4 py-3 text-right text-sm text-positive font-bold font-mono">{formatCurrency(COS.reduce((s,co)=>s+(summaries?.[co]?.totalIncome??0),0))}</td>
            </tr>
          </>}
          {expCats.length > 0 && <>
            <tr><td colSpan={5} className="px-4 py-2 text-xs font-bold text-negative bg-negative/5 uppercase tracking-wider border-t border-bg-border">Expenses</td></tr>
            {expCats.map(c => (
              <tr key={c.category} className="hover:bg-bg-hover border-b border-bg-border/50">
                <td className="px-4 py-3 text-sm text-white font-medium">{c.category}</td>
                {COS.map(co => <td key={co} className="px-4 py-3 text-right text-sm text-slate-300 font-mono tabular-nums">{c.byCompany[co] ? formatCurrency(c.byCompany[co]) : '—'}</td>)}
                <td className="px-4 py-3 text-right text-sm text-negative font-bold tabular-nums">{formatCurrency(c.total)}</td>
              </tr>
            ))}
            <tr className="bg-negative/5 border-t border-negative/20">
              <td className="px-4 py-3 text-sm font-bold text-negative">Total Expenses</td>
              {COS.map(co => <td key={co} className="px-4 py-3 text-right text-sm text-negative font-bold font-mono">{formatCurrency(summaries?.[co]?.totalExpenses??0)}</td>)}
              <td className="px-4 py-3 text-right text-sm text-negative font-bold font-mono">{formatCurrency(COS.reduce((s,co)=>s+(summaries?.[co]?.totalExpenses??0),0))}</td>
            </tr>
          </>}
        </tbody>
        <tfoot>
          <tr style={{ background:'#0F0F1A' }} className="border-t-2 border-slate-600">
            <td className="px-4 py-4 font-bold text-white text-base">NET P&L</td>
            {COS.map(co => {
              const net = (summaries?.[co]?.netPL ?? 0);
              return <td key={co} className={`px-4 py-4 text-right font-bold font-mono ${net>=0?'text-positive':'text-negative'}`}>{formatCurrency(net)}</td>;
            })}
            {(() => {
              const net = COS.reduce((s,co)=>s+(summaries?.[co]?.netPL??0),0);
              return <td className={`px-4 py-4 text-right font-bold text-xl font-mono ${net>=0?'text-positive':'text-negative'}`}>{formatCurrency(net)}</td>;
            })()}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function SectionHeader({ label, color, bg }: { label: string; color: string; bg: string }) {
  return <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${color} ${bg}`}>{label}</div>;
}
function TotalRow({ label, amount, color, bg, border }: any) {
  return (
    <div className={`flex justify-between px-4 py-3 font-bold text-sm border-t ${border} ${bg}`}>
      <span className={color}>{label}</span>
      <span className={`${color} font-mono`}>{formatCurrency(amount)}</span>
    </div>
  );
}

function getViewLabel(company: string, dateFilter: any) {
  const co = company === 'All' ? 'All Companies' : COMPANIES[company as keyof typeof COMPANIES]?.name ?? company;
  if (dateFilter.type === 'month') {
    const m = new Date(dateFilter.year, dateFilter.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return `${co} · ${m}`;
  }
  if (dateFilter.type === 'custom') return `${co} · ${dateFilter.range.from} → ${dateFilter.range.to}`;
  return `${co} · All Periods`;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PLPage() {
  const { company, dateFilter } = useApp();
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const { url } = buildApiUrl(company, dateFilter);
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [company, dateFilter]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" /></div>;

  if (!data?.hasData) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-5">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#0EA5E9,#8B5CF6)' }}>
        <Upload size={28} className="text-white" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">No data for this selection</h2>
        <p className="text-slate-500 text-sm mt-1">Try selecting a different company or time period, or upload a statement.</p>
      </div>
      <Link href="/upload" className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm"><Upload size={15}/> Upload Statement</Link>
    </div>
  );

  const { viewMode } = buildApiUrl(company, dateFilter);
  const viewLabel = getViewLabel(company, dateFilter);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">P&L Detail</h1>
          <p className="text-sm text-slate-500 mt-0.5">{viewLabel}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="px-2 py-1 rounded-full border border-bg-border bg-bg-hover capitalize">{viewMode === 'companies' ? 'By Company' : viewMode === 'monthly' ? 'By Month' : 'Detail'}</span>
        </div>
      </div>

      {data.summary && <SummaryStrip summary={data.summary} />}

      {viewMode === 'single'    && <SingleTable categories={data.categories} />}
      {viewMode === 'monthly'   && <MonthlyTable months={data.months ?? []} categories={data.categories} />}
      {viewMode === 'companies' && <CompaniesTable categories={data.categories} summaries={data.summaries} />}
    </div>
  );
}
