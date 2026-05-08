import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper: build entry_date range from query params
function buildDateFilter(sp: URLSearchParams) {
  const period = sp.get('period');   // "2026-01"
  const from   = sp.get('from');     // "2026-01-01"
  const to     = sp.get('to');       // "2026-03-31"
  if (period) {
    const [y, m] = period.split('-').map(Number);
    return {
      start: new Date(y, m - 1, 1).toISOString().split('T')[0],
      end:   new Date(y, m, 0).toISOString().split('T')[0],
    };
  }
  if (from && to) return { start: from, end: to };
  return null;
}

async function fetchEntries(company: string, dateRange: { start: string; end: string } | null) {
  let q = supabase
    .from('pl_entries')
    .select('id, company_code, entry_type, category, description, amount, entry_date, batch_id')
    .order('category');

  if (company !== 'All') q = q.eq('company_code', company);
  if (dateRange) q = q.gte('entry_date', dateRange.start).lte('entry_date', dateRange.end);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

async function fetchBatches(company: string) {
  let q = supabase
    .from('upload_batches')
    .select('id, company_code, period_label, period_start, period_end, row_count, filename, uploaded_by, uploaded_at')
    .order('period_start', { ascending: false });
  if (company !== 'All') q = q.eq('company_code', company);
  const { data } = await q;
  return data ?? [];
}

function aggregateByCategory(entries: any[]) {
  const map: Record<string, { category: string; type: string; total: number; transactions: any[] }> = {};
  for (const e of entries) {
    if (!map[e.category]) map[e.category] = { category: e.category, type: e.entry_type, total: 0, transactions: [] };
    map[e.category].total += Number(e.amount);
    map[e.category].transactions.push({ name: e.description, amount: Number(e.amount) });
  }
  return Object.values(map).filter(c => c.total > 0);
}

function buildSummary(categories: any[]) {
  const totalIncome   = categories.filter(c => c.type === 'income').reduce((s, c) => s + c.total, 0);
  const totalExpenses = categories.filter(c => c.type === 'expense').reduce((s, c) => s + c.total, 0);
  const netPL         = totalIncome - totalExpenses;
  const margin        = totalIncome > 0 ? Math.round((netPL / totalIncome) * 1000) / 10 : 0;
  return { totalIncome, totalExpenses, netPL, margin };
}

function buildBreakdown(categories: any[]) {
  const COLORS = ['#8B5CF6','#F59E0B','#F97316','#0EA5E9','#EC4899','#10B981','#06B6D4','#6B7280'];
  const expCats = categories.filter(c => c.type === 'expense').sort((a, b) => b.total - a.total);
  const breakdown = expCats.slice(0, 7).map((c, i) => ({
    name: c.category.length > 22 ? c.category.slice(0, 20) + '…' : c.category,
    value: Math.round(c.total), color: COLORS[i] ?? '#6B7280',
  }));
  const other = expCats.slice(7).reduce((s, c) => s + c.total, 0);
  if (other > 0) breakdown.push({ name: 'Other', value: Math.round(other), color: '#334155' });
  return breakdown;
}

function buildTrend(entries: any[], batchMap: Record<string, string>) {
  const monthMap: Record<string, { income: number; expenses: number; label: string }> = {};
  for (const e of entries) {
    const date = batchMap[e.batch_id] ?? e.entry_date ?? '';
    if (!date) continue;
    const key   = date.slice(0, 7);
    const label = new Date(key + '-02').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!monthMap[key]) monthMap[key] = { income: 0, expenses: 0, label };
    if (e.entry_type === 'income')  monthMap[key].income   += Number(e.amount);
    if (e.entry_type === 'expense') monthMap[key].expenses += Number(e.amount);
  }
  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ month: v.label, income: Math.round(v.income), expenses: Math.round(v.expenses), net: Math.round(v.income - v.expenses) }));
}

// ── GET /api/data ─────────────────────────────────────────────────────────────
// ?company=IM|WSH|Abundant|All
// ?period=2026-01            (single month)
// ?from=2026-01-01&to=2026-03-31  (date range)
// ?batches=1                 (return batches only)
// ?mode=companies            (per-company breakdown for All view)
// ?mode=monthly              (per-month breakdown for single company)
export async function GET(req: NextRequest) {
  try {
    const sp         = req.nextUrl.searchParams;
    const company    = sp.get('company') ?? 'IM';
    const mode       = sp.get('mode')    ?? 'standard';
    const batchesOnly = sp.get('batches') === '1';
    const dateRange  = buildDateFilter(sp);

    const batches = await fetchBatches('All');
    if (batchesOnly) return NextResponse.json({ batches });

    const batchMap: Record<string, string> = {};
    for (const b of batches) batchMap[b.id] = b.period_start ?? '';

    // ── Mode: per-company breakdown (All companies view) ──────────────────────
    if (mode === 'companies') {
      const COMPANIES = ['IM', 'WSH', 'Abundant'];
      const perCompany: Record<string, Record<string, number>> = {};
      const typeMap:    Record<string, string> = {};
      const allCats = new Set<string>();

      for (const co of COMPANIES) {
        const entries = await fetchEntries(co, dateRange);
        const cats    = aggregateByCategory(entries);
        perCompany[co] = {};
        for (const cat of cats) {
          perCompany[co][cat.category] = cat.total;
          typeMap[cat.category]        = cat.type;
          allCats.add(cat.category);
        }
      }

      const categories = [...allCats].map(cat => ({
        category:  cat,
        type:      typeMap[cat] ?? 'expense',
        byCompany: {
          IM:       perCompany.IM[cat]       ?? 0,
          WSH:      perCompany.WSH[cat]      ?? 0,
          Abundant: perCompany.Abundant[cat] ?? 0,
        },
        total: (perCompany.IM[cat] ?? 0) + (perCompany.WSH[cat] ?? 0) + (perCompany.Abundant[cat] ?? 0),
      })).filter(c => c.total > 0);

      const companySummaries: Record<string, any> = {};
      for (const co of COMPANIES) {
        const entries = await fetchEntries(co, dateRange);
        companySummaries[co] = buildSummary(aggregateByCategory(entries));
      }
      const allEntries = await fetchEntries('All', dateRange);
      const allCats2   = aggregateByCategory(allEntries);

      return NextResponse.json({
        hasData:    allCats2.length > 0,
        mode:       'companies',
        companies:  COMPANIES,
        categories,
        summaries:  companySummaries,
        summary:    buildSummary(allCats2),
        breakdown:  buildBreakdown(allCats2),
        trend:      buildTrend(allEntries, batchMap),
        batches:    batches.filter(b => true),
      });
    }

    // ── Mode: per-month breakdown (Single company, all periods) ───────────────
    if (mode === 'monthly') {
      const entries = await fetchEntries(company, dateRange);
      if (!entries.length) return NextResponse.json({ hasData: false, mode: 'monthly' });

      const months = [...new Set(entries.map(e => (batchMap[e.batch_id] ?? e.entry_date ?? '').slice(0, 7)))]
        .filter(Boolean).sort();
      const monthLabels = months.map(m => new Date(m + '-02').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));

      const catMonthMap: Record<string, { type: string; byMonth: Record<string, number>; total: number }> = {};
      for (const e of entries) {
        const monthKey = (batchMap[e.batch_id] ?? e.entry_date ?? '').slice(0, 7);
        if (!monthKey) continue;
        if (!catMonthMap[e.category]) catMonthMap[e.category] = { type: e.entry_type, byMonth: {}, total: 0 };
        catMonthMap[e.category].byMonth[monthKey]  = (catMonthMap[e.category].byMonth[monthKey] ?? 0) + Number(e.amount);
        catMonthMap[e.category].total              += Number(e.amount);
      }

      const categories = Object.entries(catMonthMap).map(([cat, v]) => ({
        category: cat, type: v.type,
        byMonth:  Object.fromEntries(months.map((m, i) => [monthLabels[i], v.byMonth[m] ?? 0])),
        total:    v.total,
      })).filter(c => c.total > 0);

      const allCats = aggregateByCategory(entries);
      return NextResponse.json({
        hasData: true, mode: 'monthly',
        months: monthLabels, categories,
        summary: buildSummary(allCats),
      });
    }

    // ── Standard mode ─────────────────────────────────────────────────────────
    const entries    = await fetchEntries(company, dateRange);
    if (!entries.length) return NextResponse.json({ hasData: false, summary: null, categories: [], trend: [], breakdown: [], batches });

    const categories = aggregateByCategory(entries);
    return NextResponse.json({
      hasData:    true,
      summary:    buildSummary(categories),
      categories,
      trend:      buildTrend(entries, batchMap),
      breakdown:  buildBreakdown(categories),
      batches:    batches.filter(b => company === 'All' || b.company_code === company),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/data?batchId=xxx
export async function DELETE(req: NextRequest) {
  try {
    const batchId = req.nextUrl.searchParams.get('batchId');
    if (!batchId) return NextResponse.json({ error: 'batchId required' }, { status: 400 });
    await supabase.from('pl_entries').delete().eq('batch_id', batchId);
    await supabase.from('upload_batches').delete().eq('id', batchId);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
