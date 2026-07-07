export function DemoSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="grid gap-6 rounded-[2rem] border border-slate-200 bg-slate-900 p-8 text-white shadow-soft lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-accent">Interactive demo</p>
          <h2 className="mt-3 text-3xl font-semibold">Try a classroom-ready experience in minutes.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">See how the platform supports phonics, spelling, pronunciation, and progress tracking through a live, guided walkthrough.</p>
        </div>
        <div className="rounded-[1.5rem] bg-white/10 p-6">
          <div className="rounded-[1.25rem] bg-white/90 p-4 text-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-brand-primary">Today’s practice</p>
              <p className="rounded-full bg-brand-secondary/10 px-3 py-1 text-sm font-semibold text-brand-secondary">Level 3</p>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-100 p-4">
              <p className="text-sm text-slate-600">Say the word aloud</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">“beautiful”</p>
            </div>
            <div className="mt-4 flex gap-3">
              <div className="flex-1 rounded-2xl bg-brand-primary/10 p-3 text-center text-sm font-semibold text-brand-primary">Listen</div>
              <div className="flex-1 rounded-2xl bg-brand-secondary/10 p-3 text-center text-sm font-semibold text-brand-secondary">Practice</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
