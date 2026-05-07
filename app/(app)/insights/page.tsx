'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Lightbulb, Send, TrendingDown, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { IM_SUMMARY, IM_EXPENSES } from '@/lib/im-data';
import { WSH_SUMMARY } from '@/lib/wsh-data';
import { ABUNDANT_SUMMARY } from '@/lib/abundant-data';
import { formatCurrency } from '@/lib/utils';
import { COMPANIES } from '@/lib/utils';

interface QA { id: string; question: string; answer: string; by: string; time: string; }

function getSummaryCards(company: string) {
  if (company === 'WSH') return [
    { icon: TrendingUp,   label: 'Net P&L — Q1 2026',       value: `+${formatCurrency(WSH_SUMMARY.netPL)} (${WSH_SUMMARY.margin}% margin)`, color: '#10B981' },
    { icon: TrendingDown, label: 'Total Payroll — Q1 2026',   value: `${formatCurrency(42067.19)} wages + taxes`,                             color: '#F59E0B' },
    { icon: Lightbulb,    label: 'Insight',                   value: 'REI Group pays $12,500 bi-monthly — consistent income',                  color: '#8B5CF6' },
  ];
  if (company === 'Abundant') return [
    { icon: TrendingDown, label: 'Total Disbursements Q1',    value: formatCurrency(ABUNDANT_SUMMARY.totalExpenses),   color: '#F43F5E' },
    { icon: TrendingDown, label: 'Largest Item — Q1 2026',    value: 'Mortgage 140 Cove: $12,628.47',                  color: '#3B82F6' },
    { icon: Lightbulb,    label: 'Trust Note',                value: 'Abundant is a Trust — no operating income generated', color: '#8B5CF6' },
  ];
  // IM default
  const topExpense = [...IM_EXPENSES].sort((a,b) => b.total.IM - a.total.IM)[0];
  return [
    { icon: TrendingUp,   label: 'Net P&L — Jan–Apr 2026',   value: `+${formatCurrency(IM_SUMMARY.netPL)} (${IM_SUMMARY.margin}% margin)`, color: '#10B981' },
    { icon: TrendingDown, label: 'Top Expense Category',      value: `${topExpense.category}: ${formatCurrency(topExpense.total.IM)}`,        color: '#F59E0B' },
    { icon: Lightbulb,    label: 'AI Insight',                value: 'Software subscriptions grew ~15% vs prior period', color: '#8B5CF6' },
  ];
}

export default function InsightsPage() {
  const { user, company } = useApp();
  const [question, setQuestion] = useState('');
  const [qa, setQA] = useState<QA[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const summaryCards = getSummaryCards(company);
  const companyLabel = company === 'All' ? 'All Companies' : COMPANIES[company as keyof typeof COMPANIES]?.name ?? company;

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion('');
    setLoading(true);
    setError('');

    // Get saved settings from localStorage
    const savedProvider = localStorage.getItem('ai_provider') ?? 'openai';
    const savedKey      = localStorage.getItem('ai_key') ?? '';

    if (!savedKey) {
      setError('No API key configured. Go to Settings → AI Provider to add your key.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, company, provider: savedProvider, apiKey: savedKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'AI error');
      setQA(prev => [{
        id: Date.now().toString(), question: q, answer: data.answer,
        by: user?.username ?? 'user', time: new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }),
      }, ...prev]);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Check your API key in Settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Insights</h1>
        <p className="text-sm text-slate-500 mt-0.5">{companyLabel} · AI-powered financial Q&A</p>
      </div>

      {/* Summary Cards */}
      <section>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Summary</p>
        <div className="grid grid-cols-3 gap-3">
          {summaryCards.map((item, i) => (
            <div key={i} className="card p-4 flex gap-3 hover:bg-bg-hover transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                   style={{ background: item.color + '18' }}>
                <item.icon size={16} style={{ color: item.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">{item.label}</p>
                <p className="text-sm text-white font-medium mt-0.5 leading-snug">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ask */}
      <section className="card p-5 space-y-4">
        <p className="text-sm font-semibold text-white">Ask a Question</p>
        <form onSubmit={handleAsk} className="flex gap-3">
          <input value={question} onChange={e => setQuestion(e.target.value)}
            placeholder={`e.g. What was the biggest expense for ${company === 'All' ? 'IM' : company} this quarter?`}
            className="flex-1 bg-bg-base border border-bg-border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-brand-violet transition-colors" />
          <button type="submit" disabled={!question.trim() || loading}
            className="btn-primary px-5 flex items-center gap-2 disabled:opacity-40">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Ask
          </button>
        </form>
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
        <p className="text-xs text-slate-600">Questions are answered using your real QB P&L data + AI. Configure your API key in Settings.</p>
      </section>

      {/* Q&A History */}
      <section className="space-y-4">
        {loading && (
          <div className="card p-5 flex items-center gap-3">
            <Loader2 size={16} className="text-brand-violet animate-spin" />
            <p className="text-sm text-slate-400">Analyzing your financials…</p>
          </div>
        )}
        {qa.map(item => (
          <div key={item.id} className="card p-5 space-y-3 hover:bg-bg-hover transition-colors animate-slide-up">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                   style={{ background: 'linear-gradient(135deg,#0EA5E9,#8B5CF6)' }}>
                {(item.by[0] ?? '?').toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{item.question}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{item.by} · {item.time}</p>
              </div>
            </div>
            <div className="pl-9">
              <div className="flex gap-2 items-start">
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                     style={{ background: 'rgba(139,92,246,0.15)' }}>
                  <Lightbulb size={11} className="text-brand-violet" />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{item.answer}</p>
              </div>
            </div>
          </div>
        ))}
        {!qa.length && !loading && (
          <div className="text-center py-12 text-slate-600 text-sm">
            No questions yet. Ask something above — the AI has your real Q1 2026 data!
          </div>
        )}
      </section>
    </div>
  );
}
