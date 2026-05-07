'use client';
import Link from 'next/link';
import { Upload } from 'lucide-react';

function EmptyState({ company }: { company: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 space-y-5 animate-slide-up">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
           style={{ background: 'linear-gradient(135deg,#0EA5E9,#8B5CF6)' }}>
        <Upload size={32} className="text-white" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white">No data yet for {company}</h2>
        <p className="text-slate-500 text-sm max-w-sm">
          Upload a QuickBooks P&L Excel file to start seeing your financials here.
        </p>
      </div>
      <Link href="/upload"
        className="btn-primary px-6 py-3 flex items-center gap-2 text-sm font-semibold">
        <Upload size={16} /> Upload First Statement
      </Link>
    </div>
  );
}

export default function DashboardPage() {
  // Data will be loaded from Supabase after first upload
  // For now, show the empty state to prompt user to upload
  return <EmptyState company="your companies" />;
}
