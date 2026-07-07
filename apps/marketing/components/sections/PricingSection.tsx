const plans = [
  {
    name: 'Starter',
    price: '$29',
    description: 'Perfect for small schools beginning their AI journey.',
    features: ['Up to 100 learners', 'Core spelling tools', 'Weekly reports'],
    featured: false,
  },
  {
    name: 'Growth',
    price: '$89',
    description: 'For ambitious schools wanting richer insights and family engagement.',
    features: ['Unlimited learners', 'Adaptive practice', 'Teacher dashboards'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Bespoke support, integrations, and rollout planning for larger networks.',
    features: ['Multi-site support', 'Advanced analytics', 'Dedicated onboarding'],
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-accent">Pricing</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Simple plans for every stage of growth.</h2>
        </div>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className={`rounded-[1.5rem] border p-6 shadow-sm ${plan.featured ? 'border-brand-primary bg-brand-primary text-white' : 'border-slate-200 bg-white text-slate-900'}`}>
            <p className={`text-sm font-semibold uppercase tracking-[0.3em] ${plan.featured ? 'text-white/80' : 'text-brand-primary'}`}>{plan.name}</p>
            <p className="mt-4 text-4xl font-semibold">{plan.price}</p>
            <p className={`mt-3 text-sm leading-7 ${plan.featured ? 'text-white/80' : 'text-slate-600'}`}>{plan.description}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
