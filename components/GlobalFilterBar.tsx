'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Company, DateFilter } from '@/types';
import { COMPANIES } from '@/lib/utils';
import { Calendar, ChevronDown, X } from 'lucide-react';

const COMPANIES_LIST: Company[] = ['All', 'IM', 'WSH', 'Abundant'];

export default function GlobalFilterBar() {
  const { company, setCompany, dateFilter, setDateFilter } = useApp();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const applyCustom = () => {
    if (customFrom && customTo) {
      setDateFilter({ type: 'custom', range: { from: customFrom, to: customTo } });
      setShowDatePicker(false);
    }
  };

  const getDateLabel = () => {
    if (dateFilter.type === 'all')    return 'All Time';
    if (dateFilter.type === 'month')  return `${new Date(dateFilter.year, dateFilter.month - 1).toLocaleString('en-US',{month:'long'})} ${dateFilter.year}`;
    if (dateFilter.type === 'custom') return `${dateFilter.range.from} → ${dateFilter.range.to}`;
    return 'Select Date';
  };

  const MONTHS = Array.from({length:12},(_,i)=>({value:i+1,label:new Date(2024,i).toLocaleString('en-US',{month:'long'})}));
  const YEARS  = [2024, 2025, 2026, 2027];

  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b border-bg-border bg-bg-card/50 backdrop-blur-sm">
      {/* Company selector */}
      <div className="flex items-center gap-1 p-0.5 bg-bg-base rounded-lg border border-bg-border">
        {COMPANIES_LIST.map(c => {
          const active = company === c;
          const color = c === 'All' ? '#94A3B8' : COMPANIES[c as keyof typeof COMPANIES].color;
          return (
            <button key={c} onClick={() => setCompany(c)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150"
              style={active ? { background: color + '20', color, border: `1px solid ${color}40` }
                           : { color: '#64748B', border: '1px solid transparent' }}>
              {c}
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-bg-border" />

      {/* Date filter */}
      <div className="relative">
        <button onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-2 px-3 py-1.5 bg-bg-base border border-bg-border rounded-lg text-xs text-slate-300 hover:border-brand-violet transition-colors">
          <Calendar size={13} className="text-brand-violet" />
          {getDateLabel()}
          <ChevronDown size={12} className="text-slate-500" />
        </button>

        {showDatePicker && (
          <div className="absolute top-full left-0 mt-2 w-72 card p-4 z-50 shadow-brand animate-fade-in">
            {/* Quick options */}
            <div className="space-y-1 mb-3">
              <button onClick={() => { setDateFilter({type:'all'}); setShowDatePicker(false); }}
                className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-bg-hover text-slate-300 transition-colors">
                All Time
              </button>
              {/* Month selector */}
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-2 mb-1">By Month</p>
              <div className="flex gap-2">
                <select onChange={e => {
                  const [y,m] = e.target.value.split('-');
                  setDateFilter({type:'month', year:+y, month:+m});
                  setShowDatePicker(false);
                }} className="flex-1 bg-bg-base border border-bg-border rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-brand-violet">
                  <option value="">Month</option>
                  {YEARS.flatMap(y => MONTHS.map(m => (
                    <option key={`${y}-${m.value}`} value={`${y}-${m.value}`}>{m.label} {y}</option>
                  )))}
                </select>
              </div>

              {/* Custom range */}
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-3 mb-1">Custom Range</p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500">From</label>
                    <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)}
                      className="w-full bg-bg-base border border-bg-border rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-brand-violet" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500">To</label>
                    <input type="date" value={customTo} onChange={e=>setCustomTo(e.target.value)}
                      className="w-full bg-bg-base border border-bg-border rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-brand-violet" />
                  </div>
                </div>
                <button onClick={applyCustom} disabled={!customFrom||!customTo}
                  className="btn-primary w-full py-1.5 text-xs disabled:opacity-40">Apply Range</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear date filter */}
      {dateFilter.type !== 'all' && (
        <button onClick={() => setDateFilter({type:'all'})}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors">
          <X size={12} /> Clear
        </button>
      )}
    </div>
  );
}
