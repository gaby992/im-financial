'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { formatCurrency } from '@/lib/utils';
import { Lightbulb, Send, TrendingDown, TrendingUp, Loader2 } from 'lucide-react';

interface QA { id: string; question: string; answer: string; by: string; time: string; }

const PLACEHOLDER_SUMMARY = [
  { icon: TrendingDown, label: 'Top Expense — April 2026', value: 'Contractors – US at $26,340', color: '#F59E0B' },
  { icon: TrendingUp,   label: 'Net P&L — April 2026',     value: '+$21,064 (12.2% margin)',     color: '#10B981' },
  { icon: Lightbulb,    label: 'Insight',  value: 'Commissions dropped 8% vs March — review pipeline', color: '#8B5CF6' },
];

const PLACEHOLDER_QA: QA[] = [
  { id:'1', question:'What was the total spent on international contractors this quarter?', answer:'Total spent on Contractors – Intl this quarter (Q1 2026) was $13,729.80 across all three companies. IM accounted for $9,152.40, WSH for $3,000, and Abundant for $1,577.40.', by:'gabby', time:'May 6 · 9:14am' },
];

export default function InsightsPage() {
  const { user } = useApp();
  const [question, setQuestion] = useState('');
  const [qa, setQA] = useState<QA[]>(PLACEHOLDER_QA);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;
    const q = question.trim();
    setQuestion('');
    setLoading(true);

    // Simulate AI response
    await new Promise(r => setTimeout(r, 1800));
    const mockAnswer = `Based on the uploaded data, here is the analysis for your question: "${q}"\n\nThis is where the AI response will appear once the OpenAI/Claude API key is configured in Settings. The AI will have full access to your P&L data filtered by the current company and date selection.`;
    setQA(prev => [{ id: Date.now().toString(), question: q, answer: mockAnswer, by: user?.username ?? 'user', time: 'Just now' }, ...prev]);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Insights</h1>
        <p className="text-sm text-slate-500 mt-0.5">AI-generated summaries and financial Q&A</p>
      </div>

      {/* AI Summary Cards */}
      <section>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">AI Summary</p>
        <div className="grid grid-cols-3 gap-3">
          {PLACEHOLDER_SUMMARY.map((item, i) => (
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

      {/* Ask a question */}
      <section className="card p-5 space-y-4">
        <p className="text-sm font-semibold text-white">Ask a Question</p>
        <form onSubmit={handleAsk} className="flex gap-3">
          <input value={question} onChange={e => setQuestion(e.target.value)}
            placeholder="e.g. What was total coaching spend in Q1?"
            className="flex-1 bg-bg-base border border-bg-border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-brand-violet transition-colors" />
          <button type="submit" disabled={!question.trim() || loading}
            className="btn-primary px-5 flex items-center gap-2 disabled:opacity-40">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Ask
          </button>
        </form>
        <p className="text-xs text-slate-600">Questions are answered using your uploaded P&L data + AI.</p>
      </section>

      {/* Q&A history */}
      <section className="space-y-4">
        {loading && (
          <div className="card p-5 flex items-center gap-3">
            <Loader2 size={16} className="text-brand-violet animate-spin" />
            <p className="text-sm text-slate-400">Analyzing your financials…</p>
          </div>
        )}
        {qa.map(item => (
          <div key={item.id} className="card p-5 space-y-3 hover:bg-bg-hover transition-colors animate-slide-up">
            {/* Question */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                   style={{ background: 'linear-gradient(135deg,#0EA5E9,#8B5CF6)' }}>
                {item.by[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{item.question}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{item.by} · {item.time}</p>
              </div>
            </div>
            {/* Answer */}
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
            No questions yet. Ask something above!
          </div>
        )}
      </section>
    </div>
  );
}
