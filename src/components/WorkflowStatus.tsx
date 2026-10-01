export type WorkflowStatusState = "idle" | "submitting" | "success" | "error";

type ActiveWorkflowStatus = Exclude<WorkflowStatusState, "idle">;

const STATUS_COPY: Record<ActiveWorkflowStatus, { title: string; message: string }> = {
  submitting: {
    title: "Sending your request",
    message: "LeadPilot is sending your search to the discovery workflow.",
  },
  success: {
    title: "✓ Lead discovery started",
    message: "Your search has been sent to the LeadPilot workflow. The discovered leads will appear in your LeadPilot dashboard.",
  },
  error: {
    title: "Unable to start lead discovery.",
    message: "Please make sure the LeadPilot workflow is running and try again.",
  },
};

function StatusIcon({ status }: { status: ActiveWorkflowStatus }) {
  if (status === "submitting") {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false" className="animate-spin">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
        <path d="M18 10a8 8 0 0 0-8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (status === "success") {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
        <path
          d="M7 10.3l2.1 2.1 3.9-4.4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M10 6.4v4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="13.7" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function WorkflowStatus({ status }: { status: WorkflowStatusState }) {
  if (status === "idle") {
    return null;
  }

  const copy = STATUS_COPY[status];

  return (
    <div data-tone={status} role={status === "error" ? "alert" : "status"} className="status-card">
      <StatusIcon status={status} />
      <div>
        <p className="text-sm font-bold leading-snug">{copy.title}</p>
        <p className="mt-1 text-sm leading-snug">{copy.message}</p>
      </div>
    </div>
  );
}
