'use client';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Download, CheckSquare, Square, FileText } from 'lucide-react';

interface Section { id: string; label: string; enabled: boolean; }

const DEFAULT_SECTIONS: Section[] = [
  { id:'summary',    label:'Executive Summary',       enabled: true  },
  { id:'kpis',       label:'Key Financial Metrics',   enabled: true  },
  { id:'pl',         label:'Full P&L by Category',    enabled: true  },
  { id:'top_expenses', label:'Top 10 Expenses',       enabled: true  },
  { id:'charts',     label:'Income vs Expenses Chart',enabled: true  },
  { id:'trend',      label:'Net P&L Trend Chart',     enabled: false },
  { id:'ai_summary', label:'AI Commentary',           enabled: true  },
];

export default function ReportsPage() {
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [period, setPeriod] = useState('');
  const [detail, setDetail] = useState<'summary'|'detailed'>('summary');
  const [generating, setGenerating] = useState(false);

  const toggle = (id: string) =>
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    // TODO: actual PDF generation
    alert('PDF generation will be active once Supabase is connected with real data.');
    setGenerating(false);
  };

  return (
    <div className="max-w-2xl space-y-6 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Generate colorful PDF reports for stakeholders</p>
      </div>

      {/* Options */}
      <div className="card p-5 space-y-5">
        <p className="text-sm font-semibold text-white">Report Options</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Period</label>
            <input type="month" value={period} onChange={e => setPeriod(e.target.value)}
              className="w-full bg-bg-base border border-bg-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-violet transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Detail Level</label>
            <div className="flex gap-2">
              {(['summary','detailed'] as const).map(d => (
                <button key={d} onClick={() => setDetail(d)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium border transition-all capitalize"
                  style={detail===d
                    ? { background:'rgba(14,165,233,0.15)', color:'#0EA5E9', borderColor:'rgba(14,165,233,0.4)' }
                    : { background:'transparent', color:'#64748B', borderColor:'rgba(255,255,255,0.07)' }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section selector */}
      <div className="card p-5 space-y-3">
        <p className="text-sm font-semibold text-white">Include Sections</p>
        <div className="space-y-2">
          {sections.map(s => (
            <button key={s.id} onClick={() => toggle(s.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-hover transition-colors text-left">
              {s.enabled
                ? <CheckSquare size={16} className="text-brand-violet flex-shrink-0" />
                : <Square     size={16} className="text-slate-600 flex-shrink-0" />}
              <span className={`text-sm ${s.enabled ? 'text-white' : 'text-slate-500'}`}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview stub */}
      <div className="card p-5 space-y-3">
        <p className="text-sm font-semibold text-white">Report Preview</p>
        <div className="rounded-xl border border-bg-border overflow-hidden" style={{ background: '#fff', minHeight: 200 }}>
          <div className="p-6" style={{ background: 'linear-gradient(135deg,#0EA5E9,#8B5CF6)', minHeight: 80 }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-lg">IM Financial Report</p>
                <p className="text-white/70 text-sm mt-0.5">{period || 'Select a period above'}</p>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <FileText size={18} className="text-white" />
              </div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {sections.filter(s => s.enabled).map(s => (
              <div key={s.id} className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-violet" />
                {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generate button */}
      <button onClick={handleGenerate} disabled={generating}
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base disabled:opacity-50">
        {generating ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating PDF…</>
        ) : (
          <><Download size={18} /> Download PDF Report</>
        )}
      </button>
    </div>
  );
}
