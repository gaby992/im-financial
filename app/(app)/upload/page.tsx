'use client';
import { useState, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { COMPANIES } from '@/lib/utils';
import { Company } from '@/types';
import { Upload as UploadIcon, CheckCircle, AlertCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';

type UploadStatus = 'idle' | 'parsing' | 'preview' | 'uploading' | 'done' | 'error';

interface ParsedRow { category: string; description: string; amount: number; }

const COMPANY_OPTIONS: Exclude<Company,'All'>[] = ['IM','WSH','Abundant'];

function parseXLSX(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const parsed: ParsedRow[] = [];
        let currentCategory = '';

        for (const row of rows) {
          if (!row[0] && !row[1]) continue;
          const colA = String(row[0] ?? '').trim();
          const colB = String(row[1] ?? '').trim();
          const colC = row[2];

          // Skip header/title rows
          if (colA.toLowerCase().includes('sub-category') || colA.toLowerCase().includes('total:')) continue;
          if (typeof colC !== 'number' && !colC) {
            // Category header
            if (colA && !colA.toLowerCase().startsWith('total')) currentCategory = colA;
            continue;
          }
          // Skip total rows
          if (colA.toLowerCase().startsWith('total')) continue;

          const amount = typeof colC === 'number' ? colC : parseFloat(String(colC).replace(/[$,]/g,''));
          if (isNaN(amount)) continue;

          parsed.push({ category: currentCategory, description: colB || colA, amount });
        }
        resolve(parsed);
      } catch (err) { reject(err); }
    };
    reader.readAsArrayBuffer(file);
  });
}

export default function UploadPage() {
  const { user } = useApp();
  const [selectedCompany, setSelectedCompany] = useState<Exclude<Company,'All'>>('IM');
  const [period, setPeriod] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setStatus('parsing');
    setErrorMsg('');
    try {
      const parsed = await parseXLSX(f);
      if (!parsed.length) throw new Error('No data rows found in file.');
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
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.csv'))) handleFile(f);
    else setErrorMsg('Please upload a .xlsx or .csv file.');
  }, [handleFile]);

  const handleConfirm = async () => {
    if (!period) { setErrorMsg('Please select a period.'); return; }
    setStatus('uploading');
    // TODO: insert into Supabase
    await new Promise(r => setTimeout(r, 1200));
    setStatus('done');
  };

  const reset = () => { setFile(null); setRows([]); setStatus('idle'); setErrorMsg(''); };

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
        <p className="text-sm text-slate-500 mt-0.5">Import QuickBooks P&L Export (.xlsx or .csv)</p>
      </div>

      {status === 'done' ? (
        <div className="card p-8 flex flex-col items-center gap-4 text-center">
          <CheckCircle size={40} className="text-positive" />
          <p className="text-lg font-semibold text-white">Upload Successful</p>
          <p className="text-sm text-slate-400">{rows.length} rows imported for {selectedCompany} · {period}</p>
          <button onClick={reset} className="btn-primary px-6">Upload Another</button>
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
              <label className="block text-xs font-medium text-slate-400 mb-2">Period *</label>
              <input type="month" value={period} onChange={e => setPeriod(e.target.value)}
                className="w-full bg-bg-base border border-bg-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-violet transition-colors" />
            </div>
          </div>

          {/* Drop zone */}
          {status === 'idle' || status === 'error' ? (
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => document.getElementById('file-input')?.click()}
              className={`card p-12 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 ${
                isDragging ? 'border-brand-violet bg-brand-violet/5' : 'hover:border-slate-600'
              }`}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg,#0EA5E9,#8B5CF6)' }}>
                <UploadIcon size={24} className="text-white" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium">Drop your file here</p>
                <p className="text-sm text-slate-500 mt-1">or click to browse · .xlsx and .csv supported</p>
              </div>
              <input id="file-input" type="file" accept=".xlsx,.csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          ) : null}

          {/* Parsing spinner */}
          {status === 'parsing' && (
            <div className="card p-12 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Parsing {file?.name}…</p>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-negative/30 bg-negative/10 text-sm text-negative">
              <AlertCircle size={16} /> {errorMsg}
              <button onClick={() => setErrorMsg('')} className="ml-auto"><X size={14} /></button>
            </div>
          )}

          {/* Preview table */}
          {status === 'preview' && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
                <div>
                  <p className="font-semibold text-white">{file?.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{rows.length} rows · {selectedCompany} · {period}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={reset} className="btn-secondary text-xs">Cancel</button>
                  <button onClick={handleConfirm} disabled={!period}
                    className="btn-primary text-xs disabled:opacity-40">
                    {(status as string) === 'uploading' ? 'Saving…' : 'Confirm Import'}
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-80">
                <table className="data-table w-full">
                  <thead>
                    <tr className="bg-bg-hover sticky top-0">
                      <th>Category</th>
                      <th>Description</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0,30).map((r, i) => (
                      <tr key={i} className="hover:bg-bg-hover/50">
                        <td className="text-slate-400 text-sm">{r.category}</td>
                        <td className="text-slate-300 text-sm">{r.description}</td>
                        <td className="text-right font-mono text-sm text-white">${r.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                    {rows.length > 30 && (
                      <tr><td colSpan={3} className="text-center text-xs text-slate-600 py-3">… {rows.length - 30} more rows</td></tr>
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
