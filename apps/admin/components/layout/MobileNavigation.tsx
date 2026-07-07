import Link from 'next/link';
import { adminNavItems } from '@/lib/navigation';

export function MobileNavigation() {
  return (
    <nav className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur lg:hidden" aria-label="Mobile admin navigation">
      {adminNavItems.slice(0, 6).map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
