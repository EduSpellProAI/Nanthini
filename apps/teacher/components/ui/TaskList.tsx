type TaskItem = {
  title: string;
  detail: string;
};

export function TaskList({ items }: { items: TaskItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Priority tasks</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.title} className="rounded-xl bg-slate-50 p-3">
            <p className="font-medium text-slate-800">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
