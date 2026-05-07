'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/lib/context';
import { formatCurrency } from '@/lib/utils';
import { Download, FileText, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';

interface Category { category: string; type: string; total: number; transactions: { name: string; amount: number }[]; }
interface Summary { totalIncome: number; totalExpenses: number; netPL: number; margin: number; }

const COMPANY_NAMES: Record<string, string> = { IM: 'Interactive Marketing LLC', WSH: 'Western Star Holdings LLC', Abundant: 'Abundant Legacy Trust' };

function generatePDF(company: string, summary: Summary, categories: Category[], periodLabel: string) {
  const name     = COMPANY_NAMES[company] ?? company;
  const isTrust  = company === 'Abundant';
  const fmt      = (n: number) => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(n);
  const incCats  = categories.filter(c => c.type === 'income');
  const expCats  = categories.filter(c => c.type === 'expense');
  const netColor = summary.netPL >= 0 ? '#166534' : '#991b1b';
  const netBg    = summary.netPL >= 0 ? '#DCFCE7'  : '#FEE2E2';

  const catRows = (cats: Category[], headerColor: string) => cats.map(cat => `
    <tr style="background:${headerColor};"><td style="padding:8px 16px;font-weight:700;color:#1e3a5f;font-size:13px;">${cat.category}</td><td></td></tr>
    ${cat.transactions.slice(0,20).map(tx => `<tr><td style="padding:5px 16px 5px 28px;color:#374151;font-size:12px;border-bottom:1px solid #f3f4f6;">${tx.name}</td><td style="padding:5px 16px;text-align:right;color:#374151;font-size:12px;border-bottom:1px solid #f3f4f6;">${fmt(tx.amount)}</td></tr>`).join('')}
    <tr style="background:#1e3a5f;"><td style="padding:7px 16px 7px 28px;color:#fff;font-weight:700;font-size:12px;">Total ${cat.category}</td><td style="padding:7px 16px;text-align:right;color:#fff;font-weight:700;font-size:12px;">${fmt(cat.total)}</td></tr>
  `).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${name} — P&L</title>
  <style>body{font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:0;color:#1f2937}table{width:100%;border-collapse:collapse}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>
  </head><body>
  <div style="background:linear-gradient(135deg,#0EA5E9,#1e3a5f);padding:28px 32px;color:#fff;">
    <p style="font-size:20px;font-weight:800;margin:0">${name}</p>
    <p style="font-size:13px;opacity:.8;margin:4px 0 0">Profit & Loss${isTrust?' — Trust Disbursements':''}</p>
    <p style="font-size:12px;opacity:.7;margin:4px 0 0">${periodLabel} · Cash Basis · Generated ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
    <div style="display:flex;gap:16px;margin-top:20px;">
      ${!isTrust?`<div style="background:rgba(255,255,255,0.15);border-radius:6px;padding:10px 16px;"><p style="font-size:10px;opacity:.7;margin:0;text-transform:uppercase;letter-spacing:1px">Total Income</p><p style="font-size:18px;font-weight:700;margin:2px 0 0">${fmt(summary.totalIncome)}</p></div>`:''}
      <div style="background:rgba(255,255,255,0.15);border-radius:6px;padding:10px 16px;"><p style="font-size:10px;opacity:.7;margin:0;text-transform:uppercase;letter-spacing:1px">${isTrust?'Total Disbursements':'Total Expenses'}</p><p style="font-size:18px;font-weight:700;margin:2px 0 0">${fmt(summary.totalExpenses)}</p></div>
      <div style="background:rgba(255,255,255,0.15);border-radius:6px;padding:10px 16px;"><p style="font-size:10px;opacity:.7;margin:0;text-transform:uppercase;letter-spacing:1px">Net P&L</p><p style="font-size:18px;font-weight:700;margin:2px 0 0">${fmt(summary.netPL)}</p></div>
    </div>
  </div>
  <div style="padding:24px;">
    ${!isTrust&&incCats.length?`<h2 style="font-size:14px;font-weight:800;color:#1e3a5f;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">Income</h2>
    <table><thead><tr style="background:#1e3a5f;"><th style="padding:9px 16px;text-align:left;color:#fff;font-size:12px">Category / Description</th><th style="padding:9px 16px;text-align:right;color:#fff;font-size:12px">Amount</th></tr></thead>
    <tbody>${catRows(incCats,'#EBF5FB')}</tbody>
    <tfoot><tr style="background:#0EA5E9;"><td style="padding:11px 16px;font-weight:800;color:#fff;font-size:14px">TOTAL INCOME</td><td style="padding:11px 16px;text-align:right;font-weight:800;color:#fff;font-size:14px">${fmt(summary.totalIncome)}</td></tr></tfoot></table>
    <div style="height:20px"></div>`:''}
    ${expCats.length?`<h2 style="font-size:14px;font-weight:800;color:#1e3a5f;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px">${isTrust?'Trust Disbursements':'Expenses'}</h2>
    <table><thead><tr style="background:#1e3a5f;"><th style="padding:9px 16px;text-align:left;color:#fff;font-size:12px">Category / Description</th><th style="padding:9px 16px;text-align:right;color:#fff;font-size:12px">Amount</th></tr></thead>
    <tbody>${catRows(expCats,'#F9F3E3')}</tbody>
    <tfoot><tr style="background:#1e3a5f;"><td style="padding:11px 16px;font-weight:800;color:#fff;font-size:14px">TOTAL ${isTrust?'DISBURSEMENTS':'EXPENSES'}</td><td style="padding:11px 16px;text-align:right;font-weight:800;color:#fff;font-size:14px">${fmt(summary.totalExpenses)}</td></tr></tfoot></table>`:''}
    <div style="margin-top:16px;background:${netBg};border-radius:8px;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;border:2px solid ${netColor}40;">
      <span style="font-size:16px;font-weight:800;color:${netColor}">NET ${isTrust?'TRUST DEFICIT':'PROFIT & LOSS'}</span>
      <span style="font-size:20px;font-weight:800;color:${netColor}">${fmt(summary.netPL)}</span>
    </div>
    <p style="margin-top:28px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px">Generated from QuickBooks P&L data on ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}. Cash Basis. Prepared by DATAVIA.</p>
  </div></body></html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 600);
}

export default function ReportsPage() {
  const { company } = useApp();
  const previewCo   = company === 'All' ? 'IM' : company;
  const [data,      setData]      = useState<{ hasData: boolean; summary: Summary | null; categories: Category[]; batches: any[] } | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [generating,setGenerating]= useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/data?company=${previewCo}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [previewCo]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" /></div>;

  if (!data?.hasData) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-5">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#0EA5E9,#8B5CF6)' }}>
        <Upload size={28} className="text-white" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-white">No data yet</h2>
        <p className="text-slate-500 text-sm mt-1">Upload a statement first to generate your P&L report.</p>
      </div>
      <Link href="/upload" className="btn-primary px-6 py-2.5 flex items-center gap-2 text-sm"><Upload size={15}/> Upload Statement</Link>
    </div>
  );

  const { summary, categories, batches } = data;
  const fmt         = formatCurrency;
  const periodLabel = batches.length ? batches.map(b => b.period_label).join(', ') : 'Current Period';
  const incCats     = categories.filter(c => c.type === 'income');
  const expCats     = categories.filter(c => c.type === 'expense');
  const isTrust     = previewCo === 'Abundant';

  const handleDownload = async () => {
    if (!summary) return;
    setGenerating(true);
    await new Promise(r => setTimeout(r, 200));
    generatePDF(previewCo, summary, categories, periodLabel);
    setGenerating(false);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Clean P&L PDF — ready for stakeholders</p>
        </div>
        <button onClick={handleDownload} disabled={generating}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50">
          {generating ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          Download PDF — {COMPANY_NAMES[previewCo]?.split(' ')[0]}
        </button>
      </div>

      {/* Preview */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-bg-border flex items-center justify-between">
          <div className="flex items-center gap-2"><FileText size={15} className="text-brand-cyan" /><p className="font-semibold text-white">Preview — {COMPANY_NAMES[previewCo]}</p></div>
          <p className="text-xs text-slate-500">{periodLabel}</p>
        </div>
        <div className="bg-white text-gray-800 p-6 max-h-[600px] overflow-y-auto">
          <div style={{ background:'linear-gradient(135deg,#0EA5E9,#1e3a5f)', borderRadius:8, padding:'20px 24px', marginBottom:20, color:'#fff' }}>
            <p style={{ fontSize:18, fontWeight:800, margin:0 }}>{COMPANY_NAMES[previewCo]}</p>
            <p style={{ fontSize:13, opacity:.8, margin:'4px 0 0' }}>Profit & Loss{isTrust?' — Trust Disbursements':''}</p>
            <p style={{ fontSize:12, opacity:.7, margin:'2px 0 0' }}>{periodLabel} · Cash Basis</p>
            <div style={{ display:'flex', gap:12, marginTop:16 }}>
              {!isTrust && <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:6, padding:'8px 14px' }}><p style={{ fontSize:10, opacity:.7, margin:0, textTransform:'uppercase', letterSpacing:1 }}>Income</p><p style={{ fontSize:16, fontWeight:700, margin:'2px 0 0' }}>{fmt(summary?.totalIncome??0)}</p></div>}
              <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:6, padding:'8px 14px' }}><p style={{ fontSize:10, opacity:.7, margin:0, textTransform:'uppercase', letterSpacing:1 }}>Expenses</p><p style={{ fontSize:16, fontWeight:700, margin:'2px 0 0' }}>{fmt(summary?.totalExpenses??0)}</p></div>
              <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:6, padding:'8px 14px' }}><p style={{ fontSize:10, opacity:.7, margin:0, textTransform:'uppercase', letterSpacing:1 }}>Net P&L</p><p style={{ fontSize:16, fontWeight:700, margin:'2px 0 0', color:(summary?.netPL??0)>=0?'#86efac':'#fca5a5' }}>{fmt(summary?.netPL??0)}</p></div>
            </div>
          </div>

          {!isTrust && incCats.map(cat => (
            <div key={cat.category} style={{ marginBottom:6 }}>
              <div style={{ background:'#EBF5FB', padding:'7px 12px', fontWeight:700, color:'#1e3a5f', fontSize:13 }}>{cat.category}</div>
              {cat.transactions.slice(0,10).map((tx,i) => <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'4px 12px 4px 24px', fontSize:12, borderBottom:'1px solid #f3f4f6', color:'#374151' }}><span>{tx.name}</span><span>{fmt(tx.amount)}</span></div>)}
              <div style={{ display:'flex', justifyContent:'space-between', background:'#1e3a5f', padding:'6px 12px 6px 24px', color:'#fff', fontWeight:700, fontSize:12 }}><span>Total {cat.category}</span><span>{fmt(cat.total)}</span></div>
            </div>
          ))}
          {!isTrust && <div style={{ display:'flex', justifyContent:'space-between', background:'#0EA5E9', padding:'10px 12px', color:'#fff', fontWeight:800, fontSize:14, marginBottom:20 }}><span>TOTAL INCOME</span><span>{fmt(summary?.totalIncome??0)}</span></div>}

          {expCats.map(cat => (
            <div key={cat.category} style={{ marginBottom:6 }}>
              <div style={{ background:'#F9F3E3', padding:'7px 12px', fontWeight:700, color:'#1e3a5f', fontSize:13 }}>{cat.category}</div>
              {cat.transactions.slice(0,10).map((tx,i) => <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'4px 12px 4px 24px', fontSize:12, borderBottom:'1px solid #f3f4f6', color:'#374151' }}><span>{tx.name}</span><span>{fmt(tx.amount)}</span></div>)}
              <div style={{ display:'flex', justifyContent:'space-between', background:'#1e3a5f', padding:'6px 12px 6px 24px', color:'#fff', fontWeight:700, fontSize:12 }}><span>Total {cat.category}</span><span>{fmt(cat.total)}</span></div>
            </div>
          ))}

          <div style={{ display:'flex', justifyContent:'space-between', background:(summary?.netPL??0)>=0?'#DCFCE7':'#FEE2E2', border:`2px solid ${(summary?.netPL??0)>=0?'#16653440':'#99000040'}`, borderRadius:8, padding:'13px 16px', marginTop:12 }}>
            <span style={{ fontWeight:800, fontSize:15, color:(summary?.netPL??0)>=0?'#166534':'#991b1b' }}>NET {isTrust?'TRUST DEFICIT':'PROFIT & LOSS'}</span>
            <span style={{ fontWeight:800, fontSize:18, color:(summary?.netPL??0)>=0?'#166534':'#991b1b' }}>{fmt(summary?.netPL??0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
