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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin flex-none">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-none">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )}
      <span>{BUTTON_LABELS[status]}</span>
    </button>
  );
}
