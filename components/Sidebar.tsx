'use client';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/lib/context';
import {
  LayoutDashboard, FileSpreadsheet, BarChart3, Upload,
  Lightbulb, Settings, LogOut, Building2
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/pl',        label: 'P&L Detail', icon: FileSpreadsheet  },
  { href: '/insights',  label: 'Insights',   icon: Lightbulb        },
  { href: '/reports',   label: 'Reports',    icon: BarChart3         },
  { href: '/upload',    label: 'Upload',     icon: Upload            },
  { href: '/settings',  label: 'Settings',   icon: Settings          },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useApp();

  const handleLogout = () => {
    setUser(null);
    router.push('/');
  };

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-bg-card border-r border-bg-border">
      {/* Logo */}
      <div className="px-4 py-5 flex flex-col items-center gap-2 border-b border-bg-border">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-lg">
          <Image src="/im-logo.png" alt="IM P&L" fill className="object-contain" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <button key={href} onClick={() => router.push(href)}
              className={`nav-item w-full text-left ${active ? 'active' : ''}`}>
              <Icon size={16} className={active ? 'text-brand-violet' : ''} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 py-4 border-t border-bg-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
               style={{ background: 'linear-gradient(135deg,#0EA5E9,#8B5CF6)' }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.username}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="nav-item w-full text-left text-slate-500 hover:text-negative">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
