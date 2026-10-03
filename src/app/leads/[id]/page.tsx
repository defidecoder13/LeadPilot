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
  LockedSection,
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
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface px-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:border-line-strong hover:text-ink transition-colors"
        >
          <span aria-hidden="true">←</span>
          <span>Back to Leads</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
            Lead Intelligence Workspace
          </span>
        </div>
      </header>

      <main className="w-full py-8 sm:py-12" aria-busy={busy || undefined}>
        {status === "loading" ? (
          <div className="rounded-3xl border border-line bg-surface p-10 text-center shadow-xs" role="status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-8 w-8 mx-auto animate-spin text-primary">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <p className="mt-3 text-sm font-bold text-ink">Loading lead intelligence…</p>
          </div>
        ) : null}

        {status === "not-found" ? (
          <div className="rounded-3xl border border-line bg-surface p-12 text-center shadow-xs" role="status">
            <p className="text-xl font-bold tracking-tight text-ink">Lead Not Found</p>
            <p className="mt-2 text-sm text-muted">
              This lead does not exist in your LeadPilot database.
            </p>
            <Link href="/leads" className="btn-primary mt-6 inline-flex h-10 px-6 text-xs font-bold shadow-sm">
              ← Return to Leads
            </Link>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="rounded-3xl border border-red-200 bg-red-50/50 p-8 text-center shadow-xs" role="alert">
            <p className="text-base font-bold text-red-900">Couldn&apos;t load this lead</p>
            <p className="mt-1 text-xs text-red-700">
              We couldn&apos;t retrieve the company intelligence data from the server.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="btn-primary mt-5 inline-flex h-10 px-6 text-xs font-bold shadow-sm"
            >
              Try Again
            </button>
          </div>
        ) : null}

        {status === "ready" && lead ? (
          <div className="flex flex-col gap-6">
            <WorkspaceHeader lead={lead} nextAction={<NextAction {...actionProps} variant="header" />} />

            {notice ? <NoticeBanner notice={notice} /> : null}

            <WorkspacePipeline lead={lead} />

            <div className="mt-2 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="order-1 flex min-w-0 flex-col gap-8">
                <WorkspaceSection
                  eyebrow="Step 1 · Research"
                  title={
                    researchDone
                      ? "Company Intelligence"
                      : researchRunning
                        ? "Research in Progress"
                        : "Company Research"
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
                    <p className="max-w-xl text-sm leading-relaxed text-muted">
                      Research completed, but no analysis summary is available for this lead.
                    </p>
                  ) : null}
                </WorkspaceSection>

                {researchDone ? (
                  <WorkspaceSection eyebrow="Step 2 · Contact" title="Contact Intelligence">
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
                ) : (
                  <LockedSection
                    step="Step 2"
                    title="Contact Intelligence"
                    reason="Unlocks after AI company research completes"
                  />
                )}

                {canDraft || showDraftForm || emailDrafted || emailApproved || emailSent ? (
                  <WorkspaceSection id="outreach" eyebrow="Step 3 · Outreach" title="Personalized Outreach">
                    {canDraft && !showDraftForm && !emailDrafted && !emailApproved && !emailSent ? (
                      <OutreachEmpty />
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
                ) : (
                  <LockedSection
                    step="Step 3"
                    title="Personalized Outreach"
                    reason="Unlocks after contact discovery completes"
                  />
                )}
              </div>

              <aside className="order-2 flex min-w-0 flex-col gap-6 lg:order-2">
                <StatusPanel lead={lead} />
                <SidebarMeta lead={lead} />
              </aside>
            </div>
          </div>
        ) : null}
      </main>

      {showSendConfirm && lead ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 sm:p-6"
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
            className="relative w-full max-w-md rounded-[2rem] border border-line bg-surface p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowSendConfirm(false)}
              disabled={busy}
              className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-canvas hover:text-ink transition-colors"
              aria-label="Close dialog"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </div>
              <h2 id="send-confirm-title" className="text-xl font-bold tracking-tight text-ink">
                Send Outreach Email?
              </h2>
            </div>

            <div className="mt-5 rounded-2xl border border-line bg-canvas/60 p-4 text-xs">
              <div className="flex flex-col gap-2.5">
                <div>
                  <span className="font-semibold uppercase tracking-wider text-muted">Recipient</span>
                  <p className="mt-0.5 font-bold text-ink break-all">{lead.contact_email ?? "—"}</p>
                </div>
                <div className="border-t border-line/60 pt-2">
                  <span className="font-semibold uppercase tracking-wider text-muted">Subject</span>
                  <p className="mt-0.5 font-bold text-ink">{lead.email_subject ?? "—"}</p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted">
              This action will dispatch the approved email via your connected outbound provider.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowSendConfirm(false)}
                disabled={busy}
                className="btn-secondary w-full sm:w-auto px-5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={busy}
                className="btn-primary w-full sm:w-auto px-6"
              >
                {busyAction === "send" ? "Sending…" : "Send Email Now →"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
