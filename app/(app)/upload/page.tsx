'use client';
import { useState, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { COMPANIES, formatCurrency } from '@/lib/utils';
import { Company } from '@/types';
import { Upload as UploadIcon, CheckCircle, AlertCircle, X, FileText, Info, ChevronDown, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';

type UploadStatus = 'idle' | 'parsing' | 'preview' | 'uploading' | 'done' | 'error';

// A single transaction line
interface Transaction { date: string; type: string; name: string; memo: string; amount: number; }

// A category with its transactions and total
interface ParsedCategory {
  category:     string;
  type:         'income' | 'expense';
  total:        number;
  transactions: Transaction[];
}

// Flat row stored in Supabase
interface FlatRow {
  category:    string;
  description: string;
  amount:      number;
  type:        'income' | 'expense';
  txDate:      string;
  txType:      string;
  txName:      string;
  txMemo:      string;
}

const COMPANY_OPTIONS: Exclude<Company,'All'>[] = ['IM','WSH','Abundant'];

// ── QuickBooks P&L Detail Parser ──────────────────────────────────────────────
// QB P&L Detail columns (typical export):
//   A: Account/Category name (or blank for transactions)
//   B: Date (for transactions) OR empty
//   C: Transaction Type
//   D: Num
//   E: Name (vendor/customer)
//   F: Memo/Description
//   G or last non-empty col: Amount
//
// Category rows: text in col A, NO amount
// Transaction rows: blank or date in A/B, amount in last col
// Total rows: "Total <category>" text, has amount (skip — we compute ourselves)

function parseQBDetail(rows: string[][]): ParsedCategory[] {
  const categories: ParsedCategory[] = [];
  let currentType:     'income' | 'expense' = 'expense';
  let currentCategory: ParsedCategory | null = null;

  for (const row of rows) {
    if (!row || row.every(c => !c || !String(c).trim())) continue;

    // Normalize cells
    const cells = row.map(c => String(c ?? '').trim());
    const colA  = cells[0] ?? '';
    const colB  = cells[1] ?? '';

    // ── Section headers ──────────────────────────────────────────────────────
    if (/^income$/i.test(colA) || /ordinary income/i.test(colA)) {
      currentType = 'income';
      continue;
    }
    if (/^(expenses?|cost of goods|other expense)/i.test(colA)) {
      currentType = 'expense';
      continue;
    }

    // ── Skip title / summary rows ─────────────────────────────────────────────
    if (/^(profit.+loss|cash basis|accrual basis)/i.test(colA)) continue;
    if (/^total\s+(income|expenses?|ordinary|gross|net)/i.test(colA)) continue;
    if (/^(net\s|gross\s)/i.test(colA) && !cells.slice(1).some(c => c)) continue;

    // ── Total row for current category — extract total, skip ─────────────────
    if (/^total /i.test(colA)) {
      const amt = parseAmount(cells);
      if (currentCategory && amt !== null) currentCategory.total = amt;
      categories.push(currentCategory!);
      currentCategory = null;
      continue;
    }

    // ── Find amount in this row ──────────────────────────────────────────────
    const amt = parseAmount(cells);

    // ── Category header: has text in A, no amount (or amount but no date) ────
    // We detect categories by: text in colA, AND it doesn't look like a date/type
    const looksLikeCategory = colA &&
      !isDate(colA) && !isDate(colB) &&
      !/^(invoice|payment|deposit|credit memo|bill|check|journal|transfer|expense|refund)/i.test(colA) &&
      amt === null;

    if (looksLikeCategory) {
      // Save previous if open
      if (currentCategory && currentCategory.transactions.length > 0) {
        categories.push(currentCategory);
      }
      currentCategory = { category: colA, type: currentType, total: 0, transactions: [] };
      continue;
    }

    // ── Transaction row ───────────────────────────────────────────────────────
    if (currentCategory && amt !== null && Math.abs(amt) > 0) {
      // Figure out columns — QB Detail is usually:
      // Col0=blank|category, Col1=Date, Col2=Type, Col3=Num, Col4=Name, Col5=Memo, Col6=Amount
      // OR: Col0=Date, Col1=Type, Col2=Num, Col3=Name, Col4=Memo, Col5=Amount
      let txDate = '', txType = '', txName = '', txMemo = '';

      if (isDate(colA)) {
        txDate = colA; txType = cells[1]; txName = cells[3] || cells[2]; txMemo = cells[4] || '';
      } else if (isDate(colB)) {
        txDate = colB; txType = cells[2]; txName = cells[4] || cells[3]; txMemo = cells[5] || '';
      } else {
        txDate = ''; txType = cells[1]; txName = cells[3] || colA; txMemo = cells[4] || '';
      }

      currentCategory.transactions.push({
        date:   txDate,
        type:   txType,
        name:   txName,
        memo:   txMemo,
        amount: Math.abs(amt),
      });
    }
  }

  // Push last open category
  if (currentCategory && currentCategory.transactions.length > 0) {
    categories.push(currentCategory);
  }

  // Compute totals from transactions where missing
  for (const cat of categories) {
    if (!cat.total) cat.total = cat.transactions.reduce((s, t) => s + t.amount, 0);
  }

  return categories.filter(c => c.total > 0);
}

function isDate(s: string): boolean {
  return /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(s);
}

function parseAmount(cells: string[]): number | null {
  for (let i = cells.length - 1; i >= 1; i--) {
    const raw = cells[i].replace(/[$,\s]/g, '');
    if (/^-?\d+(\.\d{1,2})?$/.test(raw)) return parseFloat(raw);
  }
  return null;
}

// Flatten categories → rows for Supabase
function flattenToRows(cats: ParsedCategory[]): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const cat of cats) {
    if (cat.transactions.length === 0) {
      rows.push({ category: cat.category, description: cat.category, amount: cat.total, type: cat.type, txDate: '', txType: '', txName: '', txMemo: '' });
    } else {
      for (const tx of cat.transactions) {
        rows.push({ category: cat.category, description: tx.name || tx.memo || cat.category, amount: tx.amount, type: cat.type, txDate: tx.date, txType: tx.type, txName: tx.name, txMemo: tx.memo });
      }
    }
  }
  return rows;
}

async function readAsBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = e => res(e.target!.result as ArrayBuffer); r.onerror = rej; r.readAsArrayBuffer(file); });
}

function fileToSheetRows(buffer: ArrayBuffer, fileName: string): string[][] {
  const wb   = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true });
  const ws   = wb.Sheets[wb.SheetNames[0]];
  const raw  = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' }) as string[][];
  return raw;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function UploadPage() {
  const { user }    = useApp();
  const [selectedCompany, setSelectedCompany] = useState<Exclude<Company,'All'>>('IM');
  const [period,    setPeriod]    = useState('');
  const [file,      setFile]      = useState<File | null>(null);
  const [cats,      setCats]      = useState<ParsedCategory[]>([]);
  const [status,    setStatus]    = useState<UploadStatus>('idle');
  const [errorMsg,  setErrorMsg]  = useState('');
  const [isDragging,setIsDragging]= useState(false);
  const [expanded,  setExpanded]  = useState<Set<string>>(new Set());
  const [batchId,   setBatchId]   = useState('');

  const toggle = (cat: string) =>
    setExpanded(prev => { const s = new Set(prev); s.has(cat) ? s.delete(cat) : s.add(cat); return s; });

  const handleFile = useCallback(async (f: File) => {
    setFile(f); setStatus('parsing'); setErrorMsg('');
    try {
      const buf  = await readAsBuffer(f);
      const rows = fileToSheetRows(buf, f.name);
      const parsed = parseQBDetail(rows);
      if (!parsed.length) throw new Error('No recognizable P&L data found. Make sure this is a QuickBooks Profit & Loss Detail export.');
      setCats(parsed);
      setStatus('preview');
    } catch (e: any) { setErrorMsg(e.message); setStatus('error'); }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && /\.(xlsx?|csv)$/i.test(f.name)) handleFile(f);
    else setErrorMsg('Please upload a .xlsx or .csv file.');
  }, [handleFile]);

  const handleConfirm = async () => {
    if (!period) { setErrorMsg('Please select a period.'); return; }
    setStatus('uploading');
    try {
      const flatRows = flattenToRows(cats);
      const res  = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: selectedCompany, period, filename: file?.name, rows: flatRows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setBatchId(data.batchId);
      setStatus('done');
    } catch (e: any) { setErrorMsg(e.message); setStatus('preview'); }
  };

  const reset = () => { setFile(null); setCats([]); setStatus('idle'); setErrorMsg(''); setBatchId(''); setExpanded(new Set()); };

  const incCats  = cats.filter(c => c.type === 'income');
  const expCats  = cats.filter(c => c.type === 'expense');
  const totalInc = incCats.reduce((s,c) => s + c.total, 0);
  const totalExp = expCats.reduce((s,c) => s + c.total, 0);

  const isAdmin = user?.role === 'admin';
  if (!isAdmin) return <div className="flex items-center justify-center h-64"><p className="text-slate-500">Admin access required.</p></div>;

  return (
    <div className="max-w-3xl space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Data</h1>
        <p className="text-sm text-slate-500 mt-0.5">Import QuickBooks Profit & Loss Detail (.xlsx)</p>
      </div>

      <div className="card p-4 flex gap-3 border-l-4" style={{ borderLeftColor: '#0EA5E9' }}>
        <Info size={16} className="text-brand-cyan flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 space-y-0.5">
          <p className="font-semibold text-slate-300">What to upload:</p>
          <p>• QuickBooks → Reports → <span className="text-white">Profit and Loss Detail</span> → Export Excel</p>
          <p>• Includes individual transactions — click any category to see them after upload</p>
        </div>
      </div>

      {status === 'done' ? (
        <div className="card p-10 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <CheckCircle size={36} className="text-positive" />
          </div>
          <p className="text-xl font-bold text-white">Upload Successful!</p>
          <p className="text-sm text-slate-400">
            {cats.length} categories · {flattenToRows(cats).length} transactions imported for&nbsp;
            <span className="text-white font-medium">{selectedCompany}</span> · {new Date(period + '-01').toLocaleDateString('en-US',{month:'long',year:'numeric'})}
          </p>
          {batchId && <p className="text-xs text-slate-600 font-mono">Batch: {batchId}</p>}
          <button onClick={reset} className="btn-primary px-6">Upload Another Month</button>
        </div>
      ) : (
        <>
          {/* Config */}
          <div className="card p-5 flex gap-6 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-400 mb-2">Company *</label>
              <div className="flex gap-2">
                {COMPANY_OPTIONS.map(c => {
                  const active = selectedCompany === c;
                  const color  = COMPANIES[c].color;
                  return (
                    <button key={c} onClick={() => setSelectedCompany(c)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                      style={active ? { background: color+'20', color, borderColor: color+'60' }
                                    : { background:'transparent', color:'#64748B', borderColor:'rgba(255,255,255,0.07)' }}>
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-400 mb-2">Period (Month) *</label>
              <input type="month" value={period} onChange={e => setPeriod(e.target.value)}
                className="w-full bg-bg-base border border-bg-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-violet transition-colors" />
            </div>
          </div>

          {/* Drop zone */}
          {(status === 'idle' || status === 'error') && (
            <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)}
              onClick={() => document.getElementById('file-input')?.click()}
              className={`card p-14 flex flex-col items-center gap-3 cursor-pointer transition-all ${isDragging ? 'border-brand-violet bg-brand-violet/5' : 'hover:border-slate-600'}`}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#0EA5E9,#8B5CF6)' }}>
                <UploadIcon size={24} className="text-white" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">Drop your QuickBooks Excel here</p>
                <p className="text-sm text-slate-500 mt-1">or click to browse · .xlsx supported</p>
              </div>
              <input id="file-input" type="file" accept=".xlsx,.xls,.csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          )}

          {status === 'parsing' && (
            <div className="card p-12 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Parsing {file?.name}…</p>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-negative/30 bg-negative/10 text-sm text-negative">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg('')} className="ml-auto"><X size={14} /></button>
            </div>
          )}

          {/* Preview — grouped by category, expandable */}
          {status === 'preview' && (
            <div className="card overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-brand-cyan" />
                    <p className="font-semibold text-white">{file?.name}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{cats.length} categories · {selectedCompany} · {period}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={reset} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
                  <button onClick={handleConfirm} disabled={!period}
                    className="btn-primary text-xs px-4 py-1.5 disabled:opacity-40 flex items-center gap-2">
                    {(status as string) === 'uploading'
                      ? <><span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                      : 'Confirm Import'}
                  </button>
                </div>
              </div>

              {/* Summary strip */}
              <div className="px-5 py-3 bg-bg-hover flex gap-6 text-xs border-b border-bg-border">
                <span className="text-slate-500">Income: <span className="text-positive font-medium">{formatCurrency(totalInc)}</span> ({incCats.length} categories)</span>
                <span className="text-slate-500">Expenses: <span className="text-negative font-medium">{formatCurrency(totalExp)}</span> ({expCats.length} categories)</span>
                <span className="text-slate-500">Net: <span className={`font-medium ${totalInc-totalExp>=0?'text-positive':'text-negative'}`}>{formatCurrency(totalInc-totalExp)}</span></span>
              </div>

              {/* Category list — expandable */}
              <div className="overflow-y-auto max-h-96">
                {/* Income */}
                {incCats.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs font-bold text-positive bg-positive/5 uppercase tracking-wider">Income</div>
                    {incCats.map(cat => (
                      <CategoryRow key={cat.category} cat={cat} expanded={expanded.has(cat.category)} onToggle={() => toggle(cat.category)} />
                    ))}
                  </>
                )}
                {/* Expenses */}
                {expCats.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs font-bold text-negative bg-negative/5 uppercase tracking-wider">Expenses</div>
                    {expCats.map(cat => (
                      <CategoryRow key={cat.category} cat={cat} expanded={expanded.has(cat.category)} onToggle={() => toggle(cat.category)} />
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CategoryRow({ cat, expanded, onToggle }: { cat: ParsedCategory; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-hover transition-colors border-b border-bg-border/50 text-left">
        <div className="flex items-center gap-2">
          {cat.transactions.length > 0
            ? expanded ? <ChevronDown size={13} className="text-slate-500" /> : <ChevronRight size={13} className="text-slate-500" />
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
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs text-slate-400 truncate">{tx.name || tx.memo || '—'}</span>
            {tx.date && <span className="text-xs text-slate-600">{tx.date} · {tx.type}</span>}
          </div>
          <span className="text-xs font-mono text-slate-300 ml-4 flex-shrink-0">{formatCurrency(tx.amount)}</span>
        </div>
      ))}
    </>
  );
}
