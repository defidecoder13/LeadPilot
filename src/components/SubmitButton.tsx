import type { WorkflowStatusState } from "@/components/WorkflowStatus";

type SubmitButtonProps = {
  status: WorkflowStatusState;
};

const BUTTON_LABELS: Record<WorkflowStatusState, string> = {
  idle: "Find Leads",
  submitting: "Finding Leads...",
  success: "Search Started",
  error: "Try Again",
};

export function SubmitButton({ status }: SubmitButtonProps) {
  const submitting = status === "submitting";

  return (
    <button
      type="submit"
      disabled={submitting}
      aria-busy={submitting || undefined}
      className="btn-primary w-full h-12 text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
    >
      {submitting ? (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false" className="h-5 w-5 animate-spin">
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
          <path d="M18 10a8 8 0 0 0-8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
          <circle cx="9" cy="9" r="5.8" stroke="currentColor" strokeWidth="2" />
          <path d="M13.6 13.6 17.8 17.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      <span>{BUTTON_LABELS[status]}</span>
    </button>
  );
}
