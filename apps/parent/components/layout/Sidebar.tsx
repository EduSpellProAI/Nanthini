import Link from 'next/link';
import { parentNavItems } from '@/lib/navigation';

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur lg:block">
      <div className="rounded-2xl bg-slate-900 p-4 text-white">
        <p className="text-sm text-slate-300">Parent portal</p>
        <p className="mt-1 text-xl font-semibold">Stay connected every day</p>
      </div>

      <nav className="mt-6 space-y-1" aria-label="Parent navigation">
        {parentNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
