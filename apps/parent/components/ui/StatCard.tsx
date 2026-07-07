type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  accent?: string;
};

export function StatCard({ title, value, subtitle, accent = 'bg-brand-primary/10 text-brand-primary' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${accent}`}>{title}</div>
      <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}
