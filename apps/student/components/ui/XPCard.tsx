export function XPCard() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-brand-primary to-sky-500 p-6 text-white shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-100">Current streak</p>
          <p className="mt-2 text-3xl font-semibold">7 days</p>
          <p className="mt-2 text-sm text-blue-50">You are 120 XP away from the next reward.</p>
        </div>
        <div className="rounded-2xl bg-white/20 px-3 py-2 text-sm font-semibold">+320 XP</div>
      </div>
    </div>
  );
}
