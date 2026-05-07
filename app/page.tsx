'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import Image from 'next/image';

const USERS = [
  { username: 'gabby',   password: 'im2026',    role: 'admin'  as const },
  { username: 'chelsea', password: 'chelsea26', role: 'viewer' as const },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useApp();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 400));
    const found = USERS.find(u => u.username === username.toLowerCase().trim() && u.password === password);
    if (found) {
      setUser({ id: found.username, username: found.username, role: found.role, created_at: '' });
      router.push('/dashboard');
    } else {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base p-4"
         style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.12) 0%, #07070F 60%)' }}>
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <Image src="/im-logo.png" alt="IM P&L" fill className="object-contain" />
          </div>
        </div>

        <div className="card p-8" style={{ background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(20px)' }}>
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-white mb-1">Financial Dashboard</h1>
            <p className="text-sm text-slate-500">Interactive Marketing Group</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full bg-bg-base border border-bg-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-brand-violet transition-colors"
                placeholder="gabby" required autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-bg-base border border-bg-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-brand-violet transition-colors"
                placeholder="••••••••" required
              />
            </div>

            {error && (
              <p className="text-xs text-negative bg-negative/10 border border-negative/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">IM Financial · Confidential</p>
      </div>
    </div>
  );
}
