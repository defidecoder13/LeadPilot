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
  const stages: { name: string; state: StageState }[] = [
    { name: "Research", state: researchStage(lead) },
    { name: "Contact", state: contactStage(lead) },
    { name: "Outreach", state: outreachStage(lead) },
    { name: "Approval", state: approvalStage(lead) },
    { name: "Send", state: sendStage(lead) },
  ];
  return (
    <ol
      aria-label="Lead pipeline"
      className="mt-6 flex flex-wrap items-stretch gap-x-2 gap-y-3 border-y border-line py-4"
    >
      {stages.map((stage, index) => (
        <li key={stage.name} className="flex min-w-0 items-stretch">
          {index > 0 ? (
            <span aria-hidden="true" className="mx-2 self-center text-xs text-muted">
              →
            </span>
          ) : null}
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              {stage.name}
            </span>
            <span className={`inline-flex items-center gap-1.5 text-sm font-bold ${toneText(stage.state.tone)}`}>
              <span aria-hidden="true" style={{ color: toneColor(stage.state.tone) }}>
                {stage.state.glyph}
              </span>
              {stage.state.label}
            </span>
          </div>
        </li>
      ))}
    </ol>
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
  const researchDone = lead.research_status === "COMPLETED";

  let control: React.ReactNode = null;
  let hint: string | null = null;

  if (props.emailSent) {
    control = (
      <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--success-ink)]">
        <span aria-hidden="true">✓</span> Email sent
      </p>
    );
  } else if (props.emailApproved) {
    control = (
      <button
        type="button"
        onClick={props.onSendClick}
        disabled={props.busy}
        className="primary-action w-full max-w-64"
      >
        Send Email →
      </button>
    );
    hint = "Approved and ready to send.";
  } else if (props.emailDrafted) {
    control = (
      <Link
        href="#outreach"
        className="primary-action w-full max-w-64"
      >
        Review Email →
      </Link>
    );
    hint = "A draft is waiting for review.";
  } else if (props.showDraftForm && props.canDraft) {
    control = (
      <p className="text-sm font-semibold text-muted">Draft in progress — complete the form below.</p>
    );
  } else if (props.canDraft) {
    control = (
      <button
        type="button"
        onClick={props.onGenerate}
        disabled={props.busy}
        className="primary-action w-full max-w-64"
      >
        Generate Email →
      </button>
    );
    hint = "Turn research into outreach.";
  } else if (props.canFindContact) {
    control = (
      <button
        type="button"
        onClick={props.onFindContact}
        disabled={props.busy}
        className="primary-action w-full max-w-64"
      >
        {props.busyAction === "contact" ? "Finding contact…" : "Find Contact →"}
      </button>
    );
    hint = "Discover a contact email.";
  } else if (props.researchRunning) {
    control = (
      <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--focus)]" role="status">
        <span aria-hidden="true">◌</span> Researching…
      </p>
    );
    hint = "This page refreshes automatically.";
  } else if (props.canResearch) {
    control = (
      <button
        type="button"
        onClick={props.onResearch}
        disabled={props.busy}
        className="primary-action w-full max-w-64"
      >
        {props.busyAction === "research" ? "Researching…" : "Research Company →"}
      </button>
    );
    hint = "Start gathering intelligence.";
  } else if (researchDone) {
    control = (
      <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--success-ink)]">
        <span aria-hidden="true">✓</span> Research completed
      </p>
    );
  } else {
    control = (
      <p className="text-sm font-semibold text-muted">You&apos;re all caught up.</p>
    );
  }

  if (variant === "header") {
    return <div className="flex flex-wrap items-center gap-3">{control}</div>;
  }
  return (
    <section aria-labelledby="next-action-heading" className="flex flex-col gap-3">
      <h2
        id="next-action-heading"
        className="text-xs font-semibold uppercase tracking-[0.14em] text-muted"
      >
        Next Action
      </h2>
      {control}
      {hint ? <p className="text-sm leading-snug text-muted">{hint}</p> : null}
    </section>
  );
}

export function StatusPanel({ lead }: { lead: Lead }) {
  const rows: { name: string; state: StageState }[] = [
    { name: "Research", state: researchStage(lead) },
    { name: "Contact", state: contactStage(lead) },
    { name: "Outreach", state: outreachStage(lead) },
    { name: "Approval", state: approvalStage(lead) },
    { name: "Send", state: sendStage(lead) },
  ];
  return (
    <section aria-labelledby="lead-status-heading" className="flex flex-col gap-3">
      <h2
        id="lead-status-heading"
        className="text-xs font-semibold uppercase tracking-[0.14em] text-muted"
      >
        Lead Status
      </h2>
      <dl className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-muted">{row.name}</dt>
            <dd className={`inline-flex items-center gap-1.5 font-bold ${toneText(row.state.tone)}`}>
              <span aria-hidden="true" style={{ color: toneColor(row.state.tone) }}>
                {row.state.glyph}
              </span>
              {row.state.label}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function SidebarMeta({ lead }: { lead: Lead }) {
  const locality = lead.address.trim() ? localityOf(lead.address) : "";
  return (
    <section aria-labelledby="lead-meta-heading" className="flex flex-col gap-3">
      <h2
        id="lead-meta-heading"
        className="text-xs font-semibold uppercase tracking-[0.14em] text-muted"
      >
        Details
      </h2>
      <dl className="flex flex-col gap-2.5 text-sm">
        {lead.phone.trim() ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Phone</dt>
            <dd className="text-right font-semibold">{lead.phone.trim()}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Rating</dt>
          <dd className="text-right font-semibold">
            {lead.rating === null
              ? "No rating yet"
              : `${lead.rating.toFixed(1)} · ${lead.review_count.toLocaleString("en-US")} reviews`}
          </dd>
        </div>
        {locality ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Area</dt>
            <dd className="text-right font-semibold">{locality}</dd>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Lead status</dt>
          <dd className="text-right font-semibold">{lead.lead_status || "—"}</dd>
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
        <div className="flex flex-col gap-1.5">
          {name ? <p className="text-xl font-bold tracking-tight">{name}</p> : null}
          <p className="break-all text-[15px] font-semibold text-primary">{email}</p>
          {source ? (
            <p className="text-sm text-muted">Found from {source}</p>
          ) : (
            <p className="text-sm text-muted">Contact email on file</p>
          )}
          <div>
            <button
              type="button"
              onClick={handleCopy}
              className="btn-secondary mt-2"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
        </div>
      ) : null}
      {!props.contactFound && props.researchDone && invalid ? (
        <p className="text-[15px] leading-relaxed">Contact information needs attention.</p>
      ) : null}
      {!props.contactFound && props.researchDone && !props.canFindContact && !invalid ? (
        <p className="text-[15px] leading-relaxed text-muted">
          {notFound
            ? "No contact email discovered yet — no publicly listed business email exists."
            : "Contact discovery is not available for this lead yet."}
        </p>
      ) : null}
      {!props.researchDone ? (
        <p className="text-[15px] leading-relaxed text-muted">
          Complete research to unlock contact discovery.
        </p>
      ) : null}
      {props.canFindContact ? (
        <div>
          <button
            type="button"
            onClick={props.onFindContact}
            disabled={props.busy}
            className="primary-action max-w-64"
          >
            {props.busyAction === "contact" ? "Finding contact…" : "Find Contact →"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function OutreachEmpty({ onGenerate, busy }: { onGenerate: () => void; busy: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-xl text-[15px] leading-relaxed text-muted">
        Turn your research into a personalized email.
      </p>
      <p className="text-sm font-semibold">LeadPilot will use:</p>
      <ul className="flex flex-col gap-1.5 text-sm">
        {["Company intelligence", "Business context", "Contact information", "Your offer"].map((item) => (
          <li key={item} className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="font-bold text-[var(--success-ink)]">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
      <div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={busy}
          className="primary-action max-w-64"
        >
          Generate Email →
        </button>
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
        <button type="submit" disabled={props.busy} className="primary-action max-w-64">
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
                className="primary-action max-w-64"
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
                className="primary-action max-w-64"
              >
                {props.busyAction === "approve" ? "Approving email…" : "Approve Email"}
              </button>
            </div>
          </div>
        ) : null}
        {props.emailApproved && !props.editingApproved ? (
          <div className="flex flex-col gap-3 border-t border-line pt-5">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--success-ink)]">
              <span aria-hidden="true">✓</span> Approved
            </p>
            <p className="text-sm text-muted">
              This email is ready to send to {props.lead.contact_email ?? "the contact"}.
            </p>
            <p className="text-sm">
              <span className="font-semibold">To:</span> {props.lead.contact_email ?? "—"}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={props.onSendClick}
                disabled={props.busy}
                className="primary-action max-w-64"
              >
                Send Email →
              </button>
              <button
                type="button"
                onClick={props.onEditApproved}
                disabled={props.busy}
                className="btn-secondary"
              >
                Edit Email
              </button>
            </div>
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
  busy,
  busyAction,
  onResearch,
}: {
  state: "NOT_STARTED" | "PENDING" | "FAILED";
  busy: boolean;
  busyAction: string | null;
  onResearch: () => void;
}) {
  const copy =
    state === "FAILED"
      ? "Research couldn't be completed."
      : state === "PENDING"
        ? "This lead is marked pending — you can start research whenever you're ready."
        : "Research hasn't started yet.";
  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-xl text-[15px] leading-relaxed text-muted">{copy}</p>
      <div>
        <button
          type="button"
          onClick={onResearch}
          disabled={busy}
          className="primary-action max-w-64"
        >
          {busyAction === "research" ? "Researching company…" : "Research Company →"}
        </button>
      </div>
    </div>
  );
}

export function ResearchRunning() {
  return (
    <div className="flex items-start gap-3" role="status">
      <svg
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        focusable="false"
        className="mt-0.5 h-5 w-5 flex-none animate-spin text-[var(--focus)]"
      >
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
        <path d="M18 10a8 8 0 0 0-8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div>
        <p className="text-[15px] font-bold">Researching company…</p>
        <p className="mt-1 text-sm text-muted">
          This page refreshes automatically when research completes.
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
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
            {lead.business_name}
          </h1>
          {lead.category.trim() ? (
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              {lead.category.trim()}
            </p>
          ) : null}
          {locality ? <p className="mt-1 text-sm text-muted">{locality}</p> : null}
        </div>
        <div className="flex flex-none flex-col items-start gap-3 sm:items-end">{nextAction}</div>
      </div>
      {website || mapsUrl ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {website ? (
            <a
              href={/^https?:\/\//i.test(website) ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              {domainOf(website)} ↗
            </a>
          ) : null}
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Google Maps ↗
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function NoticeBanner({ notice }: { notice: { tone: "ok" | "error" | "info"; text: string } }) {
  return (
    <div
      className="status-card"
      data-tone={notice.tone === "error" ? "error" : notice.tone === "ok" ? "success" : undefined}
      role={notice.tone === "error" ? "alert" : "status"}
    >
      <div>
        <p className="text-sm font-medium leading-snug">{notice.text}</p>
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
    <section aria-label={title} id={id} className="flex scroll-mt-6 flex-col gap-5">
      <div className="flex flex-col gap-1 border-b border-line pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{eyebrow}</p>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}
