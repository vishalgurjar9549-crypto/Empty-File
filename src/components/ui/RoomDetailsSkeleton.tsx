export function RoomDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-2 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6 pt-2">
          <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Mobile Actions */}
        <div className="flex justify-end gap-2 mb-4 md:hidden">
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Image Gallery */}
        <div className="mb-8 md:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
            <div className="md:col-span-8 h-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="hidden md:grid md:col-span-4 grid-rows-2 gap-4 h-full">
              <div className="rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>

          <div className="flex gap-3 mt-4 overflow-x-auto pb-2 md:hidden">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-24 h-20 rounded-lg bg-slate-200 dark:bg-slate-800"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-10">
            {/* Title Block */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-8">
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="space-y-3 w-full">
                  <div className="h-10 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-10 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                </div>

                <div className="hidden md:flex gap-2">
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="h-5 w-56 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-8 w-40 rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>

            {/* About */}
            <section className="space-y-4">
              <div className="h-8 w-48 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            </section>

            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

            {/* Amenities */}
            <section>
              <div className="h-8 w-56 rounded bg-slate-200 dark:bg-slate-800 mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
                    <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                ))}
              </div>
            </section>

            <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

            {/* Contact Section */}
            <section>
              <div className="h-8 w-64 rounded bg-slate-200 dark:bg-slate-800 mb-6" />
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-10 space-y-6">
                <div className="flex items-center gap-5">
                  <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-3">
                    <div className="h-6 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-28 rounded-xl bg-slate-200 dark:bg-slate-800"
                    />
                  ))}
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                  <div className="h-6 w-72 mx-auto rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-64 mx-auto rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </section>

            {/* Map */}
            <section>
              <div className="h-8 w-40 rounded bg-slate-200 dark:bg-slate-800 mb-6" />
              <div className="h-[350px] rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </section>
          </div>

          {/* RIGHT */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="h-10 w-40 rounded bg-slate-200 dark:bg-slate-700 mb-6" />
                <div className="space-y-4 mb-8">
                  <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-700 mb-4" />
                <div className="h-3 w-28 mx-auto rounded bg-slate-200 dark:bg-slate-700" />
              </div>

              <div className="rounded-2xl p-5 border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-4">
                <div className="h-12 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-12 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 lg:hidden z-40 flex items-center justify-between">
        <div>
          <div className="h-6 w-24 rounded bg-slate-200 dark:bg-slate-800 mb-2" />
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}