import Link from 'next/link';

const links = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/schools', label: 'Schools' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
      <Link href="/" className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary text-lg font-semibold text-white shadow-soft">
          E
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-primary">EduSpell Pro AI</p>
          <p className="text-sm text-slate-600">Premium learning experiences</p>
        </div>
      </Link>
      <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 lg:flex">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="transition hover:text-brand-primary">
            {link.label}
          </Link>
        ))}
      </nav>
      <Link href="/contact" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:scale-[1.02]">
        Book a demo
      </Link>
    </header>
  );
}
