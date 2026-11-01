export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-9 w-40 animate-pulse rounded-full bg-slate-200" />
      </div>

      <div className="space-y-6 md:space-y-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-6 w-16 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-14 animate-pulse rounded bg-slate-100" />
            </div>
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"
                >
                  <div className="space-y-2">
                    <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-40 animate-pulse rounded bg-slate-100" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"
                  >
                    <div className="space-y-2">
                      <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                    </div>
                    <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-44 animate-pulse rounded bg-slate-100" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-9 animate-pulse rounded-lg bg-slate-100"
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

