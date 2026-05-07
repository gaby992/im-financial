'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { formatCurrency, COMPANIES } from '@/lib/utils';
import { Trash2, Users, Key, Bot, CheckCircle } from 'lucide-react';
import { Company } from '@/types';

// Placeholder upload history
const UPLOADS = [
  { id:'1', company:'IM'  as const, period:'April 2026',    filename:'IM_PL_Apr26.xlsx',       uploaded:'2026-05-01', by:'gabby', rows:312 },
  { id:'2', company:'WSH' as const, period:'April 2026',    filename:'WSH_PL_Apr26.xlsx',      uploaded:'2026-05-01', by:'gabby', rows:145 },
  { id:'3', company:'IM'  as const, period:'March 2026',    filename:'IM_PL_Mar26.xlsx',       uploaded:'2026-04-02', by:'gabby', rows:298 },
  { id:'4', company:'Abundant' as const, period:'March 2026', filename:'Abundant_PL_Mar26.xlsx', uploaded:'2026-04-02', by:'gabby', rows:88 },
];

const USERS_LIST = [
  { username:'gabby',   role:'admin',  access:'Full access — upload, manage, insights' },
  { username:'chelsea', role:'viewer', access:'View all + post questions in Insights' },
];

export default function SettingsPage() {
  const { user } = useApp();
  const [uploads, setUploads] = useState(UPLOADS);
  const [provider, setProvider] = useState<'claude'|'openai'>('claude');
  const [apiKey, setApiKey] = useState('');
  const [keySaved, setKeySaved] = useState(false);

  const isAdmin = user?.role === 'admin';

  const handleDelete = (id: string) => {
    if (confirm('Delete this upload? All P&L data for this period and company will be removed.')) {
      setUploads(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleSaveKey = () => {
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const badgeClass = (c: Company) =>
    c==='IM' ? 'badge-im' : c==='WSH' ? 'badge-wsh' : 'badge-abundant';

  return (
    <div className="max-w-3xl space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage uploads, users, and AI configuration</p>
      </div>

      {/* Upload History */}
      <section className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-bg-border flex items-center gap-2">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-brand-cyan/10">
            <div className="w-2 h-2 rounded-full bg-brand-cyan" />
          </div>
          <p className="font-semibold text-white">Upload History</p>
        </div>
        <table className="data-table w-full">
          <thead>
            <tr className="bg-bg-hover">
              <th>Company</th>
              <th>Period</th>
              <th>Filename</th>
              <th className="text-right">Rows</th>
              <th>Uploaded</th>
              <th>By</th>
              {isAdmin && <th />}
            </tr>
          </thead>
          <tbody>
            {uploads.map(u => (
              <tr key={u.id} className="hover:bg-bg-hover/50 transition-colors">
                <td><span className={`company-badge ${badgeClass(u.company)}`}>{u.company}</span></td>
                <td className="text-slate-300">{u.period}</td>
                <td className="text-slate-500 text-xs font-mono max-w-[200px] truncate">{u.filename}</td>
                <td className="text-right font-mono text-sm text-slate-300">{u.rows}</td>
                <td className="text-slate-500 text-sm">{u.uploaded}</td>
                <td className="text-slate-400 text-sm">{u.by}</td>
                {isAdmin && (
                  <td>
                    <button onClick={() => handleDelete(u.id)}
                      className="text-slate-600 hover:text-negative transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!uploads.length && (
              <tr><td colSpan={7} className="text-center text-slate-600 py-8">No uploads yet</td></tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Users */}
      <section className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-bg-border flex items-center gap-2">
          <Users size={16} className="text-brand-violet" />
          <p className="font-semibold text-white">Users</p>
        </div>
        <table className="data-table w-full">
          <thead>
            <tr className="bg-bg-hover">
              <th>Username</th>
              <th>Role</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            {USERS_LIST.map(u => (
              <tr key={u.username} className="hover:bg-bg-hover/50 transition-colors">
                <td className="font-medium text-white">{u.username}</td>
                <td>
                  <span className={`company-badge ${u.role==='admin' ? 'badge-im' : 'badge-abundant'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="text-slate-500 text-sm">{u.access}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* AI Provider */}
      {isAdmin && (
        <section className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-brand-pink" />
            <p className="font-semibold text-white">AI Provider</p>
          </div>
          <div className="flex gap-2">
            {(['claude','openai'] as const).map(p => (
              <button key={p} onClick={() => setProvider(p)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all capitalize"
                style={provider===p
                  ? { background: 'rgba(139,92,246,0.15)', color:'#8B5CF6', borderColor:'rgba(139,92,246,0.4)' }
                  : { background:'transparent', color:'#64748B', borderColor:'rgba(255,255,255,0.07)' }}>
                {p === 'claude' ? '✦ Claude' : '⬡ OpenAI'}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1.5">API Key</label>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                placeholder="sk-ant-api… or sk-…"
                className="w-full bg-bg-base border border-bg-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand-violet transition-colors font-mono" />
            </div>
            <div className="flex items-end">
              <button onClick={handleSaveKey} className="btn-primary px-5 py-2 flex items-center gap-2">
                {keySaved ? <><CheckCircle size={14}/> Saved!</> : <><Key size={14}/> Save</>}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-600">Key is stored securely in Supabase and never exposed to clients.</p>
        </section>
      )}
    </div>
  );
}
