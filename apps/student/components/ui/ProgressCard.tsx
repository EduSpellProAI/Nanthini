type ProgressCardProps = {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
};

export function ProgressCard({ title, value, subtitle, trend }: ProgressCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      <p className="mt-3 text-sm font-medium text-brand-accent">{trend}</p>
    </div>
  );
}
