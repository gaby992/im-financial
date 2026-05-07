'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { formatCurrency, COMPANIES } from '@/lib/utils';
import { Download, FileText, Loader2 } from 'lucide-react';
import { IM_INCOME, IM_EXPENSES, IM_SUMMARY } from '@/lib/im-data';
import { WSH_INCOME, WSH_EXPENSES, WSH_SUMMARY } from '@/lib/wsh-data';
import { ABUNDANT_EXPENSES, ABUNDANT_SUMMARY } from '@/lib/abundant-data';

// ── Data selector ─────────────────────────────────────────────────────────────
function getReportData(company: string) {
  if (company === 'WSH')      return { income: WSH_INCOME,  expenses: WSH_EXPENSES,  summary: WSH_SUMMARY,      period: 'January 1 – March 31, 2026',  name: 'Western Star Holdings LLC',   isTrust: false };
  if (company === 'Abundant') return { income: [],           expenses: ABUNDANT_EXPENSES, summary: ABUNDANT_SUMMARY, period: 'January 1 – March 31, 2026', name: 'Abundant Legacy Trust',        isTrust: true  };
  return { income: IM_INCOME, expenses: IM_EXPENSES, summary: IM_SUMMARY, period: 'January 1 – April 30, 2026', name: 'Interactive Marketing LLC', isTrust: false };
}

// ── PDF generator (print-based, no external library needed) ──────────────────
function generatePDF(company: string) {
  const { income, expenses, summary, period, name, isTrust } = getReportData(company);
  const totalIncome   = income.reduce((s, g) => s + (g.total[company as 'IM'|'WSH'|'Abundant'] ?? g.total.IM), 0);
  const totalExpenses = expenses.reduce((s, g) => s + (g.total[company as 'IM'|'WSH'|'Abundant'] ?? g.total.IM), 0);
  const netPL         = totalIncome - totalExpenses;

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const incomeRows = income.map(g => {
    const amt = g.total[company as 'IM'|'WSH'|'Abundant'] ?? g.total.IM;
    const items = (g.items ?? []).map(item => {
      const a = item.amount[company as 'IM'|'WSH'|'Abundant'] ?? item.amount.IM;
      return `<tr><td style="padding:6px 16px 6px 32px;color:#374151;font-size:13px;">${item.description}</td><td style="padding:6px 16px;text-align:right;color:#374151;font-size:13px;">${fmt(a)}</td></tr>`;
    }).join('');
    return `
      <tr style="background:#EBF5FB;">
        <td style="padding:8px 16px;font-weight:700;color:#1e3a5f;font-size:14px;">${g.category}</td>
        <td></td>
      </tr>
      ${items}
      <tr style="background:#1e3a5f;">
        <td style="padding:8px 16px 8px 32px;color:#fff;font-weight:700;font-size:13px;">Total ${g.category}</td>
        <td style="padding:8px 16px;text-align:right;color:#fff;font-weight:700;font-size:13px;">${fmt(amt)}</td>
      </tr>`;
  }).join('');

  const expenseRows = expenses.map(g => {
    const amt = g.total[company as 'IM'|'WSH'|'Abundant'] ?? g.total.IM;
    const items = (g.items ?? []).map(item => {
      const a = item.amount[company as 'IM'|'WSH'|'Abundant'] ?? item.amount.IM;
      return `<tr><td style="padding:6px 16px 6px 32px;color:#374151;font-size:13px;">${item.description}</td><td style="padding:6px 16px;text-align:right;color:#374151;font-size:13px;">${fmt(a)}</td></tr>`;
    }).join('');
    const rowColor = g.color ?? '#F59E0B';
    return `
      <tr style="background:#F9F3E3;">
        <td style="padding:8px 16px;font-weight:700;color:#1e3a5f;font-size:14px;border-left:4px solid ${rowColor};">${g.category}</td>
        <td></td>
      </tr>
      ${items}
      <tr style="background:#1e3a5f;">
        <td style="padding:8px 16px 8px 32px;color:#fff;font-weight:700;font-size:13px;">Total ${g.category}</td>
        <td style="padding:8px 16px;text-align:right;color:#fff;font-weight:700;font-size:13px;">${fmt(amt)}</td>
      </tr>`;
  }).join('');

  const netColor = netPL >= 0 ? '#166534' : '#991b1b';
  const netBg    = netPL >= 0 ? '#DCFCE7'  : '#FEE2E2';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${name} — P&L Report</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; color: #1f2937; }
    table { width: 100%; border-collapse: collapse; }
    td { border-bottom: 1px solid #e5e7eb; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0EA5E9,#1e3a5f);padding:32px;color:#fff;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <p style="font-size:22px;font-weight:800;margin:0;">${name}</p>
        <p style="font-size:14px;opacity:0.8;margin:4px 0 0;">Profit & Loss${isTrust ? ' — Trust Disbursements' : ''}</p>
        <p style="font-size:13px;opacity:0.7;margin:4px 0 0;">${period} · Cash Basis</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:13px;opacity:0.7;margin:0;">Generated</p>
        <p style="font-size:13px;margin:2px 0 0;">${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</p>
      </div>
    </div>
    <!-- KPI Strip -->
    <div style="display:flex;gap:24px;margin-top:24px;">
      ${!isTrust ? `<div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:12px 20px;">
        <p style="font-size:11px;opacity:0.7;margin:0;text-transform:uppercase;letter-spacing:1px;">Total Income</p>
        <p style="font-size:20px;font-weight:700;margin:4px 0 0;">${fmt(totalIncome)}</p>
      </div>` : ''}
      <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:12px 20px;">
        <p style="font-size:11px;opacity:0.7;margin:0;text-transform:uppercase;letter-spacing:1px;">${isTrust ? 'Total Disbursements' : 'Total Expenses'}</p>
        <p style="font-size:20px;font-weight:700;margin:4px 0 0;">${fmt(totalExpenses)}</p>
      </div>
      <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:12px 20px;">
        <p style="font-size:11px;opacity:0.7;margin:0;text-transform:uppercase;letter-spacing:1px;">Net ${isTrust ? 'Deficit' : 'P&L'}</p>
        <p style="font-size:20px;font-weight:700;margin:4px 0 0;">${fmt(netPL)}</p>
      </div>
    </div>
  </div>

  <div style="padding:24px;">
    <!-- INCOME -->
    ${!isTrust ? `
    <h2 style="font-size:15px;font-weight:800;color:#1e3a5f;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">Income</h2>
    <table>
      <thead>
        <tr style="background:#1e3a5f;">
          <th style="padding:10px 16px;text-align:left;color:#fff;font-size:13px;">Category / Description</th>
          <th style="padding:10px 16px;text-align:right;color:#fff;font-size:13px;">Amount</th>
        </tr>
      </thead>
      <tbody>${incomeRows}</tbody>
      <tfoot>
        <tr style="background:#0EA5E9;">
          <td style="padding:12px 16px;font-weight:800;color:#fff;font-size:15px;">TOTAL INCOME</td>
          <td style="padding:12px 16px;text-align:right;font-weight:800;color:#fff;font-size:15px;">${fmt(totalIncome)}</td>
        </tr>
      </tfoot>
    </table>
    <div style="height:24px;"></div>` : ''}

    <!-- EXPENSES -->
    <h2 style="font-size:15px;font-weight:800;color:#1e3a5f;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;">${isTrust ? 'Trust Disbursements' : 'Expenses'}</h2>
    <table>
      <thead>
        <tr style="background:#1e3a5f;">
          <th style="padding:10px 16px;text-align:left;color:#fff;font-size:13px;">Category / Description</th>
          <th style="padding:10px 16px;text-align:right;color:#fff;font-size:13px;">Amount</th>
        </tr>
      </thead>
      <tbody>${expenseRows}</tbody>
      <tfoot>
        <tr style="background:#1e3a5f;">
          <td style="padding:12px 16px;font-weight:800;color:#fff;font-size:15px;">TOTAL ${isTrust ? 'DISBURSEMENTS' : 'EXPENSES'}</td>
          <td style="padding:12px 16px;text-align:right;font-weight:800;color:#fff;font-size:15px;">${fmt(totalExpenses)}</td>
        </tr>
      </tfoot>
    </table>

    <!-- NET -->
    <div style="margin-top:16px;background:${netBg};border-radius:8px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;border:2px solid ${netColor}40;">
      <span style="font-size:17px;font-weight:800;color:${netColor};">NET ${isTrust ? 'TRUST DEFICIT' : 'PROFIT & LOSS'}</span>
      <span style="font-size:22px;font-weight:800;color:${netColor};">${fmt(netPL)}</span>
    </div>

    <p style="margin-top:32px;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px;">
      This report was generated from QuickBooks P&L Detail data on ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}.
      Cash Basis accounting. Prepared by DATAVIA.
    </p>
  </div>
</body>
</html>`;

  // Open in new window and trigger print-to-PDF
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { company } = useApp();
  const [generating, setGenerating] = useState(false);

  // For preview, use currently selected company (default to IM if All)
  const previewCompany = company === 'All' ? 'IM' : company;
  const { income, expenses, summary, period, name, isTrust } = getReportData(previewCompany);
  const fmt = formatCurrency;

  const totalIncome   = income.reduce((s, g) => s + (g.total[previewCompany as 'IM'|'WSH'|'Abundant'] ?? g.total.IM), 0);
  const totalExpenses = expenses.reduce((s, g) => s + (g.total[previewCompany as 'IM'|'WSH'|'Abundant'] ?? g.total.IM), 0);
  const netPL         = totalIncome - totalExpenses;

  const handleDownload = async (co: string) => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 300));
    generatePDF(co);
    setGenerating(false);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Clean P&L PDF — ready for stakeholders</p>
        </div>
      </div>

      {/* Download buttons per company */}
      <div className="grid grid-cols-3 gap-4">
        {(['IM','WSH','Abundant'] as const).map(co => {
          const d = getReportData(co);
          const tot = d.expenses.reduce((s,g) => s + (g.total[co] ?? 0), 0);
          const inc = d.income.reduce((s,g) => s + (g.total[co] ?? 0), 0);
          return (
            <div key={co} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{d.name.split(' ').slice(0,2).join(' ')}</p>
                {d.isTrust && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Trust</span>}
              </div>
              <div className="space-y-1">
                {!d.isTrust && <div className="flex justify-between text-xs"><span className="text-slate-500">Income</span><span className="text-slate-300">{fmt(inc)}</span></div>}
                <div className="flex justify-between text-xs"><span className="text-slate-500">Expenses</span><span className="text-slate-300">{fmt(tot)}</span></div>
                {!d.isTrust && <div className="flex justify-between text-xs font-semibold"><span className="text-slate-400">Net P&L</span><span className={inc-tot >= 0 ? 'text-positive' : 'text-negative'}>{fmt(inc-tot)}</span></div>}
              </div>
              <p className="text-xs text-slate-600">{d.period}</p>
              <button onClick={() => handleDownload(co)} disabled={generating}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                {generating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Download PDF
              </button>
            </div>
          );
        })}
      </div>

      {/* Live preview */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-bg-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-brand-cyan" />
            <p className="font-semibold text-white">Preview — {name}</p>
          </div>
          <p className="text-xs text-slate-500">{period}</p>
        </div>

        {/* Preview styled like PDF */}
        <div className="bg-white text-gray-800 p-6 max-h-[600px] overflow-y-auto">
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,#0EA5E9,#1e3a5f)', borderRadius:8, padding:'20px 24px', marginBottom:20, color:'#fff' }}>
            <p style={{ fontSize:18, fontWeight:800, margin:0 }}>{name}</p>
            <p style={{ fontSize:13, opacity:0.8, margin:'4px 0 0' }}>Profit & Loss{isTrust ? ' — Trust Disbursements' : ''}</p>
            <p style={{ fontSize:12, opacity:0.7, margin:'2px 0 0' }}>{period} · Cash Basis</p>
            <div style={{ display:'flex', gap:16, marginTop:16 }}>
              {!isTrust && <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:6, padding:'8px 16px' }}>
                <p style={{ fontSize:10, opacity:0.7, margin:0, textTransform:'uppercase', letterSpacing:1 }}>Total Income</p>
                <p style={{ fontSize:16, fontWeight:700, margin:'2px 0 0' }}>{fmt(totalIncome)}</p>
              </div>}
              <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:6, padding:'8px 16px' }}>
                <p style={{ fontSize:10, opacity:0.7, margin:0, textTransform:'uppercase', letterSpacing:1 }}>{isTrust ? 'Disbursements' : 'Expenses'}</p>
                <p style={{ fontSize:16, fontWeight:700, margin:'2px 0 0' }}>{fmt(totalExpenses)}</p>
              </div>
              <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:6, padding:'8px 16px' }}>
                <p style={{ fontSize:10, opacity:0.7, margin:0, textTransform:'uppercase', letterSpacing:1 }}>Net P&L</p>
                <p style={{ fontSize:16, fontWeight:700, margin:'2px 0 0', color: netPL>=0?'#86efac':'#fca5a5' }}>{fmt(netPL)}</p>
              </div>
            </div>
          </div>

          {/* Income table */}
          {!isTrust && income.map(g => {
            const amt = g.total[previewCompany as 'IM'|'WSH'|'Abundant'] ?? g.total.IM;
            return (
              <div key={g.category} style={{ marginBottom:8 }}>
                <div style={{ background:'#EBF5FB', padding:'7px 12px', fontWeight:700, color:'#1e3a5f', fontSize:13 }}>{g.category}</div>
                {(g.items ?? []).map(item => (
                  <div key={item.description} style={{ display:'flex', justifyContent:'space-between', padding:'5px 12px 5px 24px', fontSize:12, borderBottom:'1px solid #f3f4f6', color:'#374151' }}>
                    <span>{item.description}</span>
                    <span>{fmt(item.amount[previewCompany as 'IM'|'WSH'|'Abundant'] ?? item.amount.IM)}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', background:'#1e3a5f', padding:'7px 12px 7px 24px', color:'#fff', fontWeight:700, fontSize:12 }}>
                  <span>Total {g.category}</span><span>{fmt(amt)}</span>
                </div>
              </div>
            );
          })}
          {!isTrust && <div style={{ display:'flex', justifyContent:'space-between', background:'#0EA5E9', padding:'10px 12px', color:'#fff', fontWeight:800, fontSize:14, marginBottom:20 }}>
            <span>TOTAL INCOME</span><span>{fmt(totalIncome)}</span>
          </div>}

          {/* Expense table */}
          {expenses.map(g => {
            const amt = g.total[previewCompany as 'IM'|'WSH'|'Abundant'] ?? g.total.IM;
            return (
              <div key={g.category} style={{ marginBottom:8 }}>
                <div style={{ background:'#F9F3E3', padding:'7px 12px', fontWeight:700, color:'#1e3a5f', fontSize:13, borderLeft:`4px solid ${g.color}` }}>{g.category}</div>
                {(g.items ?? []).map(item => (
                  <div key={item.description} style={{ display:'flex', justifyContent:'space-between', padding:'5px 12px 5px 24px', fontSize:12, borderBottom:'1px solid #f3f4f6', color:'#374151' }}>
                    <span>{item.description}</span>
                    <span>{fmt(item.amount[previewCompany as 'IM'|'WSH'|'Abundant'] ?? item.amount.IM)}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', background:'#1e3a5f', padding:'7px 12px 7px 24px', color:'#fff', fontWeight:700, fontSize:12 }}>
                  <span>Total {g.category}</span><span>{fmt(amt)}</span>
                </div>
              </div>
            );
          })}

          {/* Net */}
          <div style={{ display:'flex', justifyContent:'space-between', background: netPL>=0?'#DCFCE7':'#FEE2E2', border:`2px solid ${netPL>=0?'#16653440':'#99000040'}`, borderRadius:8, padding:'14px 16px', marginTop:12 }}>
            <span style={{ fontWeight:800, fontSize:16, color: netPL>=0?'#166534':'#991b1b' }}>NET {isTrust?'TRUST DEFICIT':'PROFIT & LOSS'}</span>
            <span style={{ fontWeight:800, fontSize:18, color: netPL>=0?'#166534':'#991b1b' }}>{fmt(netPL)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
