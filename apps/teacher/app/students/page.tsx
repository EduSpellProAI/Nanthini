export default function StudentsPage() {
  return (
    <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Student management</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Track reading readiness, support needs, and family communication in one place.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { name: 'Maya Patel', status: 'Strong reader', focus: 'Vocabulary' },
          { name: 'Noah Kim', status: 'Needs support', focus: 'Pronunciation' },
          { name: 'Ava Lewis', status: 'On track', focus: 'Spelling' },
        ].map((student) => (
          <div key={student.name} className="rounded-2xl bg-slate-50 p-4">
            <p className="font-semibold text-slate-900">{student.name}</p>
            <p className="mt-2 text-sm text-slate-600">Status: {student.status}</p>
            <p className="mt-2 text-sm text-slate-600">Focus: {student.focus}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
