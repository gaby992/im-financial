import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { company, period, filename, rows } = await req.json();
    // period format: "2026-01"
    const [year, month] = period.split('-').map(Number);
    const periodStart = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const periodEnd   = new Date(year, month, 0).toISOString().split('T')[0];
    const periodLabel = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // 1. Create batch record
    const { data: batch, error: batchErr } = await supabase
      .from('upload_batches')
      .insert({
        company_code: company,
        filename,
        period_label: periodLabel,
        period_start: periodStart,
        period_end: periodEnd,
        uploaded_by: 'admin',
        row_count: rows.length,
      })
      .select()
      .single();

    if (batchErr) throw new Error(batchErr.message);

    // 2. Insert pl_entries
    const entries = rows.map((r: { category: string; description: string; amount: number; type: string }) => ({
      batch_id:     batch.id,
      company_code: company,
      entry_type:   r.type ?? 'expense',
      category:     r.category,
      description:  r.description,
      amount:       r.amount,
      entry_date:   periodStart,
    }));

    const { error: entriesErr } = await supabase.from('pl_entries').insert(entries);
    if (entriesErr) throw new Error(entriesErr.message);

    return NextResponse.json({ success: true, batchId: batch.id, rowCount: rows.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
