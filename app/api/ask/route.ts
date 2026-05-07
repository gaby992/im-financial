import { NextRequest, NextResponse } from 'next/server';
import { IM_INCOME, IM_EXPENSES, IM_SUMMARY } from '@/lib/im-data';
import { WSH_INCOME, WSH_EXPENSES, WSH_SUMMARY } from '@/lib/wsh-data';
import { ABUNDANT_EXPENSES, ABUNDANT_SUMMARY, ABUNDANT_NOTE } from '@/lib/abundant-data';

// Build a compact financial context string for the AI
function buildContext(company: string): string {
  if (company === 'WSH') {
    const income = WSH_INCOME.map(g => `${g.category}: $${(g.total.WSH).toFixed(2)}`).join(', ');
    const expenses = WSH_EXPENSES.map(g => `${g.category}: $${g.total.WSH.toFixed(2)}`).join(', ');
    return `COMPANY: Western Star Holdings (WSH) | Period: Jan–Mar 2026
INCOME: ${income}
Total Income: $${WSH_SUMMARY.totalIncome.toFixed(2)}
EXPENSES: ${expenses}
Total Expenses: $${WSH_SUMMARY.totalExpenses.toFixed(2)}
Net P&L: $${WSH_SUMMARY.netPL.toFixed(2)} (${WSH_SUMMARY.margin}% margin)`;
  }

  if (company === 'Abundant') {
    const expenses = ABUNDANT_EXPENSES.map(g => `${g.category}: $${g.total.Abundant.toFixed(2)}`).join(', ');
    return `ENTITY: Abundant Legacy Trust (Trust — not a regular company) | Period: Jan–Mar 2026
NOTE: ${ABUNDANT_NOTE}
DISBURSEMENTS/EXPENSES: ${expenses}
Total Disbursements: $${ABUNDANT_SUMMARY.totalExpenses.toFixed(2)}
Net (Trust deficit): -$${ABUNDANT_SUMMARY.totalExpenses.toFixed(2)}`;
  }

  // Default: IM
  const income = IM_INCOME.map(g => `${g.category}: $${g.total.IM.toFixed(2)}`).join(', ');
  const expenses = IM_EXPENSES.map(g => `${g.category}: $${g.total.IM.toFixed(2)}`).join(', ');
  return `COMPANY: Interactive Marketing (IM) | Period: Jan–Apr 2026
INCOME: ${income}
Total Income: $${IM_SUMMARY.totalIncome.toFixed(2)}
EXPENSES: ${expenses}
Total Expenses: $${IM_SUMMARY.totalExpenses.toFixed(2)}
Net P&L: $${IM_SUMMARY.netPL.toFixed(2)} (${IM_SUMMARY.margin}% margin)`;
}

export async function POST(req: NextRequest) {
  try {
    const { question, company = 'IM', provider = 'openai', apiKey } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: 'No question provided' }, { status: 400 });
    }

    // Use client-provided key OR fall back to server-side env var
    const resolvedKey = apiKey?.trim() || (provider === 'openai'
      ? process.env.OPENAI_API_KEY
      : process.env.ANTHROPIC_API_KEY);

    if (!resolvedKey) {
      return NextResponse.json({ error: 'No API key — add it in Settings first.' }, { status: 400 });
    }

    const context = buildContext(company);

    const systemPrompt = `You are a financial analyst assistant for a bookkeeping dashboard.
You have access to real P&L data from QuickBooks exports. Answer questions clearly and concisely.
Use dollar amounts with 2 decimal places. Be direct and factual.

CURRENT FINANCIAL DATA:
${context}`;

    let answer = '';

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resolvedKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return NextResponse.json({ error: err.error?.message ?? 'OpenAI error' }, { status: 400 });
      }
      const data = await res.json();
      answer = data.choices[0].message.content;

    } else {
      // Claude
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': resolvedKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 500,
          system: systemPrompt,
          messages: [{ role: 'user', content: question }],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        return NextResponse.json({ error: err.error?.message ?? 'Claude error' }, { status: 400 });
      }
      const data = await res.json();
      answer = data.content[0].text;
    }

    return NextResponse.json({ answer });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Server error' }, { status: 500 });
  }
}
