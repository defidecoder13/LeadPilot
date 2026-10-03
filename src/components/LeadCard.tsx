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

function ResearchBadge({ value }: { value: string }) {
  const normalized = value.trim().toUpperCase();
  if (normalized === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
        Researching
      </span>
    );
  }
  if (normalized === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Researched
      </span>
    );
  }
  if (normalized === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2 py-0.5 text-[11px] font-medium text-muted">
      Not started
    </span>
  );
}

function ContactBadge({ value }: { value: string }) {
  const normalized = value.trim().toUpperCase();
  if (normalized === "FOUND") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        Email found
      </span>
    );
  }
  if (normalized === "NOT_FOUND") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2 py-0.5 text-[11px] font-medium text-muted">
        No email
      </span>
    );
  }
  if (normalized === "INVALID") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
        Invalid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2 py-0.5 text-[11px] font-medium text-muted">
      Unchecked
    </span>
  );
}

function OutreachBadge({ value }: { value: string }) {
  const normalized = value.trim().toUpperCase();
  if (normalized === "SENT") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Sent
      </span>
    );
  }
  if (normalized === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
        Approved
      </span>
    );
  }
  if (normalized === "DRAFTED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-800">
        <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
        Drafted
      </span>
    );
  }
  if (normalized === "FAILED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-canvas px-2 py-0.5 text-[11px] font-medium text-muted">
      No draft
    </span>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false" className="mt-0.5 flex-none text-muted">
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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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

  const initial = lead.business_name.trim().charAt(0).toUpperCase() || "B";

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
    <article className="group relative flex h-full cursor-pointer flex-col rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-xs hover:border-line-strong hover:shadow-md transition-all duration-200">
      <Link
        href={`/leads/${lead.id}`}
        aria-label={`Open ${lead.business_name}`}
        className="absolute inset-0 rounded-2xl"
      />

      {/* Top row: Checkbox, Avatar, Name, Status */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(lead.id)}
          aria-label={`Select ${lead.business_name}`}
          style={{ accentColor: "var(--primary)" }}
          className="relative z-10 mt-1 h-5 w-5 shrink-0 cursor-pointer rounded"
        />

        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-line bg-canvas text-base font-extrabold text-ink transition-colors group-hover:border-primary/30 group-hover:text-primary">
          {initial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="min-w-0 flex-1 truncate text-base font-bold tracking-tight text-ink group-hover:text-primary transition-colors">
              {lead.business_name}
            </h2>
            {lead.lead_status === "NEW" ? (
              <span className="inline-flex flex-none items-center gap-1.5 rounded-full border border-[var(--primary-deep)]/20 bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                New
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
              </span>
            ) : null}
          </div>
          {lead.category.trim() ? (
            <p className="mt-0.5 truncate text-xs font-medium text-muted">
              {lead.category}
            </p>
          ) : null}
        </div>
      </div>

      {/* Locality & Ratings */}
      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
        {locality ? (
          <p className="flex items-center gap-1.5 truncate max-w-full">
            <PinIcon />
            <span className="truncate">{locality}</span>
          </p>
        ) : null}

        <div className="flex items-center gap-1">
          <StarIcon />
          <span className="font-bold text-ink">
            {lead.rating === null ? (
              <span className="text-muted font-normal">No rating</span>
            ) : (
              <>
                {lead.rating.toFixed(1)}
                <span className="ml-1 font-normal text-muted">
                  ({lead.review_count.toLocaleString("en-US")})
                </span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Pipeline Status Chips */}
      <div className="my-4 flex flex-wrap items-center gap-2 border-t border-line/80 pt-3.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted/80">Research:</span>
          <ResearchBadge value={lead.research_status} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted/80">Contact:</span>
          <ContactBadge value={lead.contact_email_status || "—"} />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted/80">Outreach:</span>
          <OutreachBadge value={lead.email_status} />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line/80 pt-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {website ? (
            <a
              href={toExternalUrl(website)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex items-center gap-1 truncate text-xs font-semibold text-primary hover:underline"
            >
              <span>{domainOf(website)}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          ) : null}
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex items-center text-xs font-medium text-muted hover:text-ink hover:underline"
            >
              Maps ↗
            </a>
          ) : null}
        </div>

        {primaryAction === "Sent" ? (
          <span
            aria-disabled="true"
            className="inline-flex h-9 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-bold text-emerald-800"
          >
            Sent ✓
          </span>
        ) : primaryAction === "Research Company" ? (
          <button
            type="button"
            onClick={handleResearch}
            disabled={researching}
            className="btn-secondary relative z-10 h-9 px-3.5 text-xs font-bold"
          >
            {researching ? "Researching…" : "Research Company →"}
          </button>
        ) : (
          <Link
            href={`/leads/${lead.id}`}
            className="btn-secondary relative z-10 h-9 px-3.5 text-xs font-bold"
          >
            {primaryAction} →
          </Link>
        )}
      </div>

      {actionError ? (
        <p role="alert" className="mt-2 text-xs font-semibold text-danger">
          {actionError}
        </p>
      ) : null}
    </article>
  );
}
