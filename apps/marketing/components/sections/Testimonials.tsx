const testimonials = [
  {
    quote: 'The platform feels magical for our Year 2 pupils. They are more confident and eager to practice every day.',
    author: 'Mina Patel',
    role: 'Head of Early Years',
  },
  {
    quote: 'We finally have a simple way to show parents meaningful progress without adding more admin.',
    author: 'Daniel Ross',
    role: 'Assistant Headteacher',
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-secondary">Testimonials</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Loved by schools, teachers, and families.</h2>
        </div>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {testimonials.map((item) => (
          <div key={item.author} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-lg leading-8 text-slate-700">“{item.quote}”</p>
            <div className="mt-6">
              <p className="font-semibold text-slate-900">{item.author}</p>
              <p className="text-sm text-slate-500">{item.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
