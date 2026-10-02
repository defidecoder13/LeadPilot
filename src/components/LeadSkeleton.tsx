export function LeadSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="flex animate-pulse flex-col gap-3 rounded-2xl border border-line bg-surface p-5 sm:p-6"
        >
          <div className="flex min-h-11 items-center gap-3">
            <span className="h-5 w-5 flex-none rounded-md bg-line" />
            <span className="h-6 w-1/2 rounded-md bg-line" />
          </div>
          <span className="h-4 w-1/3 rounded-md bg-line" />
          <span className="h-4 w-2/5 rounded-md bg-line" />
          <div className="mt-1 flex gap-5 border-t border-line pt-4">
            <span className="h-4 w-24 rounded-full bg-line" />
            <span className="h-4 w-24 rounded-full bg-line" />
            <span className="h-4 w-24 rounded-full bg-line" />
          </div>
          <div className="flex items-center justify-between gap-5 border-t border-line pt-4">
            <span className="h-4 w-28 rounded-md bg-line" />
            <span className="h-9 w-32 rounded-xl bg-line" />
          </div>
        </div>
      ))}
    </div>
  );
}
