'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/lib/context';
import { formatCurrency, COMPANIES } from '@/lib/utils';
import { Trash2, Users, Key, Bot, CheckCircle, RefreshCw } from 'lucide-react';

interface Batch { id: string; company_code: string; period_label: string; filename: string; row_count: number; uploaded_by: string; uploaded_at: string; }
const USERS_LIST = [
  { username:'gabby',   role:'admin',  access:'Full access — upload, manage, insights' },
  { username:'chelsea', role:'viewer', access:'View all + post questions in Insights' },
];

export default function SettingsPage() {
  const { user } = useApp();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<'claude'|'openai'>(() =>
    (typeof window !== 'undefined' ? localStorage.getItem('ai_provider') : null) as 'openai'|'claude' ?? 'openai'
  );
  const [apiKey, setApiKey] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('ai_key') ?? '' : '');
  const [keySaved, setKeySaved] = useState(false);
  const isAdmin = user?.role === 'admin';

  const loadBatches = () => {
    setLoading(true);
    fetch('/api/data?company=All&batches=1').then(r => r.json())
      .then(d => { setBatches(d.batches ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { loadBatches(); }, []);

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Delete "${label}"? All data for this period will be removed.`)) return;
    await fetch(`/api/data?batchId=${id}`, { method: 'DELETE' });
    setBatches(prev => prev.filter(b => b.id !== id));
  };

  const handleSaveKey = () => {
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('ai_key', apiKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  const badge = (c: string) => c==='IM' ? 'badge-im' : c==='WSH' ? 'badge-wsh' : 'badge-abundant';

  return (
    <div className="max-w-3xl space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage uploads, users, and AI configuration</p>
      </div>

      <section className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-bg-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-cyan" />
            <p className="font-semibold text-white">Upload History</p>
          </div>
          <button onClick={loadBatches} className="text-slate-500 hover:text-white transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        <table className="data-table w-full">
          <thead><tr className="bg-bg-hover"><th>Company</th><th>Period</th><th>Filename</th><th className="text-right">Rows</th><th>Uploaded</th><th>By</th>{isAdmin && <th />}</tr></thead>
          <tbody>
            {batches.map(b => (
              <tr key={b.id} className="hover:bg-bg-hover/50 transition-colors">
                <td><span className={`company-badge ${badge(b.company_code)}`}>{b.company_code}</span></td>
                <td className="text-slate-300">{b.period_label}</td>
                <td className="text-slate-500 text-xs font-mono max-w-[180px] truncate">{b.filename}</td>
                <td className="text-right font-mono text-sm text-slate-300">{b.row_count}</td>
                <td className="text-slate-500 text-sm">{new Date(b.uploaded_at).toLocaleDateString('en-US')}</td>
                <td className="text-slate-400 text-sm">{b.uploaded_by}</td>
                {isAdmin && <td><button onClick={() => handleDelete(b.id, b.period_label)} className="text-slate-600 hover:text-negative transition-colors p-1"><Trash2 size={14} /></button></td>}
              </tr>
            ))}
            {!loading && !batches.length && <tr><td colSpan={7} className="text-center text-slate-600 py-8">No uploads yet</td></tr>}
            {loading && <tr><td colSpan={7} className="text-center text-slate-700 py-6">Loading…</td></tr>}
          </tbody>
        </table>
      </section>

      <section className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-bg-border flex items-center gap-2">
          <Users size={16} className="text-brand-violet" />
          <p className="font-semibold text-white">Users</p>
        </div>
        <table className="data-table w-full">
          <thead><tr className="bg-bg-hover"><th>Username</th><th>Role</th><th>Access</th></tr></thead>
          <tbody>
            {USERS_LIST.map(u => (
              <tr key={u.username} className="hover:bg-bg-hover/50 transition-colors">
                <td className="font-medium text-white">{u.username}</td>
                <td><span className={`company-badge ${u.role==='admin' ? 'badge-im' : 'badge-abundant'}`}>{u.role}</span></td>
                <td className="text-slate-500 text-sm">{u.access}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {isAdmin && (
        <section className="card p-5 space-y-4">
          <div className="flex items-center gap-2"><Bot size={16} className="text-brand-pink" /><p className="font-semibold text-white">AI Provider</p></div>
          <div className="flex gap-2">
            {(['openai','claude'] as const).map(p => (
              <button key={p} onClick={() => setProvider(p)} className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                style={provider===p ? { background:'rgba(139,92,246,0.15)', color:'#8B5CF6', borderColor:'rgba(139,92,246,0.4)' }
                                    : { background:'transparent', color:'#64748B', borderColor:'rgba(255,255,255,0.07)' }}>
                {p === 'claude' ? '✦ Claude' : '⬡ OpenAI'}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1.5">API Key (optional — leave blank to use server default)</label>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                placeholder="sk-… (optional, overrides server key)"
                className="w-full bg-bg-base border border-bg-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-violet transition-colors font-mono" />
            </div>
            <div className="flex items-end">
              <button onClick={handleSaveKey} className="btn-primary px-5 py-2 flex items-center gap-2">
                {keySaved ? <><CheckCircle size={14}/> Saved!</> : <><Key size={14}/> Save</>}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-600">Leave blank to use the pre-configured server key. Each client can set their own for separate billing.</p>
        </section>
      )}
    </div>
  );
}
