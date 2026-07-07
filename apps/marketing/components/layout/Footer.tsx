import Link from 'next/link';

const footerLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/teachers', label: 'Teachers' },
  { href: '/parents', label: 'Parents' },
  { href: '/students', label: 'Students' },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-lg font-semibold text-slate-900">EduSpell Pro AI</p>
          <p className="mt-2 max-w-md text-sm leading-7 text-slate-600">A premium AI learning platform designed for joyful, measurable progress in primary schools.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-brand-primary">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
