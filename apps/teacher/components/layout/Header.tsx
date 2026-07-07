import Link from 'next/link';

export function Header() {
  return (
    <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
      <div>
        <p className="text-sm font-medium text-brand-primary">EduSpell Pro AI</p>
        <h1 className="text-lg font-semibold text-slate-900">Teacher portal</h1>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/reports" className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
          View reports
        </Link>
        <button className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white">
          Create activity
        </button>
      </div>
    </header>
  );
}
