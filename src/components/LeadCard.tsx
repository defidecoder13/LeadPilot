import Link from "next/link";
import { useState } from "react";
import type { Lead } from "@/lib/leadDiscovery";

function toExternalUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function domainOf(url: string): string {
  try {
    return new URL(toExternalUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url.trim();
  }
}

function formatLocality(address: string): string {
  const parts = address
    .split(",")
    .map((part) => part.replace(/[0-9]/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return parts.slice(-2).join(", ");
  }
  return address.trim();
}

function ResearchState({ value }: { value: string }) {
  const normalized = value.trim().toUpperCase();
  let glyph = "○";
  let label = "Not started";
  let tone = "var(--line-strong)";
  if (normalized === "IN_PROGRESS") {
    glyph = "◌";
    label = "Researching";
    tone = "var(--focus)";
  } else if (normalized === "COMPLETED") {
    glyph = "✓";
    label = "Completed";
    tone = "var(--success-ink)";
  } else if (normalized === "FAILED") {
    glyph = "!";
    label = "Failed";
    tone = "var(--danger)";
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
      <span aria-hidden="true" style={{ color: tone }}>
        {glyph}
      </span>
      {label}
    </span>
  );
}

function ContactState({ value }: { value: string }) {
  const normalized = value.trim().toUpperCase();
  let glyph = "○";
  let label = "Not searched";
  let tone = "var(--line-strong)";
  if (normalized === "FOUND") {
    glyph = "✓";
    label = "Found";
    tone = "var(--success-ink)";
  } else if (normalized === "NOT_FOUND") {
    label = "Not found";
  } else if (normalized === "INVALID") {
    glyph = "!";
    label = "Invalid";
    tone = "var(--danger)";
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
      <span aria-hidden="true" style={{ color: tone }}>
        {glyph}
      </span>
      {label}
    </span>
  );
}

function OutreachState({ value }: { value: string }) {
  const normalized = value.trim().toUpperCase();
  let glyph = "○";
  let label = "Not ready";
  let tone = "var(--line-strong)";
  if (normalized === "DRAFTED") {
    glyph = "●";
    label = "Drafted";
    tone = "var(--primary)";
  } else if (normalized === "APPROVED") {
    glyph = "●";
    label = "Approved";
    tone = "var(--primary)";
  } else if (normalized === "SENT") {
    glyph = "✓";
    label = "Sent";
    tone = "var(--success-ink)";
  } else if (normalized === "FAILED") {
    glyph = "!";
    label = "Failed";
    tone = "var(--danger)";
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
      <span aria-hidden="true" style={{ color: tone }}>
        {glyph}
      </span>
      {label}
    </span>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="mt-0.5 flex-none">
      <path
        d="M8 14.5S3.5 9.6 3.5 6.3a4.5 4.5 0 0 1 9 0c0 3.3-4.5 8.2-4.5 8.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="8" cy="6.3" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="mt-0.5 flex-none">
      <path
        d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type LeadCardProps = {
  lead: Lead;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onResearch: (lead: Lead) => Promise<void>;
  researching: boolean;
};

export function LeadCard({ lead, selected, onToggleSelect, onResearch, researching }: LeadCardProps) {
  const website = lead.website.trim();
  const mapsUrl = lead.google_maps_url.trim();
  const address = lead.address.trim();
  const locality = address ? formatLocality(address) : "";
  const [actionError, setActionError] = useState<string | null>(null);

  let primaryAction = "Research Company";
  if (lead.email_status === "SENT") {
    primaryAction = "Sent";
  } else if (lead.email_status === "APPROVED") {
    primaryAction = "Send Email";
  } else if (lead.email_status === "DRAFTED") {
    primaryAction = "Review Email";
  } else if (
    lead.research_status === "COMPLETED" &&
    lead.contact_email_status !== "FOUND" &&
    (lead.email_status === "NOT_STARTED" || lead.email_status === "NOT_READY")
  ) {
    primaryAction = "Find Contact";
  } else if (
    lead.research_status === "COMPLETED" &&
    (lead.email_status === "NOT_STARTED" || lead.email_status === "NOT_READY")
  ) {
    primaryAction = "Draft Email";
  }

  async function handleResearch() {
    setActionError(null);
    try {
      await onResearch(lead);
    } catch {
      setActionError("Couldn't start research. Please try again.");
    }
  }

  return (
    <article className="relative flex h-full cursor-pointer flex-col rounded-2xl border border-line bg-surface p-5 transition-colors duration-150 hover:border-line-strong sm:p-6">
      <Link
        href={`/leads/${lead.id}`}
        aria-label={`Open ${lead.business_name}`}
        className="absolute inset-0 rounded-2xl"
      />
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(lead.id)}
          aria-label={`Select ${lead.business_name}`}
          style={{ accentColor: "var(--primary)" }}
          className="relative z-10 mt-1 h-5 w-5 shrink-0 cursor-pointer"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">
              {lead.business_name}
            </h2>
            {lead.lead_status === "NEW" ? (
              <span className="inline-flex flex-none items-center gap-1.5 text-xs font-semibold text-muted">
                New
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
              </span>
            ) : null}
          </div>
          {lead.category.trim() ? (
            <p className="mt-0.5 truncate text-sm text-muted">{lead.category}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted">
        {locality ? (
          <p className="flex items-start gap-2">
            <PinIcon />
            <span className="truncate">{locality}</span>
          </p>
        ) : null}
        <p className="flex items-start gap-2">
          <span className="text-muted">
            <StarIcon />
          </span>
          <span className="text-ink">
            {lead.rating === null ? (
              "No rating yet"
            ) : (
              <>
                <strong className="font-semibold">{lead.rating.toFixed(1)}</strong>
                {" · "}
                {lead.review_count.toLocaleString("en-US")} reviews
              </>
            )}
          </span>
        </p>
      </div>

      <div className="mb-4 mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Research
        </span>
        <ResearchState value={lead.research_status} />
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Contact
        </span>
        <ContactState value={lead.contact_email_status || "—"} />
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Outreach
        </span>
        <OutreachState value={lead.email_status} />
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-line pt-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
          {website ? (
            <a
              href={toExternalUrl(website)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex min-h-11 max-w-full items-center truncate text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              {domainOf(website)}
            </a>
          ) : null}
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex min-h-11 items-center text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Maps ↗
            </a>
          ) : null}
        </div>
        {primaryAction === "Sent" ? (
          <span
            aria-disabled="true"
            className="inline-flex min-h-11 cursor-default items-center rounded-xl border border-line px-4 text-sm font-bold text-muted"
          >
            Sent
          </span>
        ) : primaryAction === "Research Company" ? (
          <button
            type="button"
            onClick={handleResearch}
            disabled={researching}
            className="btn-secondary relative z-10"
          >
            {researching ? "Researching…" : "Research Company →"}
          </button>
        ) : (
          <Link
            href={`/leads/${lead.id}`}
            className="btn-secondary relative z-10"
          >
            {primaryAction} →
          </Link>
        )}
      </div>
      {actionError ? (
        <p role="alert" className="mt-3 text-sm font-medium leading-snug text-danger">
          {actionError}
        </p>
      ) : null}
    </article>
  );
}
