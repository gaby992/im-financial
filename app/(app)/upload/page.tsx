'use client';
import { useState, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { COMPANIES, formatCurrency } from '@/lib/utils';
import { Company } from '@/types';
import { Upload as UploadIcon, CheckCircle, AlertCircle, X, FileText, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

type UploadStatus = 'idle' | 'parsing' | 'preview' | 'uploading' | 'done' | 'error';

interface ParsedRow { category: string; description: string; amount: number; type: 'income' | 'expense'; }

const COMPANY_OPTIONS: Exclude<Company,'All'>[] = ['IM','WSH','Abundant'];

// ── QuickBooks P&L Detail CSV/Text Parser ─────────────────────────────────────
// Handles both the raw QuickBooks CSV format and simple 3-col format
function parseQBFile(content: string): ParsedRow[] {
  const lines = content.split(/\r?\n/);
  const parsed: ParsedRow[] = [];
  let currentCategory = '';
  let currentType: 'income' | 'expense' = 'expense';

  for (const rawLine of lines) {
    const cols = rawLine.split(',').map(c => c.replace(/^"|"$/g, '').trim());
    const colA = cols[0] ?? '';
    const amountCol = cols.find((c, i) => i > 0 && /^\$?[\d,]+(\.\d{2})?$/.test(c.replace(/[$,]/g, '')));

    // Skip pure header/title rows
    if (!colA && !amountCol) continue;
    if (colA.toLowerCase().includes('profit and loss')) continue;
    if (colA.toLowerCase().includes('transaction date')) continue;
    if (colA.toLowerCase().includes('cash basis')) continue;

    // Detect section type
    if (colA === 'Income' || colA.includes('Ordinary Income')) { currentType = 'income'; continue; }
    if (colA === 'Expenses' || colA === 'Cost of Goods Sold') { currentType = 'expense'; continue; }

    // Skip aggregate total rows
    if (colA.toLowerCase().startsWith('total for') || colA.toLowerCase() === 'gross profit') continue;
    if (colA === 'Net Ordinary Income' || colA === 'Net Income' || colA === 'Net Other Income') continue;
    if (colA === 'Other Income/Expense' || colA === 'Other Income' || colA === 'Other Expense') continue;

    // Category header (no amount in this row)
    if (colA && !amountCol) {
      if (!colA.toLowerCase().startsWith('total')) {
        currentCategory = colA;
      }
      continue;
    }

    // Data row — needs an amount
    if (!amountCol) continue;
    const amount = parseFloat(amountCol.replace(/[$,]/g, ''));
    if (isNaN(amount) || amount === 0) continue;

    // Description: prefer cols[4] (Name) or cols[7] (Description) for QB Detail format
    const name   = (cols[4] ?? '').trim();
    const desc   = (cols[7] ?? '').trim();
    const fallback = (cols[1] ?? colA).trim();
    const description = name || desc || fallback;

    parsed.push({ category: currentCategory || 'Uncategorized', description, amount: Math.abs(amount), type: currentType });
  }

  return parsed;
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target!.result as string);
    r.onerror = rej;
    r.readAsText(file, 'utf-8');
  });
}

// Parse Excel (.xlsx) using the xlsx library — same QB P&L format
function parseXLSXFile(buffer: ArrayBuffer): ParsedRow[] {
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  // Convert sheet to CSV string and reuse the same text parser
  const csv = XLSX.utils.sheet_to_csv(ws);
  return parseQBFile(csv);
}

async function readFileAsBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target!.result as ArrayBuffer);
    r.onerror = rej;
    r.readAsArrayBuffer(file);
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function UploadPage() {
  const { user } = useApp();
  const [selectedCompany, setSelectedCompany] = useState<Exclude<Company,'All'>>('IM');
  const [period, setPeriod] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [batchId, setBatchId] = useState('');

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setStatus('parsing');
    setErrorMsg('');
    try {
      let parsed: ParsedRow[];
      if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
        const buffer = await readFileAsBuffer(f);
        parsed = parseXLSXFile(buffer);
      } else {
        const text = await readFileAsText(f);
        parsed = parseQBFile(text);
      }
      if (!parsed.length) throw new Error('No data rows found. Make sure this is a QuickBooks P&L Detail Excel or CSV export.');
      setRows(parsed);
      setStatus('preview');
    } catch (e: any) {
      setErrorMsg(e.message ?? 'Failed to parse file.');
      setStatus('error');
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && /\.(xlsx?|csv|txt)$/i.test(f.name)) handleFile(f);
    else setErrorMsg('Please upload a .xlsx or .csv file.');
  }, [handleFile]);

  const handleConfirm = async () => {
    if (!period) { setErrorMsg('Please select a period (month + year).'); return; }
    setStatus('uploading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: selectedCompany, period, filename: file?.name, rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setBatchId(data.batchId);
      setStatus('done');
    } catch (e: any) {
      setErrorMsg(e.message);
      setStatus('preview');
    }
  };

  const reset = () => { setFile(null); setRows([]); setStatus('idle'); setErrorMsg(''); setBatchId(''); };

  const incomeRows  = rows.filter(r => r.type === 'income');
  const expenseRows = rows.filter(r => r.type === 'expense');
  const totalIncome  = incomeRows.reduce((s, r) => s + r.amount, 0);
  const totalExpense = expenseRows.reduce((s, r) => s + r.amount, 0);

  const isAdmin = user?.role === 'admin';
  if (!isAdmin) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-500">Admin access required to upload data.</p>
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Upload Data</h1>
        <p className="text-sm text-slate-500 mt-0.5">Import QuickBooks P&L Detail export (.csv) month by month</p>
      </div>

      {/* Tip */}
      <div className="card p-4 flex gap-3 border-l-4" style={{ borderLeftColor: '#0EA5E9' }}>
        <Info size={16} className="text-brand-cyan flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 space-y-0.5">
          <p className="font-semibold text-slate-300">Upload your QuickBooks Excel file:</p>
          <p>• Accepts <span className="text-white">.xlsx</span> (Excel) or <span className="text-white">.csv</span> files</p>
          <p>• Can be a single month or a date range — you select the period below</p>
          <p>• The app reads the P&amp;L categories and amounts automatically</p>
        </div>
      </div>

      {status === 'done' ? (
        <div className="card p-10 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <CheckCircle size={36} className="text-positive" />
          </div>
          <p className="text-xl font-bold text-white">Upload Successful!</p>
          <p className="text-sm text-slate-400">{rows.length} rows imported for <span className="text-white font-medium">{selectedCompany}</span> · {new Date(period + '-01').toLocaleDateString('en-US',{month:'long',year:'numeric'})}</p>
          {batchId && <p className="text-xs text-slate-600 font-mono">Batch ID: {batchId}</p>}
          <div className="flex gap-3">
            <button onClick={reset} className="btn-primary px-6">Upload Another Month</button>
          </div>
        </div>
      ) : (
        <>
          {/* Config row */}
          <div className="card p-5 flex gap-6 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-400 mb-2">Company *</label>
              <div className="flex gap-2">
                {COMPANY_OPTIONS.map(c => {
                  const active = selectedCompany === c;
                  const color = COMPANIES[c].color;
                  return (
                    <button key={c} onClick={() => setSelectedCompany(c)}
                      className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                      style={active
                        ? { background: color + '20', color, borderColor: color + '60' }
                        : { background: 'transparent', color: '#64748B', borderColor: 'rgba(255,255,255,0.07)' }}>
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
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => document.getElementById('file-input')?.click()}
              className={`card p-14 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 ${
                isDragging ? 'border-brand-violet bg-brand-violet/5' : 'hover:border-slate-600'
              }`}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg,#0EA5E9,#8B5CF6)' }}>
                <UploadIcon size={24} className="text-white" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">Drop your Excel or CSV file here</p>
                <p className="text-sm text-slate-500 mt-1">or click to browse · .xlsx and .csv supported</p>
              </div>
              <input id="file-input" type="file" accept=".xlsx,.xls,.csv,.txt" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          )}

          {/* Parsing spinner */}
          {status === 'parsing' && (
            <div className="card p-12 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Parsing {file?.name}…</p>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-negative/30 bg-negative/10 text-sm text-negative">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg('')} className="ml-auto flex-shrink-0"><X size={14} /></button>
            </div>
          )}

          {/* Preview */}
          {status === 'preview' && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText size={15} className="text-brand-cyan" />
                    <p className="font-semibold text-white">{file?.name}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{rows.length} rows · {selectedCompany} · {period}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={reset} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
                  <button onClick={handleConfirm} disabled={!period || status === 'uploading' as any}
                    className="btn-primary text-xs px-4 py-1.5 disabled:opacity-40 flex items-center gap-2">
                    {(status as string) === 'uploading'
                      ? <><span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                      : 'Confirm Import'}
                  </button>
                </div>
              </div>

              {/* Summary strip */}
              <div className="px-5 py-3 bg-bg-hover flex gap-6 text-xs border-b border-bg-border">
                <span className="text-slate-500">Income rows: <span className="text-positive font-medium">{incomeRows.length}</span> · {formatCurrency(totalIncome)}</span>
                <span className="text-slate-500">Expense rows: <span className="text-negative font-medium">{expenseRows.length}</span> · {formatCurrency(totalExpense)}</span>
                <span className="text-slate-500">Net: <span className={`font-medium ${totalIncome - totalExpense >= 0 ? 'text-positive' : 'text-negative'}`}>{formatCurrency(totalIncome - totalExpense)}</span></span>
              </div>

              <div className="overflow-y-auto max-h-80">
                <table className="data-table w-full">
                  <thead>
                    <tr className="bg-bg-hover sticky top-0">
                      <th>Type</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 50).map((r, i) => (
                      <tr key={i} className="hover:bg-bg-hover/50">
                        <td>
                          <span className={`company-badge ${r.type === 'income' ? 'badge-wsh' : 'badge-abundant'}`}>
                            {r.type}
                          </span>
                        </td>
                        <td className="text-slate-400 text-sm">{r.category}</td>
                        <td className="text-slate-300 text-sm">{r.description}</td>
                        <td className="text-right font-mono text-sm text-white">{formatCurrency(r.amount)}</td>
                      </tr>
                    ))}
                    {rows.length > 50 && (
                      <tr><td colSpan={4} className="text-center text-xs text-slate-600 py-3">… {rows.length - 50} more rows</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
