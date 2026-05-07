'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { PLGroup, Company } from '@/types';
import { formatCurrency, COMPANIES } from '@/lib/utils';
import { IM_EXPENSES, IM_INCOME } from '@/lib/im-data';
import { Download, X, ChevronDown, ChevronRight } from 'lucide-react';

// Combine income + expenses into P&L sections
const INCOME_GROUPS: PLGroup[] = IM_INCOME.map(g => ({
  category: g.category,
  color: g.color,
  total: { IM: g.total.IM, WSH: g.total.WSH, Abundant: g.total.Abundant },
  items: g.items,
}));

const EXPENSE_GROUPS: PLGroup[] = IM_EXPENSES.map(g => ({
  category: g.category,
  color: g.color,
  total: { IM: g.total.IM, WSH: g.total.WSH, Abundant: g.total.Abundant },
  items: g.items,
}));

function DrillDrawer({ group, onClose }: { group: PLGroup; onClose: () => void }) {
  const totalIM = group.total.IM + group.total.WSH + group.total.Abundant;
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ background: group.color }} />
            <span className="text-lg font-bold text-white">{group.category}</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="mb-4 p-3 rounded-lg border" style={{ background: group.color + '10', borderColor: group.color + '30' }}>
          <p className="text-xs text-slate-400">Total · Jan–Apr 2026</p>
          <p className="text-2xl font-bold" style={{ color: group.color }}>{formatCurrency(totalIM)}</p>
        </div>

        <table className="data-table w-full">
          <thead>
            <tr>
              <th className="text-left">Description</th>
              <th className="text-right">IM</th>
            </tr>
          </thead>
          <tbody>
            {(group.items ?? []).map((e, i) => (
              <tr key={i} className="hover:bg-bg-hover transition-colors">
                <td className="text-slate-300">{e.description}</td>
                <td className="text-right font-mono text-sm text-white">{formatCurrency(e.amount.IM)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PLSection({
  title, groups, isAll, companies, openDrawer, setOpenDrawer, collapsed, setCollapsed, isIncome
}: {
  title: string; groups: PLGroup[]; isAll: boolean;
  companies: Exclude<Company,'All'>[];
  openDrawer: PLGroup | null; setOpenDrawer: (g: PLGroup | null) => void;
  collapsed: Record<string, boolean>; setCollapsed: (fn: (p: Record<string,boolean>) => Record<string,boolean>) => void;
  isIncome?: boolean;
}) {
  const sectionTotal = groups.reduce((s, g) => s + g.total.IM + g.total.WSH + g.total.Abundant, 0);
  const color = isIncome ? '#10B981' : '#F43F5E';

  return (
    <>
      {/* Section header */}
      <tr className="bg-bg-base">
        <td colSpan={isAll ? 5 : 2} className="py-2 px-4">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
            {title}
          </span>
        </td>
      </tr>

      {groups.map(group => {
        const isCollapsed = collapsed[group.category];
        const groupTotal = group.total.IM + group.total.WSH + group.total.Abundant;
        return (
          <>
            {/* Category row */}
            <tr key={group.category + '-hdr'}
                className="border-t cursor-pointer hover:bg-bg-hover transition-colors"
                style={{ borderColor: group.color + '30' }}
                onClick={() => setCollapsed(prev => ({ ...prev, [group.category]: !prev[group.category] }))}>
              <td className="py-3 px-4">
                <span className="flex items-center gap-2 font-semibold text-white">
                  {isCollapsed ? <ChevronRight size={14} style={{ color: group.color }} /> : <ChevronDown size={14} style={{ color: group.color }} />}
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: group.color }} />
                  {group.category}
                </span>
              </td>
              {isAll ? (
                <>
                  {companies.map(c => (
                    <td key={c} className="text-right py-3 px-4 font-mono text-sm text-slate-400">
                      {group.total[c] ? formatCurrency(group.total[c]) : '—'}
                    </td>
                  ))}
                  <td className="text-right py-3 px-4 font-bold font-mono" style={{ color: group.color }}>
                    {formatCurrency(groupTotal)}
                  </td>
                </>
              ) : (
                <td className="text-right py-3 px-4 font-bold font-mono" style={{ color: group.color }}>
                  {formatCurrency(group.total.IM)}
                </td>
              )}
            </tr>

            {/* Line items */}
            {!isCollapsed && (group.items ?? []).map((entry, i) => (
              <tr key={i} className="hover:bg-bg-hover/40 transition-colors">
                <td className="py-2 px-4 pl-12 text-slate-400 text-sm">{entry.description}</td>
                {isAll ? (
                  <>
                    <td colSpan={3} />
                    <td className="text-right py-2 px-4 text-sm font-mono text-slate-300">
                      {formatCurrency(entry.amount.IM)}
                    </td>
                  </>
                ) : (
                  <td className="text-right py-2 px-4 text-sm font-mono text-slate-300">
                    {formatCurrency(entry.amount.IM)}
                  </td>
                )}
              </tr>
            ))}

            {/* Total row — clickable */}
            <tr key={group.category + '-total'}
                className="hover:bg-bg-hover transition-colors cursor-pointer"
                onClick={() => setOpenDrawer(group)}>
              <td className="py-2 px-4 pl-12 text-xs font-bold uppercase tracking-wider"
                  style={{ color: group.color }}>
                Total {group.category} ↗
              </td>
              {isAll ? (
                <>
                  {companies.map(c => (
                    <td key={c} className="text-right py-2 px-4 font-bold font-mono text-sm" style={{ color: group.color }}>
                      {group.total[c] ? formatCurrency(group.total[c]) : '—'}
                    </td>
                  ))}
                  <td className="text-right py-2 px-4 font-bold font-mono text-sm" style={{ color: group.color }}>
                    {formatCurrency(groupTotal)}
                  </td>
                </>
              ) : (
                <td className="text-right py-2 px-4 font-bold font-mono text-sm" style={{ color: group.color }}>
                  {formatCurrency(group.total.IM)}
                </td>
              )}
            </tr>
          </>
        );
      })}

      {/* Section total */}
      <tr style={{ background: color + '08', borderTop: `2px solid ${color}30` }}>
        <td className="py-3 px-4 font-bold text-sm" style={{ color }}>
          Total {title}
        </td>
        {isAll ? (
          <>
            {companies.map(c => (
              <td key={c} className="text-right py-3 px-4 font-bold font-mono" style={{ color }}>
                {formatCurrency(groups.reduce((s, g) => s + (g.total[c] ?? 0), 0))}
              </td>
            ))}
            <td className="text-right py-3 px-4 font-bold font-mono text-base" style={{ color }}>
              {formatCurrency(sectionTotal)}
            </td>
          </>
        ) : (
          <td className="text-right py-3 px-4 font-bold font-mono text-base" style={{ color }}>
            {formatCurrency(groups.reduce((s, g) => s + g.total.IM, 0))}
          </td>
        )}
      </tr>
    </>
  );
}

export default function PLPage() {
  const { company } = useApp();
  const [openDrawer, setOpenDrawer] = useState<PLGroup | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const isAll = company === 'All';
  const companies: Exclude<Company,'All'>[] = ['IM', 'WSH', 'Abundant'];

  const totalIncome   = INCOME_GROUPS.reduce((s, g) => s + g.total.IM, 0);
  const totalExpenses = EXPENSE_GROUPS.reduce((s, g) => s + g.total.IM, 0);
  const netPL         = totalIncome - totalExpenses;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">P&L Detail</h1>
          <p className="text-sm text-slate-500 mt-0.5">Interactive Marketing · Jan – Apr 2026</p>
        </div>
        <button className="btn-secondary flex items-center gap-2 text-xs">
          <Download size={14} /> Export Excel
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="data-table w-full">
          <thead>
            <tr className="bg-bg-hover">
              <th className="w-1/2 py-3">Category / Description</th>
              {isAll ? (
                <>
                  {companies.map(c => (
                    <th key={c} className="text-right py-3" style={{ color: COMPANIES[c].color }}>{c}</th>
                  ))}
                  <th className="text-right py-3">Total</th>
                </>
              ) : (
                <th className="text-right py-3">Amount</th>
              )}
            </tr>
          </thead>
          <tbody>
            <PLSection title="INCOME" groups={INCOME_GROUPS} isIncome isAll={isAll}
              companies={companies} openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}
              collapsed={collapsed} setCollapsed={setCollapsed} />

            <PLSection title="EXPENSES" groups={EXPENSE_GROUPS} isAll={isAll}
              companies={companies} openDrawer={openDrawer} setOpenDrawer={setOpenDrawer}
              collapsed={collapsed} setCollapsed={setCollapsed} />

            {/* Net P&L */}
            <tr className="border-t-2 border-slate-600" style={{ background: '#0F0F1A' }}>
              <td className="py-4 px-4 font-bold text-white text-base">NET P&L</td>
              {isAll ? (
                <>
                  {companies.map(c => (
                    <td key={c} className={`text-right py-4 px-4 font-bold font-mono text-base ${netPL >= 0 ? 'text-positive' : 'text-negative'}`}>
                      {formatCurrency(netPL)}
                    </td>
                  ))}
                  <td className={`text-right py-4 px-4 font-bold font-mono text-xl ${netPL >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {formatCurrency(netPL)}
                  </td>
                </>
              ) : (
                <td className={`text-right py-4 px-4 font-bold font-mono text-xl ${netPL >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatCurrency(netPL)}
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>

      {openDrawer && <DrillDrawer group={openDrawer} onClose={() => setOpenDrawer(null)} />}
    </div>
  );
}
