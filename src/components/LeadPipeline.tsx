export type PipelineStage =
  | "all"
  | "new"
  | "researching"
  | "ready"
  | "drafted"
  | "approved"
  | "sent";

export type StageCounts = Record<PipelineStage, number>;

const STAGES: { stage: PipelineStage; label: string; dotColor: string }[] = [
  { stage: "all", label: "All Prospects", dotColor: "bg-muted" },
  { stage: "new", label: "New", dotColor: "bg-[var(--primary)]" },
  { stage: "researching", label: "Researching", dotColor: "bg-[var(--focus)]" },
  { stage: "ready", label: "Ready", dotColor: "bg-[var(--success-ink)]" },
  { stage: "drafted", label: "Drafted", dotColor: "bg-purple-600" },
  { stage: "approved", label: "Approved", dotColor: "bg-amber-600" },
  { stage: "sent", label: "Sent", dotColor: "bg-emerald-600" },
];

type LeadPipelineProps = {
  counts: StageCounts;
  active: PipelineStage | null;
  onSelect: (stage: PipelineStage) => void;
};

export function LeadPipeline({ counts, active, onSelect }: LeadPipelineProps) {
  const currentActive = active ?? "all";

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Pipeline Stages
        </span>
        <span className="text-xs font-semibold text-muted">
          Showing <span className="text-ink font-bold">{counts[currentActive] ?? counts.all}</span> of{" "}
          <span className="text-ink font-bold">{counts.all}</span> prospects
        </span>
      </div>

      <div
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar rounded-2xl border border-line bg-surface/80 p-1.5 shadow-xs backdrop-blur-xs"
        role="group"
        aria-label="Filter leads by pipeline stage"
      >
        {STAGES.map((item) => {
          const isActive = currentActive === item.stage;
          const count = counts[item.stage];

          return (
            <button
              key={item.stage}
              type="button"
              onClick={() => onSelect(item.stage)}
              aria-pressed={isActive}
              className={`group inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-surface text-ink shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] border border-line-strong font-bold"
                  : "text-muted hover:bg-canvas hover:text-ink border border-transparent"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 flex-none rounded-full ${item.dotColor} ${
                  item.stage === "researching" && count > 0 ? "animate-pulse" : ""
                }`}
              />
              <span>{item.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-canvas text-muted group-hover:text-ink"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

