export function LeadSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="glass-panel flex animate-pulse flex-col justify-between rounded-2xl border border-white/10 p-5 sm:p-6"
        >
          <div>
            <div className="flex items-start gap-3.5">
              <span className="h-4 w-4 shrink-0 rounded bg-slate-800" />
              <span className="h-11 w-11 flex-none rounded-xl bg-slate-800" />
              <div className="flex-1 space-y-2">
                <span className="block h-5 w-3/4 rounded-lg bg-slate-800" />
                <span className="block h-3.5 w-1/2 rounded bg-slate-800/60" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3">
              <span className="h-4 w-20 rounded bg-slate-800" />
              <div className="flex gap-1.5">
                <span className="h-6 w-6 rounded bg-slate-800" />
                <span className="h-6 w-6 rounded bg-slate-800" />
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <span className="h-5 w-20 rounded-full bg-slate-800" />
              <span className="h-5 w-24 rounded-full bg-slate-800" />
            </div>
          </div>

          <div className="mt-4 border-t border-slate-800/80 pt-3">
            <span className="block h-8 w-full rounded-xl bg-slate-800/60" />
          </div>
        </div>
      ))}
    </div>
  );
}
