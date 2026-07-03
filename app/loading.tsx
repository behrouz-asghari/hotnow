export default function Loading() {
  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6 animate-pulse" dir="rtl">
      <header className="flex items-center justify-between">
        <div className="h-8 w-64 rounded bg-gray-200" />
        <div className="h-4 w-40 rounded bg-gray-200" />
      </header>

      {/* StatCards skeleton */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="h-8 w-20 rounded bg-gray-300" />
          </div>
        ))}
      </section>

      {/* AnalysisPanel skeleton */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3 min-h-[180px]">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-11/12 rounded bg-gray-200" />
              <div className="h-3 w-10/12 rounded bg-gray-200" />
              <div className="h-3 w-9/12 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
