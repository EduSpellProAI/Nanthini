import Link from 'next/link';
import { studentNavItems } from '@/lib/navigation';

export function MobileNavigation() {
  return (
    <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm lg:hidden" aria-label="Mobile navigation">
      {studentNavItems.slice(0, 6).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          <span>{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
