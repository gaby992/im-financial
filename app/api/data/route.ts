import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET  /api/data?company=IM&period=2025-12
// GET  /api/data?company=IM&batches=1   (returns upload batches only)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const company    = searchParams.get('company')  ?? 'IM';
    const period     = searchParams.get('period')   ?? null;
    const batchesOnly = searchParams.get('batches') === '1';

    // ── Batches ───────────────────────────────────────────────────────────────
    let batchQuery = supabase
      .from('upload_batches')
      .select('id, company_code, period_label, period_start, period_end, row_count, filename, uploaded_by, uploaded_at')
      .order('period_start', { ascending: false });

    if (company !== 'All') batchQuery = batchQuery.eq('company_code', company);

    const { data: batches, error: bErr } = await batchQuery;
    if (bErr) throw bErr;
    if (batchesOnly) return NextResponse.json({ batches: batches ?? [] });

    // ── Entries ───────────────────────────────────────────────────────────────
    let query = supabase
      .from('pl_entries')
      .select('id, company_code, entry_type, category, description, amount, entry_date, batch_id')
      .order('category');

    if (company !== 'All') query = query.eq('company_code', company);

    if (period) {
      const [y, m] = period.split('-').map(Number);
      const start = new Date(y, m - 1, 1).toISOString().split('T')[0];
      const end   = new Date(y, m, 0).toISOString().split('T')[0];
      query = query.gte('entry_date', start).lte('entry_date', end);
    }

    const { data: entries, error } = await query;
    if (error) throw error;

    if (!entries || entries.length === 0) {
      return NextResponse.json({ hasData: false, summary: null, categories: [], trend: [], breakdown: [], batches: batches ?? [] });
    }

    // ── Group by category ─────────────────────────────────────────────────────
    const catMap: Record<string, { category: string; type: string; total: number; transactions: { name: string; amount: number }[] }> = {};
    for (const e of entries) {
      if (!catMap[e.category]) catMap[e.category] = { category: e.category, type: e.entry_type, total: 0, transactions: [] };
      catMap[e.category].total += Number(e.amount);
      catMap[e.category].transactions.push({ name: e.description, amount: Number(e.amount) });
    }

    const categories = Object.values(catMap).filter(c => c.total > 0);
    const totalIncome   = categories.filter(c => c.type === 'income').reduce((s, c) => s + c.total, 0);
    const totalExpenses = categories.filter(c => c.type === 'expense').reduce((s, c) => s + c.total, 0);
    const netPL         = totalIncome - totalExpenses;
    const margin        = totalIncome > 0 ? Math.round((netPL / totalIncome) * 1000) / 10 : 0;

    // ── Monthly trend (group by batch period) ─────────────────────────────────
    const batchMap: Record<string, string> = {};
    for (const b of (batches ?? [])) batchMap[b.id] = b.period_start ?? '';

    const monthMap: Record<string, { income: number; expenses: number; label: string }> = {};
    for (const e of entries) {
      const date = batchMap[e.batch_id] ?? e.entry_date ?? '';
      if (!date) continue;
      const key   = date.slice(0, 7);
      const label = new Date(key + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      if (!monthMap[key]) monthMap[key] = { income: 0, expenses: 0, label };
      if (e.entry_type === 'income')  monthMap[key].income   += Number(e.amount);
      if (e.entry_type === 'expense') monthMap[key].expenses += Number(e.amount);
    }

    const trend = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ month: v.label, income: Math.round(v.income), expenses: Math.round(v.expenses), net: Math.round(v.income - v.expenses) }));

    // ── Expense breakdown ─────────────────────────────────────────────────────
    const COLORS = ['#8B5CF6','#F59E0B','#F97316','#0EA5E9','#EC4899','#10B981','#06B6D4','#6B7280'];
    const expCats = categories.filter(c => c.type === 'expense').sort((a, b) => b.total - a.total);
    const breakdown = expCats.slice(0, 7).map((c, i) => ({
      name:  c.category.length > 22 ? c.category.slice(0, 20) + '…' : c.category,
      value: Math.round(c.total),
      color: COLORS[i] ?? '#6B7280',
    }));
    const otherTotal = expCats.slice(7).reduce((s, c) => s + c.total, 0);
    if (otherTotal > 0) breakdown.push({ name: 'Other', value: Math.round(otherTotal), color: '#334155' });

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

// DELETE /api/data?batchId=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get('batchId');
    if (!batchId) return NextResponse.json({ error: 'batchId required' }, { status: 400 });

    await supabase.from('pl_entries').delete().eq('batch_id', batchId);
    await supabase.from('upload_batches').delete().eq('id', batchId);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
