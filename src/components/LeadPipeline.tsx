export type PipelineStage =
  | "all"
  | "new"
  | "researching"
  | "ready"
  | "drafted"
  | "approved"
  | "sent";

export type StageCounts = Record<PipelineStage, number>;

const STAGE_META: { stage: Exclude<PipelineStage, "all">; label: string; tone: string }[] = [
  { stage: "new", label: "New", tone: "var(--primary)" },
  { stage: "researching", label: "Researching", tone: "var(--focus)" },
  { stage: "ready", label: "Ready", tone: "var(--success-ink)" },
  { stage: "drafted", label: "Drafted", tone: "var(--success-ink)" },
  { stage: "approved", label: "Approved", tone: "var(--success-ink)" },
  { stage: "sent", label: "Sent", tone: "var(--success-ink)" },
];

type LeadPipelineProps = {
  counts: StageCounts;
  active: PipelineStage | null;
  onSelect: (stage: PipelineStage) => void;
};

export function LeadPipeline({ counts, active, onSelect }: LeadPipelineProps) {
  return (
    <div className="mt-6">
      <p className="text-sm text-muted" role="status">
        <strong className="text-xl font-bold tracking-tight text-ink">{counts.all}</strong>{" "}
        {counts.all === 1 ? "Prospect" : "Prospects"}
      </p>
      <div
        className="mt-3 flex flex-wrap gap-x-7 gap-y-2 border-y border-line py-3"
        role="group"
        aria-label="Filter leads by pipeline stage"
      >
        {STAGE_META.map((item) => {
          const isActive = active === item.stage;
          return (
            <button
              key={item.stage}
              type="button"
              onClick={() => onSelect(item.stage)}
              aria-pressed={isActive}
              className={`inline-flex min-h-11 items-center gap-2 rounded-lg text-sm transition-colors duration-150 ${
                isActive ? "font-bold text-ink" : "font-medium text-muted hover:text-ink"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 flex-none rounded-full"
                style={{ backgroundColor: isActive ? "var(--primary)" : item.tone }}
              />
              {item.label}
              <span className={isActive ? "font-bold" : "font-semibold"}>{counts[item.stage]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
