type TimelineItem = {
  title: string;
  detail: string;
  time: string;
};

export function TimelineCard({ items }: { items: TimelineItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Recent updates</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.title} className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-slate-800">{item.title}</p>
              <span className="text-sm text-slate-500">{item.time}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
