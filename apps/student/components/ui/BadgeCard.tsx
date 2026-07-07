type BadgeCardProps = {
  title: string;
  description: string;
  earned: boolean;
  icon: string;
};

export function BadgeCard({ title, description, earned, icon }: BadgeCardProps) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${earned ? 'border-brand-accent/50 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-2 text-2xl">{icon}</div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${earned ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
          {earned ? 'Earned' : 'Keep going'}
        </span>
        <span className="text-xs font-medium text-slate-500">+50 XP</span>
      </div>
    </div>
  );
}
