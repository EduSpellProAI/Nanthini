type ActivityItem = {
  title: string;
  detail: string;
  time: string;
};

const activities: ActivityItem[] = [
  { title: 'Completed spelling quiz', detail: 'Short vowel words', time: '10 min ago' },
  { title: 'Practised pronunciation', detail: 'Weather words', time: '1 hour ago' },
  { title: 'Unlocked a new badge', detail: 'Confident Reader', time: 'Yesterday' },
];

export function RecentActivity() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Recent activity</h2>
        <a href="/progress" className="text-sm font-medium text-brand-primary">View all</a>
      </div>
      <ul className="mt-4 space-y-3">
        {activities.map((item) => (
          <li key={item.title} className="flex items-start justify-between gap-4 rounded-xl bg-slate-50 p-3">
            <div>
              <p className="font-medium text-slate-800">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
            </div>
            <span className="text-sm text-slate-500">{item.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
