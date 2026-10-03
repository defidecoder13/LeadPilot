import { useState } from "react";
import Link from "next/link";
import type { Lead } from "@/lib/leadDiscovery";
import type { DraftEmailInput } from "@/lib/leadPilot";

type Tone = "ok" | "active" | "progress" | "idle" | "bad";

function toneColor(tone: Tone): string {
  if (tone === "ok") {
    return "var(--success-ink)";
  }
  if (tone === "active") {
    return "var(--primary)";
  }
  if (tone === "progress") {
    return "var(--focus)";
  }
  if (tone === "bad") {
    return "var(--danger)";
  }
  return "var(--line-strong)";
}

function toneText(tone: Tone): string {
  if (tone === "ok") {
    return "text-[var(--success-ink)]";
  }
  if (tone === "active") {
    return "text-primary";
  }
  if (tone === "progress") {
    return "text-[var(--focus)]";
  }
  if (tone === "bad") {
    return "text-danger";
  }
  return "text-muted";
}

export type StageState = { label: string; glyph: string; tone: Tone };

export function researchStage(lead: Lead): StageState {
  const value = lead.research_status.trim().toUpperCase();
  if (value === "COMPLETED") {
    return { label: "Completed", glyph: "✓", tone: "ok" };
  }
  if (value === "IN_PROGRESS") {
    return { label: "Researching", glyph: "◌", tone: "progress" };
  }
  if (value === "FAILED") {
    return { label: "Failed", glyph: "!", tone: "bad" };
  }
  if (value === "PENDING") {
    return { label: "Pending", glyph: "○", tone: "idle" };
  }
  return { label: "Not started", glyph: "○", tone: "idle" };
}

export function contactStage(lead: Lead): StageState {
  const value = lead.contact_email_status.trim().toUpperCase();
  if (value === "FOUND") {
    return { label: "Found", glyph: "✓", tone: "ok" };
  }
  if (value === "NOT_FOUND") {
    return { label: "Not found", glyph: "!", tone: "bad" };
  }
  if (value === "INVALID") {
    return { label: "Needs attention", glyph: "!", tone: "bad" };
  }
  return { label: "Pending", glyph: "○", tone: "idle" };
}

export function outreachStage(lead: Lead): StageState {
  const value = lead.email_status.trim().toUpperCase();
  if (value === "DRAFTED") {
    return { label: "Drafted", glyph: "●", tone: "active" };
  }
  if (value === "APPROVED") {
    return { label: "Approved", glyph: "●", tone: "active" };
  }
  if (value === "SENT") {
    return { label: "Sent", glyph: "✓", tone: "ok" };
  }
  if (value === "FAILED") {
    return { label: "Failed", glyph: "!", tone: "bad" };
  }
  return { label: "Not ready", glyph: "○", tone: "idle" };
}

export function approvalStage(lead: Lead): StageState {
  const value = lead.email_status.trim().toUpperCase();
  if (value === "APPROVED" || value === "SENT") {
    return { label: "Approved", glyph: "✓", tone: "ok" };
  }
  if (value === "DRAFTED") {
    return { label: "Pending", glyph: "○", tone: "idle" };
  }
  return { label: "Pending", glyph: "○", tone: "idle" };
}

export function sendStage(lead: Lead): StageState {
  if (lead.email_status.trim().toUpperCase() === "SENT") {
    return { label: "Sent", glyph: "✓", tone: "ok" };
  }
  return { label: "Not sent", glyph: "○", tone: "idle" };
}

function domainOf(url: string): string {
  const trimmed = url.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProtocol).hostname.replace(/^www\./, "");
  } catch {
    return trimmed;
  }
}

function localityOf(address: string): string {
  const parts = address
    .split(",")
    .map((part) => part.replace(/[0-9]/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return parts.slice(-2).join(", ");
  }
  return address.trim();
}

export function WorkspacePipeline({ lead }: { lead: Lead }) {
  const stages: {
    num: number;
    name: string;
    state: StageState;
  }[] = [
    { num: 1, name: "Research", state: researchStage(lead) },
    { num: 2, name: "Contact", state: contactStage(lead) },
    { num: 3, name: "Outreach", state: outreachStage(lead) },
    { num: 4, name: "Approval", state: approvalStage(lead) },
    { num: 5, name: "Send", state: sendStage(lead) },
  ];

  return (
    <div className="flex items-center justify-between gap-1 overflow-x-auto rounded-xl border border-line bg-surface px-4 py-2.5 shadow-xs">
      {stages.map((stage, index) => {
        const isOk = stage.state.tone === "ok";
        const isActive = stage.state.tone === "active" || stage.state.tone === "progress";

        return (
          <div key={stage.name} className="flex items-center gap-1.5 shrink-0">
            {index > 0 && (
              <span className="text-muted/30 font-light mx-2">›</span>
            )}
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                isOk
                  ? "bg-emerald-600 text-white"
                  : isActive
                    ? "bg-primary text-white"
                    : "bg-canvas border border-line text-muted"
              }`}
            >
              {isOk ? "✓" : stage.num}
            </span>
            <span className={`text-xs ${isActive ? "font-bold text-ink" : isOk ? "font-medium text-ink" : "text-muted"}`}>
              {stage.name}
            </span>
            <span className={`text-[10px] ${isOk ? "text-emerald-700 font-semibold" : isActive ? "text-primary font-bold" : "text-muted"}`}>
              ({stage.state.label})
            </span>
          </div>
        );
      })}
    </div>
  );
}

export type NextActionProps = {
  lead: Lead;
  canResearch: boolean;
  researchRunning: boolean;
  canFindContact: boolean;
  contactFound: boolean;
  canDraft: boolean;
  showDraftForm: boolean;
  emailDrafted: boolean;
  emailApproved: boolean;
  emailSent: boolean;
  busy: boolean;
  busyAction: string | null;
  onResearch: () => void;
  onFindContact: () => void;
  onGenerate: () => void;
  onSendClick: () => void;
  variant: "header" | "sidebar";
};

export function NextAction(props: NextActionProps) {
  const { lead, variant } = props;
  if (variant === "sidebar") {
    return null;
  }

  const researchDone = lead.research_status === "COMPLETED";

  let control: React.ReactNode = null;

  if (props.emailSent) {
    control = (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800">
        <span aria-hidden="true">✓</span> Email sent
      </span>
    );
  } else if (props.emailApproved) {
    control = (
      <button
        type="button"
        onClick={props.onSendClick}
        disabled={props.busy}
        className="btn-primary h-10 px-5 text-xs font-bold shadow-sm whitespace-nowrap bg-emerald-600 hover:bg-emerald-700"
      >
        Send Email →
      </button>
    );
  } else if (props.emailDrafted) {
    control = (
      <Link
        href="#outreach"
        className="btn-primary h-10 px-5 text-xs font-bold shadow-sm whitespace-nowrap"
      >
        Review Draft →
      </Link>
    );
  } else if (props.showDraftForm && props.canDraft) {
    control = (
      <span className="text-xs font-semibold text-muted">Drafting below…</span>
    );
  } else if (props.canDraft) {
    control = (
      <button
        type="button"
        onClick={props.onGenerate}
        disabled={props.busy}
        className="btn-primary h-10 px-5 text-xs font-bold shadow-sm whitespace-nowrap"
      >
        Generate Email →
      </button>
    );
  } else if (props.canFindContact) {
    control = (
      <button
        type="button"
        onClick={props.onFindContact}
        disabled={props.busy}
        className="btn-primary h-10 px-5 text-xs font-bold shadow-sm whitespace-nowrap"
      >
        {props.busyAction === "contact" ? "Finding contact…" : "Find Contact →"}
      </button>
    );
  } else if (props.researchRunning) {
    control = (
      <div className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-primary/20 bg-primary/5 text-xs font-bold text-primary">
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Researching…
      </div>
    );
  } else if (props.canResearch) {
    control = (
      <button
        type="button"
        onClick={props.onResearch}
        disabled={props.busy}
        className="btn-primary h-10 px-5 text-xs font-bold shadow-sm whitespace-nowrap"
      >
        {props.busyAction === "research" ? "Researching…" : "Research Company →"}
      </button>
    );
  } else if (researchDone) {
    control = (
      <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800">
        <span aria-hidden="true">✓</span> Research completed
      </span>
    );
  } else {
    control = (
      <span className="text-xs font-semibold text-muted">All caught up</span>
    );
  }

  return <div className="flex items-center gap-3">{control}</div>;
}

export function StatusPanel({ lead }: { lead: Lead }) {
  const rDone = lead.research_status.trim().toUpperCase() === "COMPLETED";
  const cDone = lead.contact_email_status.trim().toUpperCase() === "FOUND";
  const emailStatus = lead.email_status.trim().toUpperCase();
  const dDone = emailStatus === "DRAFTED" || emailStatus === "APPROVED" || emailStatus === "SENT";
  const aDone = emailStatus === "APPROVED" || emailStatus === "SENT";
  const sDone = emailStatus === "SENT";

  const completedCount = [rDone, cDone, dDone, aDone, sDone].filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 5) * 100);

  const checklist = [
    { label: "AI Company Research", done: rDone },
    { label: "Contact Email Discovered", done: cDone },
    { label: "Outreach Draft Created", done: dDone },
    { label: "Email Approved", done: aDone },
    { label: "Outreach Sent", done: sDone },
  ];

  return (
    <section aria-labelledby="lead-status-heading" className="rounded-2xl border border-line bg-surface p-5 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <h2
          id="lead-status-heading"
          className="text-xs font-bold uppercase tracking-[0.14em] text-muted"
        >
          Pipeline Progress
        </h2>
        <span className="text-xs font-extrabold text-primary">{progressPercent}%</span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-canvas border border-line overflow-hidden mb-4">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <ul className="flex flex-col gap-2.5 text-xs">
        {checklist.map((item) => (
          <li key={item.label} className="flex items-center justify-between">
            <span className={item.done ? "text-ink font-semibold" : "text-muted"}>
              {item.label}
            </span>
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                item.done
                  ? "bg-emerald-600 text-white"
                  : "bg-canvas border border-line text-muted"
              }`}
            >
              {item.done ? "✓" : "○"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SidebarMeta({ lead }: { lead: Lead }) {
  const locality = lead.address.trim() ? localityOf(lead.address) : "";
  const [copiedPhone, setCopiedPhone] = useState(false);

  function copyPhone() {
    if (!lead.phone.trim()) return;
    navigator.clipboard.writeText(lead.phone.trim());
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  }

  return (
    <section aria-labelledby="lead-meta-heading" className="rounded-2xl border border-line bg-surface p-5 shadow-xs">
      <h2
        id="lead-meta-heading"
        className="text-xs font-bold uppercase tracking-[0.14em] text-muted mb-3.5"
      >
        Company Overview
      </h2>
      <dl className="flex flex-col gap-3 text-xs">
        {lead.phone.trim() ? (
          <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-2.5">
            <dt className="text-muted flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Phone
            </dt>
            <dd className="font-semibold text-ink flex items-center gap-1.5">
              <a href={`tel:${lead.phone.trim()}`} className="hover:text-primary transition-colors">
                {lead.phone.trim()}
              </a>
              <button
                type="button"
                onClick={copyPhone}
                className="text-muted hover:text-ink p-0.5 text-xs"
                title="Copy phone"
              >
                {copiedPhone ? "✓" : "📋"}
              </button>
            </dd>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-2.5">
          <dt className="text-muted flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Google Rating
          </dt>
          <dd className="font-semibold text-ink">
            {lead.rating === null
              ? "No rating"
              : `${lead.rating.toFixed(1)} (${lead.review_count} reviews)`}
          </dd>
        </div>

        {locality ? (
          <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-2.5">
            <dt className="text-muted flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Location
            </dt>
            <dd className="font-semibold text-ink text-right truncate max-w-[160px]">{locality}</dd>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Status</dt>
          <dd className="font-bold text-ink">
            <span className="inline-flex items-center gap-1 rounded-full bg-canvas border border-line px-2.5 py-0.5 text-[11px]">
              {lead.lead_status || "NEW"}
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}

export type IntelligenceData = {
  summary: string;
  services: string[];
  audience: string;
  differentiators: string[];
  outreachInsights: string;
  opportunities: string[];
};

function IntelBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{title}</h3>
      {children}
    </div>
  );
}

export function Intelligence({ data }: { data: IntelligenceData }) {
  return (
    <div className="flex flex-col gap-6">
      {data.summary ? (
        <IntelBlock title="Summary">
          <p className="max-w-3xl text-[15px] leading-relaxed">{data.summary}</p>
        </IntelBlock>
      ) : null}
      {data.services.length > 0 ? (
        <IntelBlock title="Services & Products">
          <ul className="flex max-w-3xl flex-col gap-1.5 text-[15px] leading-relaxed">
            {data.services.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-[9px] h-1 w-1 flex-none rounded-full bg-[var(--primary)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </IntelBlock>
      ) : null}
      {data.audience ? (
        <IntelBlock title="Target Audience">
          <p className="max-w-3xl text-[15px] leading-relaxed">{data.audience}</p>
        </IntelBlock>
      ) : null}
      {data.differentiators.length > 0 ? (
        <IntelBlock title="Differentiators">
          <ul className="flex max-w-3xl flex-col gap-1.5 text-[15px] leading-relaxed">
            {data.differentiators.map((item) => (
              <li key={item} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-[9px] h-1 w-1 flex-none rounded-full bg-[var(--primary)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </IntelBlock>
      ) : null}
      {data.outreachInsights || data.opportunities.length > 0 ? (
        <IntelBlock title="Outreach Opportunities">
          <div className="flex max-w-3xl flex-col gap-3 text-[15px] leading-relaxed">
            {data.outreachInsights ? <p>{data.outreachInsights}</p> : null}
            {data.opportunities.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {data.opportunities.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-[9px] h-1 w-1 flex-none rounded-full bg-[var(--primary)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </IntelBlock>
      ) : null}
    </div>
  );
}

export function Evidence({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) {
    return null;
  }
  const panelId = "evidence-panel";
  return (
    <div className="border-t border-line pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Evidence</h3>
        <p className="text-sm text-muted">
          {items.length} {items.length === 1 ? "source" : "sources"} found
        </p>
      </div>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-controls={panelId}
        className="btn-secondary mt-3"
      >
        {open ? "Hide sources" : "View sources →"}
      </button>
      {open ? (
        <ul id={panelId} className="mt-4 flex flex-col gap-2.5 text-sm leading-relaxed text-muted">
          {items.map((item) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-[9px] h-1 w-1 flex-none rounded-full bg-[var(--line-strong)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export type ContactPanelProps = {
  lead: Lead;
  researchDone: boolean;
  canFindContact: boolean;
  contactFound: boolean;
  busy: boolean;
  busyAction: string | null;
  onFindContact: () => void;
};

export function ContactPanel(props: ContactPanelProps) {
  const { lead } = props;
  const [copied, setCopied] = useState(false);
  const email = lead.contact_email?.trim() ?? "";
  const name = lead.contact_name?.trim() ?? "";
  const source = lead.contact_email_source?.trim() ?? "";
  const invalid = lead.contact_email_status.trim().toUpperCase() === "INVALID";
  const notFound = lead.contact_email_status.trim().toUpperCase() === "NOT_FOUND";

  async function handleCopy() {
    if (!email) {
      return;
    }
    let done = false;
    try {
      await navigator.clipboard.writeText(email);
      done = true;
    } catch {
      done = false;
    }
    if (!done) {
      try {
        const area = document.createElement("textarea");
        area.value = email;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        done = document.execCommand("copy");
        document.body.removeChild(area);
      } catch {
        done = false;
      }
    }
    setCopied(done);
    if (done) {
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {props.contactFound && email ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-lg shadow-xs">
                @
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-ink">{name || "Verified Business Contact"}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    ✓ Verified Email
                  </span>
                </div>
                <p className="mt-0.5 break-all text-sm font-bold text-primary">{email}</p>
                {source ? (
                  <p className="mt-0.5 text-xs text-muted">Discovered via {source}</p>
                ) : (
                  <p className="mt-0.5 text-xs text-muted">Public business contact on file</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="btn-secondary h-9 px-4 text-xs font-bold"
            >
              {copied ? "Copied ✓" : "Copy Email"}
            </button>
          </div>
        </div>
      ) : null}

      {!props.contactFound && props.researchDone && invalid ? (
        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 text-sm text-red-800">
          <p className="font-bold">Contact information needs attention</p>
          <p className="mt-1 text-xs text-red-700">The discovered contact email could not be verified automatically.</p>
        </div>
      ) : null}

      {!props.contactFound && props.researchDone && !props.canFindContact && !invalid ? (
        <div className="rounded-2xl border border-line bg-canvas/40 p-5 text-sm text-muted">
          <p className="font-semibold text-ink">
            {notFound
              ? "No publicly listed business contact email found"
              : "Contact discovery is currently not available for this lead."}
          </p>
          <p className="mt-1 text-xs text-muted">
            You can still generate personalized outreach using the company research below.
          </p>
        </div>
      ) : null}

      {!props.researchDone ? (
        <div className="rounded-2xl border border-line bg-canvas/30 p-4 flex items-center gap-3 text-xs text-muted">
          <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg border border-line bg-surface text-muted">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <span>Contact discovery unlocks after AI company research completes.</span>
        </div>
      ) : null}

      {props.canFindContact ? (
        <div className="rounded-2xl border border-line bg-canvas/30 p-5 flex items-center gap-3.5">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-ink">Decision-Maker Contact Discovery Ready</p>
            <p className="mt-0.5 text-xs text-muted">Click <strong>Find Contact</strong> in the header above to search verified email directories.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function OutreachEmpty({ onGenerate, busy }: { onGenerate: () => void; busy: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-canvas/30 p-5 flex items-center gap-3.5">
      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
          <path d="M2 2l7.586 7.586" />
          <circle cx="11" cy="11" r="2" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold text-ink">Personalized Outreach Ready</p>
        <p className="mt-0.5 text-xs text-muted">Click <strong>Generate Email</strong> in the header above to craft a tailored message from research insights.</p>
      </div>
    </div>
  );
}

export type DraftField = {
  key: keyof Omit<DraftEmailInput, "lead_id">;
  label: string;
  required: boolean;
};

export type DraftFormProps = {
  fields: DraftField[];
  values: Record<DraftField["key"], string>;
  onChange: (key: DraftField["key"], value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  busy: boolean;
  busyAction: string | null;
};

export function DraftForm(props: DraftFormProps) {
  const offer = props.fields.filter((field) => field.key === "offer" || field.key === "cta");
  const sender = props.fields.filter((field) => field.key !== "offer" && field.key !== "cta");
  function renderField(field: DraftField) {
    const id = `draft-${field.key}`;
    return (
      <div key={field.key} className="flex min-w-0 flex-1 flex-col gap-2">
        <label
          htmlFor={id}
          className="text-xs font-semibold uppercase tracking-[0.14em] text-muted"
        >
          {field.label}
          {field.required ? <span className="sr-only"> (required)</span> : null}
        </label>
        <input
          id={id}
          name={field.key}
          type="text"
          value={props.values[field.key]}
          required={field.required}
          autoComplete="off"
          disabled={props.busy}
          onChange={(event) => props.onChange(field.key, event.target.value)}
          className="input-control"
        />
      </div>
    );
  }
  return (
    <form onSubmit={props.onSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Generate Personalized Outreach
        </h3>
        <p className="text-sm text-muted">What are you offering?</p>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">{offer.map(renderField)}</div>
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Sender</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{sender.map(renderField)}</div>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={props.busy} className="btn-primary h-10 px-6 text-xs font-bold shadow-sm">
          {props.busyAction === "draft" ? "Generating personalized email…" : "Generate Email →"}
        </button>
        <button
          type="button"
          onClick={props.onCancel}
          disabled={props.busy}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export type ComposerProps = {
  lead: Lead;
  emailDrafted: boolean;
  emailApproved: boolean;
  editingApproved: boolean;
  emailSent: boolean;
  editSubject: string;
  editBody: string;
  emailDirty: boolean;
  saveLabel: string;
  saveState: string;
  busy: boolean;
  busyAction: string | null;
  personalizationCount: number;
  onEditSubject: (value: string) => void;
  onEditBody: (value: string) => void;
  onSave: () => void;
  onDiscard: () => void;
  onApprove: () => void;
  onEditApproved: () => void;
  onSendClick: () => void;
};

export function EmailComposer(props: ComposerProps) {
  const statusChip = props.emailSent
    ? { label: "Sent", className: "text-[var(--success-ink)]" }
    : props.emailApproved
      ? { label: "Approved", className: "text-primary" }
      : { label: "Draft", className: "text-primary" };
  const editable = props.emailDrafted || (props.emailApproved && props.editingApproved);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-field/60 px-5 py-3 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Outreach</p>
        <p className={`text-xs font-bold uppercase tracking-[0.14em] ${statusChip.className}`}>
          {statusChip.label}
        </p>
      </div>
      <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6">
        {editable ? (
          <>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email-subject"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-muted"
              >
                Subject
              </label>
              <input
                id="email-subject"
                name="email-subject"
                type="text"
                value={props.editSubject}
                autoComplete="off"
                disabled={props.busy}
                onChange={(event) => props.onEditSubject(event.target.value)}
                className="w-full border-0 border-b border-line bg-transparent pb-3 text-[15px] font-semibold outline-none placeholder:text-muted focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email-body"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-muted"
              >
                Message
              </label>
              <textarea
                id="email-body"
                name="email-body"
                rows={12}
                value={props.editBody}
                disabled={props.busy}
                onChange={(event) => props.onEditBody(event.target.value)}
                className="min-h-64 w-full resize-y rounded-xl border border-line bg-field px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-muted focus:border-primary"
              />
            </div>
            {props.personalizationCount > 0 ? (
              <p className="text-sm text-muted">
                <span className="font-semibold text-ink">AI personalization</span> ·{" "}
                {props.personalizationCount}{" "}
                {props.personalizationCount === 1 ? "insight" : "insights"} used from company
                research
              </p>
            ) : null}
            {props.emailApproved && props.editingApproved ? (
              <p className="text-sm text-muted">
                Saving modifications will move this email back to Drafted and require approval
                again.
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
              <button
                type="button"
                onClick={props.onSave}
                disabled={props.busy || props.saveState === "saving" || !props.emailDirty}
                className="btn-primary h-10 px-5 text-xs font-bold shadow-sm"
              >
                {props.saveLabel}
              </button>
              <button
                type="button"
                onClick={props.onDiscard}
                disabled={props.busy || props.saveState === "saving" || !props.emailDirty}
                className="btn-secondary"
              >
                Discard
              </button>
              {props.emailDirty ? (
                <p className="text-sm font-semibold text-ink" role="status">
                  Unsaved changes
                </p>
              ) : null}
            </div>
          </>
        ) : null}
        {props.emailApproved && !props.editingApproved && props.lead.email_subject ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Subject</p>
            <p className="text-[15px] font-semibold">{props.lead.email_subject}</p>
          </div>
        ) : null}
        {props.emailApproved && !props.editingApproved && props.lead.email_body ? (
          <div className="flex flex-col gap-2 border-t border-line pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Message</p>
            <p className="whitespace-pre-line text-[15px] leading-relaxed">{props.lead.email_body}</p>
          </div>
        ) : null}
        {props.emailSent && props.lead.email_subject ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Subject</p>
            <p className="text-[15px] font-semibold">{props.lead.email_subject}</p>
          </div>
        ) : null}
        {props.emailSent && props.lead.email_body ? (
          <div className="flex flex-col gap-2 border-t border-line pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Message</p>
            <p className="whitespace-pre-line text-[15px] leading-relaxed">{props.lead.email_body}</p>
          </div>
        ) : null}
        {props.emailDrafted ? (
          <div className="flex flex-col gap-3 border-t border-line pt-5">
            <p className="text-sm text-muted">Awaiting approval. Nothing has been sent.</p>
            {props.emailDirty ? (
              <p className="text-sm font-medium text-ink">Save your changes before approving.</p>
            ) : null}
            <div>
              <button
                type="button"
                onClick={props.onApprove}
                disabled={props.busy || props.emailDirty}
                className="btn-primary h-10 px-5 text-xs font-bold shadow-sm"
              >
                {props.busyAction === "approve" ? "Approving email…" : "Approve Email"}
              </button>
            </div>
          </div>
        ) : null}
        {props.emailApproved && !props.editingApproved ? (
          <div className="flex flex-col gap-3 border-t border-line pt-5">
            <div className="flex items-center justify-between">
              <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--success-ink)]">
                <span aria-hidden="true">✓</span> Approved and ready to send
              </p>
              <button
                type="button"
                onClick={props.onEditApproved}
                disabled={props.busy}
                className="btn-secondary h-8 px-3 text-xs font-bold"
              >
                Edit Email
              </button>
            </div>
            <p className="text-xs text-muted">
              Click <strong>Send Email</strong> in the header above to dispatch this message to <span className="font-semibold text-ink">{props.lead.contact_email ?? "the contact"}</span>.
            </p>
          </div>
        ) : null}
        {props.emailSent ? (
          <div className="flex flex-col gap-2 border-t border-line pt-5">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--success-ink)]" role="status">
              <span aria-hidden="true">✓</span> Email sent
            </p>
            <p className="text-sm text-muted">Sent to: {props.lead.contact_email ?? "—"}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ResearchPending({
  state,
}: {
  state: "NOT_STARTED" | "PENDING" | "FAILED";
  busy?: boolean;
  busyAction?: string | null;
  onResearch?: () => void;
}) {
  const isFailed = state === "FAILED";

  return (
    <div className="rounded-2xl border border-line bg-canvas/30 p-6 shadow-xs">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-ink">
            {isFailed ? "Research Incomplete" : "Launch AI Company Research"}
          </h3>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
            {isFailed
              ? "The previous research attempt didn't complete. Click the Research Company button in the header above to retry."
              : "LeadPilot will crawl the company's online presence, discover services, target demographics, reviews, and prepare key outreach angles."}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 border-t border-line/60 pt-4 text-xs font-semibold text-muted">
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">✓</span>
          <span>Core Offerings</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">✓</span>
          <span>Target Audience</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">✓</span>
          <span>Differentiators</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">✓</span>
          <span>Outreach Hooks</span>
        </div>
      </div>
    </div>
  );
}

export function ResearchRunning() {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 flex items-start gap-4 shadow-xs" role="status">
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-blue-600 text-white">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 animate-spin"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      </div>
      <div>
        <p className="text-base font-bold text-blue-950">AI Research in Progress…</p>
        <p className="mt-1 text-xs text-blue-800 leading-relaxed">
          LeadPilot is analyzing company website pages, services, customer feedback, and value propositions. This page updates automatically.
        </p>
      </div>
    </div>
  );
}

export function WorkspaceHeader({
  lead,
  nextAction,
}: {
  lead: Lead;
  nextAction: React.ReactNode;
}) {
  const website = lead.website.trim();
  const mapsUrl = lead.google_maps_url.trim();
  const address = lead.address.trim();
  const locality = address ? localityOf(address) : "";
  const initial = lead.business_name.trim().charAt(0).toUpperCase() || "B";

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl border border-line bg-canvas text-2xl font-extrabold text-ink shadow-xs">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink truncate">
                {lead.business_name}
              </h1>
              {lead.lead_status ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--primary-deep)]/20 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                  {lead.lead_status}
                </span>
              ) : null}
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
              {lead.category.trim() ? (
                <span className="inline-flex items-center rounded-lg bg-canvas border border-line px-2.5 py-0.5 font-semibold text-ink">
                  {lead.category.trim()}
                </span>
              ) : null}

              {locality ? (
                <span className="inline-flex items-center gap-1 text-muted">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {locality}
                </span>
              ) : null}

              {lead.rating !== null ? (
                <span className="inline-flex items-center gap-1 font-bold text-ink">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {lead.rating.toFixed(1)}
                  <span className="font-normal text-muted">({lead.review_count} reviews)</span>
                </span>
              ) : null}
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-3">
              {website ? (
                <a
                  href={/^https?:\/\//i.test(website) ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-semibold text-primary hover:border-line-strong hover:underline transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  {domainOf(website)} ↗
                </a>
              ) : null}
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs font-semibold text-muted hover:border-line-strong hover:text-ink transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                    <line x1="9" y1="3" x2="9" y2="18" />
                    <line x1="15" y1="6" x2="15" y2="21" />
                  </svg>
                  Google Maps ↗
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-none sm:self-center">{nextAction}</div>
      </div>
    </div>
  );
}

export function NoticeBanner({ notice }: { notice: { tone: "ok" | "error" | "info"; text: string } }) {
  return (
    <div
      className={`rounded-2xl border p-4 text-sm font-medium transition-all ${
        notice.tone === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : notice.tone === "ok"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-blue-200 bg-blue-50 text-blue-800"
      }`}
      role={notice.tone === "error" ? "alert" : "status"}
    >
      <div className="flex items-center gap-2.5">
        <span className="font-bold">
          {notice.tone === "error" ? "✕" : notice.tone === "ok" ? "✓" : "ℹ"}
        </span>
        <p className="leading-snug">{notice.text}</p>
      </div>
    </div>
  );
}

export function WorkspaceSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title} id={id} className="flex scroll-mt-6 flex-col gap-4 rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between border-b border-line/80 pb-4">
        <div>
          <span className="inline-flex items-center rounded-full bg-canvas border border-line px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
            {eyebrow}
          </span>
          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-ink">{title}</h2>
        </div>
      </div>
      <div className="pt-2">{children}</div>
    </section>
  );
}

export function LockedSection({
  step,
  title,
  reason,
}: {
  step: string;
  title: string;
  reason: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-line/70 bg-surface/50 px-5 py-4 text-xs shadow-xs backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-xl border border-line bg-canvas text-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold uppercase tracking-wider text-muted text-[10px]">{step}</span>
            <span className="font-bold text-ink/80">{title}</span>
          </div>
          <p className="mt-0.5 text-muted">{reason}</p>
        </div>
      </div>
      <span className="rounded-lg bg-canvas border border-line px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] text-muted">
        Locked
      </span>
    </div>
  );
}
