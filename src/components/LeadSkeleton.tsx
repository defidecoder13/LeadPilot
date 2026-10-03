export function LeadSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="flex animate-pulse flex-col justify-between rounded-2xl border border-line bg-surface p-5 sm:p-6"
        >
          <div>
            <div className="flex items-start gap-3">
              <span className="h-5 w-5 flex-none rounded bg-line" />
              <span className="h-11 w-11 flex-none rounded-xl bg-line" />
              <div className="flex-1 space-y-2 pt-1">
                <span className="block h-4 w-3/4 rounded bg-line" />
                <span className="block h-3 w-1/3 rounded bg-line" />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <span className="h-3 w-28 rounded bg-line" />
              <span className="h-3 w-20 rounded bg-line" />
            </div>

            <div className="my-4 flex gap-2 border-t border-line/80 pt-3">
              <span className="h-5 w-20 rounded-full bg-line" />
              <span className="h-5 w-20 rounded-full bg-line" />
              <span className="h-5 w-20 rounded-full bg-line" />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-line/80 pt-3.5">
            <span className="h-4 w-24 rounded bg-line" />
            <span className="h-9 w-28 rounded-xl bg-line" />
          </div>
        </div>
      ))}
    </div>
  );
}
