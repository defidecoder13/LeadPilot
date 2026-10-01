"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ContactPanel,
  DraftForm,
  EmailComposer,
  Evidence,
  Intelligence,
  NextAction,
  NoticeBanner,
  OutreachEmpty,
  ResearchPending,
  ResearchRunning,
  SidebarMeta,
  StatusPanel,
  WorkspaceHeader,
  WorkspacePipeline,
  WorkspaceSection,
} from "@/components/LeadWorkspace";
import type { IntelligenceData } from "@/components/LeadWorkspace";
import {
  approveEmail,
  draftEmail,
  findContactEmail,
  getLead,
  sendApprovedEmail,
  triggerResearch,
  updateEmailDraft,
} from "@/lib/leadPilot";
import type { DraftEmailInput, Lead } from "@/lib/leadPilot";
import { LeadDiscoveryError } from "@/lib/leadDiscovery";

type PageStatus = "loading" | "ready" | "not-found" | "error";
type Notice = { tone: "ok" | "error" | "info"; text: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof LeadDiscoveryError) {
    if (error.code === "timeout") {
      return `${fallback} The request timed out — the workflow may still be running. Refresh to check.`;
    }
    if (error.code === "configuration") {
      return `${fallback} The workflow URL is not configured.`;
    }
    return `${fallback} Please try again.`;
  }
  return `${fallback} Please try again.`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const DRAFT_FORM_FIELDS: { key: keyof Omit<DraftEmailInput, "lead_id">; label: string; required: boolean }[] = [
  { key: "offer", label: "Offer", required: true },
  { key: "sender_name", label: "Sender name", required: true },
  { key: "sender_company", label: "Sender company", required: true },
  { key: "sender_role", label: "Sender role", required: false },
  { key: "cta", label: "Call to action", required: true },
];

export default function LeadDetailPage() {
  const params = useParams();
  const leadId = typeof params.id === "string" ? params.id : "";
  const [lead, setLead] = useState<Lead | undefined>(undefined);
  const [status, setStatus] = useState<PageStatus>(() => (leadId ? "loading" : "not-found"));
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [showDraftForm, setShowDraftForm] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [draftForm, setDraftForm] = useState({
    offer: "",
    sender_name: "",
    sender_company: "",
    sender_role: "",
    cta: "",
  });
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [savedSubject, setSavedSubject] = useState("");
  const [savedBody, setSavedBody] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [editingApproved, setEditingApproved] = useState(false);
  const mountedRef = useRef(true);
  const pollCancelRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      pollCancelRef.current = true;
    };
  }, []);

  const requestLead = useCallback(() => {
    getLead(leadId).then(
      (found) => {
        if (!mountedRef.current) {
          return;
        }
        if (!found) {
          setStatus("not-found");
          return;
        }
        setLead(found);
        setStatus("ready");
      },
      () => {
        if (!mountedRef.current) {
          return;
        }
        setStatus("error");
      },
    );
  }, [leadId]);

  useEffect(() => {
    if (leadId) {
      requestLead();
    }
  }, [leadId, requestLead]);

  function handleRetry() {
    setStatus("loading");
    requestLead();
  }

  const [lastEditorKey, setLastEditorKey] = useState<string | null>(null);

  const editorKey = lead ? `${lead.id}:${lead.email_status}:${lead.updated_at}` : null;
  if (lastEditorKey !== editorKey) {
    setLastEditorKey(editorKey);
    const nextSubject = lead?.email_subject ?? "";
    const nextBody = lead?.email_body ?? "";
    setEditSubject(nextSubject);
    setEditBody(nextBody);
    setSavedSubject(nextSubject);
    setSavedBody(nextBody);
    setSaveState("idle");
    setEditingApproved(false);
  }

  const emailDirty = editSubject !== savedSubject || editBody !== savedBody;

  useEffect(() => {
    if (!emailDirty) {
      return;
    }
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [emailDirty]);

  async function refreshLead(): Promise<Lead | undefined> {
    try {
      const found = await getLead(leadId);
      if (mountedRef.current && found) {
        setLead(found);
      }
      return found;
    } catch {
      return lead;
    }
  }

  async function pollResearchStatus(): Promise<void> {
    pollCancelRef.current = false;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await sleep(10000);
      if (pollCancelRef.current || !mountedRef.current) {
        return;
      }
      const found = await refreshLead();
      if (!found || found.research_status === "COMPLETED" || found.research_status === "FAILED") {
        return;
      }
    }
    if (mountedRef.current) {
      setNotice({
        tone: "info",
        text: "Research is taking longer than expected. It is still running — refresh this page to check its status.",
      });
    }
  }

  async function runAction(action: string, work: () => Promise<void>): Promise<void> {
    if (busyAction) {
      return;
    }
    setBusyAction(action);
    setNotice(null);
    try {
      await work();
    } finally {
      if (mountedRef.current) {
        setBusyAction(null);
      }
    }
  }

  async function handleResearch(): Promise<void> {
    await runAction("research", async () => {
      let requestFailed: unknown = null;
      try {
        const result = await triggerResearch(leadId);
        if (!result.success) {
          setNotice({
            tone: "info",
            text: result.message ?? "Research did not start. Refresh to see the current status.",
          });
          await refreshLead();
          return;
        }
        if (result.status === "ALREADY_COMPLETED") {
          setNotice({ tone: "info", text: "Research already exists for this lead." });
          await refreshLead();
          return;
        }
        if (result.status === "ALREADY_RUNNING") {
          setNotice({ tone: "info", text: "Research is already running for this lead." });
          await refreshLead();
          return;
        }
      } catch (error) {
        requestFailed = error;
      }
      const found = await refreshLead();
      if (found && found.research_status === "IN_PROGRESS") {
        setNotice({ tone: "info", text: "Researching company… Refreshing when it completes." });
        await pollResearchStatus();
        const updated = await refreshLead();
        if (updated && updated.research_status === "COMPLETED") {
          setNotice({ tone: "ok", text: "Company research completed." });
        }
      } else if (found && found.research_status === "COMPLETED") {
        setNotice({ tone: "ok", text: "Company research completed." });
      } else {
        setNotice({ tone: "error", text: errorMessage(requestFailed, "Unable to start research.") });
      }
    });
  }

  async function handleFindContact(): Promise<void> {
    await runAction("contact", async () => {
      try {
        const result = await findContactEmail(leadId);
        await refreshLead();
        if (result.success) {
          setNotice({ tone: "ok", text: result.message ?? "Contact found." });
        } else {
          setNotice({
            tone: "info",
            text: result.message ?? "No publicly listed business contact email was found.",
          });
        }
      } catch (error) {
        await refreshLead();
        setNotice({ tone: "error", text: errorMessage(error, "Unable to find the contact email.") });
      }
    });
  }

  async function handleDraft(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await runAction("draft", async () => {
      try {
        const result = await draftEmail({ lead_id: leadId, ...draftForm });
        await refreshLead();
        if (result.success) {
          setNotice({
            tone: "ok",
            text: result.message ?? "Personalized email generated. Review it below.",
          });
          setShowDraftForm(false);
        } else {
          setNotice({ tone: "error", text: result.message ?? "Unable to generate the email." });
        }
      } catch (error) {
        await refreshLead();
        setNotice({ tone: "error", text: errorMessage(error, "Unable to generate the email.") });
      }
    });
  }

  async function handleApprove(): Promise<void> {
    await runAction("approve", async () => {
      try {
        const result = await approveEmail(leadId);
        await refreshLead();
        if (result.success) {
          setNotice({ tone: "ok", text: result.message ?? "Email approved. It is ready to send." });
        } else {
          setNotice({ tone: "error", text: result.message ?? "Only drafted emails can be approved." });
        }
      } catch (error) {
        await refreshLead();
        setNotice({ tone: "error", text: errorMessage(error, "Unable to approve the email.") });
      }
    });
  }

  async function handleSaveDraft(): Promise<void> {
    if (!lead || saveState === "saving" || busy) {
      return;
    }
    if (!editSubject.trim() || !editBody.trim()) {
      setNotice({ tone: "error", text: "Subject and body must not be empty." });
      return;
    }
    setSaveState("saving");
    try {
      const result = await updateEmailDraft(lead.id, editSubject.trim(), editBody);
      if (!mountedRef.current) {
        return;
      }
      setSavedSubject(result.email_subject);
      setSavedBody(result.email_body);
      setSaveState("saved");
      setNotice({ tone: "ok", text: result.message ?? "Draft saved." });
      await refreshLead();
    } catch (error) {
      if (!mountedRef.current) {
        return;
      }
      setSaveState("error");
      setNotice({ tone: "error", text: errorMessage(error, "Couldn't save changes.") });
    }
  }

  function handleEditSubject(value: string) {
    setEditSubject(value);
    if (saveState !== "idle" && saveState !== "saving") {
      setSaveState("idle");
    }
  }

  function handleEditBody(value: string) {
    setEditBody(value);
    if (saveState !== "idle" && saveState !== "saving") {
      setSaveState("idle");
    }
  }

  function handleDiscardEdits() {
    setEditSubject(savedSubject);
    setEditBody(savedBody);
    setSaveState("idle");
    if (lead?.email_status === "APPROVED") {
      setEditingApproved(false);
    }
  }

  async function handleSend(): Promise<void> {
    await runAction("send", async () => {
      try {
        const result = await sendApprovedEmail(leadId);
        setShowSendConfirm(false);
        await refreshLead();
        if (result.success) {
          setNotice({ tone: "ok", text: result.message ?? "Email sent." });
        } else {
          setNotice({ tone: "error", text: result.message ?? "Only approved emails can be sent." });
        }
      } catch (error) {
        setShowSendConfirm(false);
        await refreshLead();
        setNotice({ tone: "error", text: errorMessage(error, "Unable to send the email.") });
      }
    });
  }

  const busy = busyAction !== null;
  const research = asRecord(lead?.research_data);
  const aiAnalysis = asRecord(research?.ai_analysis);
  const personalization = asRecord(research?.email_personalization);

  const canResearch =
    lead !== undefined &&
    (lead.research_status === "NOT_STARTED" ||
      lead.research_status === "PENDING" ||
      lead.research_status === "FAILED");
  const researchRunning = lead?.research_status === "IN_PROGRESS";
  const researchDone = lead?.research_status === "COMPLETED";
  const canFindContact =
    researchDone &&
    lead !== undefined &&
    (lead.contact_email_status === "NOT_STARTED" ||
      lead.contact_email_status === "NOT_FOUND" ||
      lead.contact_email_status === "INVALID");
  const contactFound = lead?.contact_email_status === "FOUND";
  const canDraft =
    researchDone &&
    lead !== undefined &&
    (
      lead.email_status === "NOT_STARTED" ||
      lead.email_status === "NOT_READY" ||
      lead.email_status === "FAILED"
    );
  const emailDrafted = lead?.email_status === "DRAFTED";
  const emailApproved = lead?.email_status === "APPROVED";
  const emailSent = lead?.email_status === "SENT";
  let saveLabel = "Save Changes";
  if (saveState === "saving") {
    saveLabel = "Saving…";
  } else if (saveState === "saved" && !emailDirty) {
    saveLabel = "Saved";
  }

  const analysis = aiAnalysis ?? {};
  const intelligence: IntelligenceData = {
    summary: asText(analysis.company_summary),
    services: asStringArray(analysis.services_or_products),
    audience: asText(analysis.target_audience),
    differentiators: asStringArray(analysis.differentiators),
    outreachInsights: asText(analysis.outreach_insights),
    opportunities: asStringArray(analysis.potential_opportunities),
  };
  const evidenceItems = asStringArray(analysis.evidence);
  const personalizationCount = asStringArray(personalization?.personalization_points).length;
  const hasIntelligence =
    intelligence.summary !== "" ||
    intelligence.services.length > 0 ||
    intelligence.audience !== "" ||
    intelligence.differentiators.length > 0 ||
    intelligence.outreachInsights !== "" ||
    intelligence.opportunities.length > 0;
  const researchFailed = lead?.research_status === "FAILED";
  const researchPending = lead?.research_status === "PENDING";

  const actionProps = {
    lead: lead as Lead,
    canResearch,
    researchRunning,
    canFindContact,
    contactFound,
    canDraft,
    showDraftForm,
    emailDrafted,
    emailApproved,
    emailSent,
    busy,
    busyAction,
    onResearch: handleResearch,
    onFindContact: handleFindContact,
    onGenerate: () => setShowDraftForm(true),
    onSendClick: () => setShowSendConfirm(true),
  };

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 sm:px-8 lg:px-12">
      <header className="flex items-center justify-between gap-6 border-b border-line py-6 sm:py-7">
        <Link
          href="/leads"
          className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted hover:border-line-strong hover:text-ink"
        >
          ← Leads
        </Link>
        <p className="hidden rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted sm:block">
          Lead workspace
        </p>
      </header>

      <main className="w-full py-10 sm:py-14" aria-busy={busy || undefined}>
        {status === "loading" ? (
          <div className="status-card" role="status">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false" className="animate-spin">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
              <path d="M18 10a8 8 0 0 0-8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-sm font-bold leading-snug">Loading lead…</p>
            </div>
          </div>
        ) : null}

        {status === "not-found" ? (
          <div className="status-card" role="status">
            <div>
              <p className="text-sm font-bold leading-snug">Lead not found</p>
              <p className="mt-1 text-sm leading-snug text-muted">
                This lead does not exist in your LeadPilot list.
              </p>
              <Link href="/leads" className="primary-action mt-4 max-w-52">
                Back to Leads
              </Link>
            </div>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="status-card" data-tone="error" role="alert">
            <div>
              <p className="text-sm font-bold leading-snug">Couldn&apos;t load this lead.</p>
              <p className="mt-1 text-sm leading-snug">
                We couldn&apos;t retrieve the lead data. Please try again.
              </p>
              <button
                type="button"
                onClick={handleRetry}
                className="primary-action mt-4 max-w-52"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : null}

        {status === "ready" && lead ? (
          <div className="flex flex-col gap-6">
            <WorkspaceHeader lead={lead} nextAction={<NextAction {...actionProps} variant="header" />} />

            {notice ? <NoticeBanner notice={notice} /> : null}

            <WorkspacePipeline lead={lead} />

            <div className="mt-2 grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="order-2 flex min-w-0 flex-col gap-12 lg:order-1">

            <WorkspaceSection
              eyebrow="Research"
              title={
                researchDone
                  ? "Company Intelligence"
                  : researchRunning
                    ? "Research in Progress"
                    : "Research"
              }
            >
              {researchRunning ? <ResearchRunning /> : null}
              {canResearch ? (
                <ResearchPending
                  state={researchFailed ? "FAILED" : researchPending ? "PENDING" : "NOT_STARTED"}
                  busy={busy}
                  busyAction={busyAction}
                  onResearch={handleResearch}
                />
              ) : null}
              {researchDone && hasIntelligence ? (
                <div id="intelligence" className="flex scroll-mt-6 flex-col gap-6">
                  <Intelligence data={intelligence} />
                  <Evidence items={evidenceItems} />
                </div>
              ) : null}
              {researchDone && !hasIntelligence ? (
                <p className="max-w-xl text-[15px] leading-relaxed text-muted">
                  Research completed, but no analysis summary is available for this lead.
                </p>
              ) : null}
            </WorkspaceSection>

            <WorkspaceSection eyebrow="Contact" title="Contact Intelligence">
              <ContactPanel
                lead={lead}
                researchDone={researchDone}
                canFindContact={canFindContact}
                contactFound={contactFound}
                busy={busy}
                busyAction={busyAction}
                onFindContact={handleFindContact}
              />
            </WorkspaceSection>

            <WorkspaceSection id="outreach" eyebrow="Outreach" title="Outreach">
              {canDraft && !showDraftForm && !emailDrafted && !emailApproved && !emailSent ? (
                <OutreachEmpty onGenerate={() => setShowDraftForm(true)} busy={busy} />
              ) : null}
              {!canDraft && !showDraftForm && !emailDrafted && !emailApproved && !emailSent ? (
                <p className="max-w-xl text-[15px] leading-relaxed text-muted">
                  Complete research and contact discovery to unlock personalized outreach.
                </p>
              ) : null}

              {showDraftForm && canDraft ? (
                <DraftForm
                  fields={DRAFT_FORM_FIELDS}
                  values={draftForm}
                  onChange={(key, value) =>
                    setDraftForm((previous) => ({ ...previous, [key]: value }))
                  }
                  onSubmit={handleDraft}
                  onCancel={() => setShowDraftForm(false)}
                  busy={busy}
                  busyAction={busyAction}
                />
              ) : null}

              {emailDrafted || emailApproved || emailSent ? (
                <EmailComposer
                  lead={lead}
                  emailDrafted={emailDrafted}
                  emailApproved={emailApproved}
                  editingApproved={editingApproved}
                  emailSent={emailSent}
                  editSubject={editSubject}
                  editBody={editBody}
                  emailDirty={emailDirty}
                  saveLabel={saveLabel}
                  saveState={saveState}
                  busy={busy}
                  busyAction={busyAction}
                  personalizationCount={personalizationCount}
                  onEditSubject={handleEditSubject}
                  onEditBody={handleEditBody}
                  onSave={handleSaveDraft}
                  onDiscard={handleDiscardEdits}
                  onApprove={handleApprove}
                  onEditApproved={() => setEditingApproved(true)}
                  onSendClick={() => setShowSendConfirm(true)}
                />
              ) : null}

            </WorkspaceSection>
              </div>
              <aside className="order-1 flex min-w-0 flex-col gap-8 lg:order-2">
                <div className="order-1 lg:order-2">
                  <NextAction {...actionProps} variant="sidebar" />
                </div>
                <div className="order-2 border-t border-line pt-8 lg:order-1 lg:border-t-0 lg:pt-0">
                  <StatusPanel lead={lead} />
                </div>
                <div className="order-3 border-t border-line pt-8">
                  <SidebarMeta lead={lead} />
                </div>
              </aside>
            </div>
          </div>
        ) : null}
      </main>

      {showSendConfirm && lead ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="send-confirm-title"
          onClick={() => {
            if (!busy) {
              setShowSendConfirm(false);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-surface p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="send-confirm-title" className="text-xl font-bold tracking-tight">
              Send this email?
            </h2>
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">To</dt>
                <dd className="mt-1 font-semibold">{lead.contact_email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Subject
                </dt>
                <dd className="mt-1">{lead.email_subject ?? "—"}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-muted">
              This action will send the approved email to the contact.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowSendConfirm(false)}
                disabled={busy}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={busy}
                className="btn-primary"
              >
                {busyAction === "send" ? "Sending…" : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
