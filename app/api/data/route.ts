import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get('company') ?? 'IM';
    const period  = searchParams.get('period')  ?? null; // "2025-12" or null = all

    // Build query
    let query = supabase
      .from('pl_entries')
      .select('*, upload_batches(period_label, period_start)')
      .order('category');

    if (company !== 'All') {
      query = query.eq('company_code', company);
    }
    if (period) {
      const [y, m] = period.split('-').map(Number);
      const start = new Date(y, m - 1, 1).toISOString().split('T')[0];
      const end   = new Date(y, m, 0).toISOString().split('T')[0];
      query = query.gte('entry_date', start).lte('entry_date', end);
    }

    const { data: entries, error } = await query;
    if (error) throw error;

    if (!entries || entries.length === 0) {
      return NextResponse.json({ hasData: false, summary: null, categories: [], batches: [] });
    }

    // ── Aggregate categories ──────────────────────────────────────────────────
    const catMap: Record<string, { category: string; type: string; total: number; transactions: any[] }> = {};

    for (const e of entries) {
      if (!catMap[e.category]) {
        catMap[e.category] = { category: e.category, type: e.entry_type, total: 0, transactions: [] };
      }
      catMap[e.category].total += Number(e.amount);
      catMap[e.category].transactions.push({
        date:   e.txDate ?? e.entry_date,
        type:   e.txType ?? '',
        name:   e.txName ?? e.description,
        memo:   e.txMemo ?? '',
        amount: Number(e.amount),
      });
    }

    const categories = Object.values(catMap).filter(c => c.total > 0);

    // ── Summary ───────────────────────────────────────────────────────────────
    const totalIncome   = categories.filter(c => c.type === 'income').reduce((s,c) => s + c.total, 0);
    const totalExpenses = categories.filter(c => c.type === 'expense').reduce((s,c) => s + c.total, 0);
    const netPL         = totalIncome - totalExpenses;
    const margin        = totalIncome > 0 ? Math.round((netPL / totalIncome) * 1000) / 10 : 0;

    // ── Monthly trend (group by period_start month) ───────────────────────────
    const monthMap: Record<string, { income: number; expenses: number }> = {};
    for (const e of entries) {
      const date = e.entry_date ?? e.upload_batches?.period_start ?? '';
      if (!date) continue;
      const key = date.slice(0, 7); // "2025-12"
      if (!monthMap[key]) monthMap[key] = { income: 0, expenses: 0 };
      if (e.entry_type === 'income')  monthMap[key].income   += Number(e.amount);
      if (e.entry_type === 'expense') monthMap[key].expenses += Number(e.amount);
    }

    const trend = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, v]) => ({
        month:    new Date(key + '-01').toLocaleDateString('en-US', { month: 'short' }),
        income:   Math.round(v.income),
        expenses: Math.round(v.expenses),
        net:      Math.round(v.income - v.expenses),
      }));

    // ── Expense breakdown (top 8 categories by amount) ────────────────────────
    const COLORS = ['#8B5CF6','#F59E0B','#F97316','#0EA5E9','#EC4899','#10B981','#06B6D4','#6B7280'];
    const expCats = categories.filter(c => c.type === 'expense').sort((a,b) => b.total - a.total);
    const breakdown = expCats.slice(0, 7).map((c, i) => ({
      name:  c.category.length > 20 ? c.category.slice(0, 18) + '…' : c.category,
      value: Math.round(c.total),
      color: COLORS[i] ?? '#6B7280',
    }));
    const otherTotal = expCats.slice(7).reduce((s,c) => s + c.total, 0);
    if (otherTotal > 0) breakdown.push({ name: 'Other', value: Math.round(otherTotal), color: '#334155' });

    // ── Batches uploaded ─────────────────────────────────────────────────────
    const { data: batches } = await supabase
      .from('upload_batches')
      .select('id, company_code, period_label, period_start, period_end, row_count')
      .eq('company_code', company === 'All' ? 'IM' : company)
      .order('period_start', { ascending: false });

    return NextResponse.json({
      hasData: true,
      summary: { totalIncome, totalExpenses, netPL, margin },
      categories,
      trend,
      breakdown,
      batches: batches ?? [],
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
