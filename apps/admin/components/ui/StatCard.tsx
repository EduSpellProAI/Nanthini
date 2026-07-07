type StatCardProps = {
  title: string;
  value: string;
  detail: string;
};

export function StatCard({ title, value, detail }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-brand-accent">{detail}</p>
    </div>
  );
}
