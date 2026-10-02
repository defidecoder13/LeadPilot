"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Globe,
  MapPin,
  Star,
  ExternalLink,
  Phone,
  Sparkles,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Send,
  FileText,
  UserCheck,
  ShieldCheck,
  Zap,
  Target,
  ArrowRight,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Edit3,
} from "lucide-react";
import type { Lead } from "@/lib/leadDiscovery";
import type { DraftEmailInput } from "@/lib/leadPilot";

type Tone = "ok" | "active" | "progress" | "idle" | "bad";

function toneBadge(tone: Tone): { bg: string; text: string; border: string } {
  if (tone === "ok") {
    return {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
    };
  }
  if (tone === "active") {
    return {
      bg: "bg-indigo-500/15",
      text: "text-indigo-400",
      border: "border-indigo-500/30",
    };
  }
  if (tone === "progress") {
    return {
      bg: "bg-cyan-500/15",
      text: "text-cyan-400",
      border: "border-cyan-500/30",
    };
  }
  if (tone === "bad") {
    return {
      bg: "bg-rose-500/15",
      text: "text-rose-400",
      border: "border-rose-500/30",
    };
  }
  return {
    bg: "bg-slate-800/40",
    text: "text-slate-400",
    border: "border-slate-700/40",
  };
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
    return { label: "Verified", glyph: "✓", tone: "ok" };
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
    return { label: "Approved", glyph: "●", tone: "ok" };
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

function getInitials(name: string): string {
  const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, "");
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "LP";
}

/* -------------------------------------------------------------------------- */
/*                               WORKSPACE HEADER                             */
/* -------------------------------------------------------------------------- */

export function WorkspaceHeader({ lead }: { lead: Lead; nextAction?: React.ReactNode }) {
  const website = lead.website.trim();
  const mapsUrl = lead.google_maps_url.trim();
  const address = lead.address.trim();
  const locality = address ? localityOf(address) : "";
  const [copiedPhone, setCopiedPhone] = useState(false);

  const initials = getInitials(lead.business_name);

  function copyPhone() {
    if (!lead.phone) return;
    navigator.clipboard.writeText(lead.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  }

  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl border border-white/10 p-6 sm:p-8">
      {/* Subtle background ambient blur */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {/* Monogram Company Avatar */}
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl border border-white/15 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-xl font-bold tracking-wider text-white shadow-lg shadow-indigo-500/20 sm:h-20 sm:w-20 sm:text-2xl">
            {initials}
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {lead.business_name}
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Lead
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
              {lead.category.trim() ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs font-medium text-slate-300">
                  <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                  {lead.category.replace(/_/g, " ")}
                </span>
              ) : null}

              {locality ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" />
                  {locality}
                </span>
              ) : null}

              {lead.rating !== null ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {lead.rating.toFixed(1)}
                  <span className="font-normal text-amber-400/80">
                    ({lead.review_count.toLocaleString()} reviews)
                  </span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Quick Action Dock */}
        <div className="flex flex-wrap items-center gap-2.5">
          {website ? (
            <a
              href={/^https?:\/\//i.test(website) ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium"
            >
              <Globe className="h-3.5 w-3.5 text-indigo-400 group-hover:text-indigo-300" />
              <span>{domainOf(website)}</span>
              <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-slate-300" />
            </a>
          ) : null}

          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium"
            >
              <MapPin className="h-3.5 w-3.5 text-rose-400 group-hover:text-rose-300" />
              <span>Google Maps</span>
              <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-slate-300" />
            </a>
          ) : null}

          {lead.phone.trim() ? (
            <button
              type="button"
              onClick={copyPhone}
              className="btn-secondary group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium"
            >
              <Phone className="h-3.5 w-3.5 text-cyan-400 group-hover:text-cyan-300" />
              <span>{copiedPhone ? "Copied!" : lead.phone.trim()}</span>
              {copiedPhone ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3 text-slate-500 group-hover:text-slate-300" />
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            5-STAGE PIPELINE STEPPER                        */
/* -------------------------------------------------------------------------- */

export function WorkspacePipeline({ lead }: { lead: Lead }) {
  const research = researchStage(lead);
  const contact = contactStage(lead);
  const outreach = outreachStage(lead);
  const approval = approvalStage(lead);
  const send = sendStage(lead);

  const stages = [
    {
      num: 1,
      name: "Discovery",
      state: { label: "Discovered", glyph: "✓", tone: "ok" as Tone },
      icon: CheckCircle2,
    },
    {
      num: 2,
      name: "AI Research",
      state: research,
      icon: Sparkles,
    },
    {
      num: 3,
      name: "Contact Intel",
      state: contact,
      icon: UserCheck,
    },
    {
      num: 4,
      name: "Outreach Draft",
      state: outreach,
      icon: FileText,
    },
    {
      num: 5,
      name: "Dispatched",
      state: send,
      icon: Send,
    },
  ];

  // Calculate progress percent
  let completedCount = 1;
  if (research.tone === "ok") completedCount += 1;
  if (contact.tone === "ok") completedCount += 1;
  if (approval.tone === "ok") completedCount += 1;
  if (send.tone === "ok") completedCount += 1;
  const progressPercent = Math.min(100, Math.round((completedCount / 5) * 100));

  return (
    <div className="glass-panel relative rounded-2xl border border-white/10 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Autonomous Pipeline Progress
          </span>
        </div>
        <span className="text-xs font-semibold text-indigo-300">{progressPercent}% Completed</span>
      </div>

      {/* Progress Track Line */}
      <div className="relative mb-6 h-1 w-full rounded-full bg-slate-800">
        <div
          className="h-1 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stages.map((stage) => {
          const badge = toneBadge(stage.state.tone);
          const isCurrent = stage.state.tone === "progress" || stage.state.tone === "active";
          const Icon = stage.icon;

          return (
            <li
              key={stage.name}
              className={`flex flex-col gap-2 rounded-xl border p-3 transition-all ${
                isCurrent
                  ? "border-indigo-500/40 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                  : "border-slate-800/80 bg-slate-900/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                  {stage.num}
                </span>
                <Icon
                  className={`h-4 w-4 ${
                    stage.state.tone === "ok"
                      ? "text-emerald-400"
                      : stage.state.tone === "progress"
                        ? "text-cyan-400 animate-spin"
                        : stage.state.tone === "bad"
                          ? "text-rose-400"
                          : "text-slate-500"
                  }`}
                />
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">{stage.name}</span>
                <span
                  className={`mt-1 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {stage.state.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                        UNIFIED CONTEXT-AWARE ACTION CONSOLE                */
/* -------------------------------------------------------------------------- */

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

  // In the redesign, we hide the redundant sidebar variant so there is only 1 unified command console!
  if (variant === "sidebar") {
    return null;
  }

  let title = "Ready for Next Step";
  let description = "Keep progressing this lead through the discovery pipeline.";
  let buttonLabel = "Proceed";
  let buttonAction: () => void = () => {};
  let icon = <Sparkles className="h-5 w-5 text-indigo-400" />;
  let isDone = false;

  if (props.emailSent) {
    title = "Outreach Completed";
    description = `Approved email was sent to ${lead.contact_email ?? "the contact"}.`;
    isDone = true;
    icon = <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
  } else if (props.emailApproved) {
    title = "Email Approved & Ready for Dispatch";
    description = `Outreach drafted and approved. Ready to send via n8n webhook.`;
    buttonLabel = "Send Approved Email →";
    buttonAction = props.onSendClick;
    icon = <Send className="h-5 w-5 text-emerald-400" />;
  } else if (props.emailDrafted) {
    title = "Outreach Draft Ready for Review";
    description = "Review the personalized AI message below, edit if desired, and approve.";
    buttonLabel = "Review Email Draft ↓";
    buttonAction = () => {
      document.getElementById("outreach")?.scrollIntoView({ behavior: "smooth" });
    };
    icon = <FileText className="h-5 w-5 text-indigo-400" />;
  } else if (props.showDraftForm && props.canDraft) {
    title = "Drafting Personalized Email";
    description = "Complete the brief offer details below to generate your message.";
    isDone = true;
    icon = <Edit3 className="h-5 w-5 text-cyan-400" />;
  } else if (props.canDraft) {
    title = "Verified Contact Found";
    description = `Contact verified (${lead.contact_email}). Generate tailored cold email with AI.`;
    buttonLabel = "Generate Email Draft →";
    buttonAction = props.onGenerate;
    icon = <Sparkles className="h-5 w-5 text-indigo-400" />;
  } else if (props.canFindContact) {
    title = "Research Complete — Discover Contact Email";
    description = "Trigger web discovery workflow to locate verified decision-maker emails.";
    buttonLabel = props.busyAction === "contact" ? "Finding Contact Email…" : "Find Contact Email →";
    buttonAction = props.onFindContact;
    icon = <Mail className="h-5 w-5 text-cyan-400" />;
  } else if (props.researchRunning) {
    title = "AI Company Intelligence Scan in Progress";
    description = "n8n workflow is currently analyzing services, offerings, and market signals.";
    buttonLabel = "Analyzing…";
    isDone = true;
    icon = <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />;
  } else if (props.canResearch) {
    title = "Ready for AI Intelligence Scan";
    description = `Initiate automated deep dive into ${lead.business_name} using Google Places & n8n.`;
    buttonLabel = props.busyAction === "research" ? "Initiating Research…" : "Start AI Research →";
    buttonAction = props.onResearch;
    icon = <Zap className="h-5 w-5 text-indigo-400" />;
  } else if (researchDone) {
    title = "Research Stage Complete";
    description = "Deep company intelligence collected.";
    isDone = true;
    icon = <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
  }

  return (
    <div className="glass-panel-elevated relative overflow-hidden rounded-2xl border border-indigo-500/30 p-5 sm:p-6 glow-indigo">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 shadow-sm">
            {icon}
          </div>
          <div>
            <h2 className="text-base font-bold text-white sm:text-lg">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-300 sm:text-sm">{description}</p>
          </div>
        </div>

        {!isDone ? (
          <div className="flex flex-none">
            <button
              type="button"
              onClick={buttonAction}
              disabled={props.busy || props.researchRunning}
              className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg shadow-indigo-500/25 sm:w-auto"
            >
              {buttonLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               WORKFLOW SECTION                             */
/* -------------------------------------------------------------------------- */

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
    <section
      id={id}
      aria-label={title}
      className="glass-panel relative flex scroll-mt-6 flex-col gap-6 rounded-2xl border border-white/10 p-6 sm:p-7 transition-all hover:border-white/15"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
            {eyebrow}
          </span>
          <h2 className="mt-0.5 text-lg font-bold text-white sm:text-xl">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                            AI INTELLIGENCE DOSSIER                         */
/* -------------------------------------------------------------------------- */

export type IntelligenceData = {
  summary: string;
  services: string[];
  audience: string;
  differentiators: string[];
  outreachInsights: string;
  opportunities: string[];
};

export function Intelligence({ data }: { data: IntelligenceData }) {
  return (
    <div className="flex flex-col gap-6">
      {data.summary ? (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-5">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Executive Summary
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-200">{data.summary}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {data.services.length > 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Core Offerings & Services
              </h3>
            </div>
            <ul className="flex flex-wrap gap-2">
              {data.services.map((item) => (
                <li
                  key={item}
                  className="rounded-lg border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-200"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {data.audience ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Target Market & Audience
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{data.audience}</p>
          </div>
        ) : null}
      </div>

      {data.differentiators.length > 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Key Strengths & Differentiators
            </h3>
          </div>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {data.differentiators.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-300"
              >
                <CheckCircle2 className="h-4 w-4 flex-none text-emerald-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {data.outreachInsights || data.opportunities.length > 0 ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-950/15 p-5">
          <div className="mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Recommended Outreach Angles
            </h3>
          </div>
          {data.outreachInsights ? (
            <p className="mb-3 text-sm leading-relaxed text-slate-200">{data.outreachInsights}</p>
          ) : null}
          {data.opportunities.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {data.opportunities.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-xs leading-relaxed text-amber-200/90"
                >
                  <ArrowRight className="h-3.5 w-3.5 flex-none text-amber-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function Evidence({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <div className="border-t border-slate-800 pt-4">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white"
      >
        <ShieldCheck className="h-4 w-4 text-indigo-400" />
        <span>Verified from {items.length} data sources</span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {open ? (
        <ul className="mt-3 flex flex-col gap-1.5 text-xs text-slate-400">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
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
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-6 text-center sm:p-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="mx-auto max-w-md">
        <h3 className="text-base font-bold text-white">AI Intelligence Scan Pending</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
          {state === "FAILED"
            ? "The research workflow encountered an issue. You can retry anytime."
            : "Trigger n8n to analyze company offerings, value propositions, and extract personalized outreach angles."}
        </p>
      </div>
      <div>
        <button
          type="button"
          onClick={onResearch}
          disabled={busy}
          className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          {busyAction === "research" ? "Running Intelligence Scan…" : "Run Intelligence Scan →"}
        </button>
      </div>
    </div>
  );
}

export function ResearchRunning() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-5 text-cyan-300">
      <Loader2 className="h-6 w-6 flex-none animate-spin text-cyan-400" />
      <div>
        <p className="text-sm font-bold text-white">Autonomous Intelligence Scan in Progress</p>
        <p className="text-xs text-slate-400">
          Extracting business profile, service offerings, and target market. Refreshes automatically.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               CONTACT PANEL                                */
/* -------------------------------------------------------------------------- */

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

  function handleCopy() {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      {props.contactFound && email ? (
        <div className="flex flex-col gap-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                {name ? <p className="text-sm font-bold text-white">{name}</p> : null}
                <p className="text-xs text-slate-400">Verified Business Contact</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              100% Deliverable
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-400" />
              <span className="font-mono text-sm font-semibold text-white">{email}</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="btn-secondary inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copy Email</span>
                </>
              )}
            </button>
          </div>

          {source ? (
            <p className="text-xs text-slate-400">Discovered via {source}</p>
          ) : null}
        </div>
      ) : null}

      {!props.contactFound && props.researchDone && (
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-6 text-center">
          <Mail className="mx-auto h-8 w-8 text-slate-600" />
          <p className="mt-2 text-sm font-semibold text-white">No Contact Email Linked Yet</p>
          <p className="mt-1 text-xs text-slate-400">
            Click &ldquo;Find Contact Email&rdquo; above to trigger autonomous email extraction.
          </p>
        </div>
      )}

      {!props.researchDone && (
        <p className="text-xs text-slate-400">
          Complete company intelligence scan to unlock verified contact discovery.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               OUTREACH STUDIO                              */
/* -------------------------------------------------------------------------- */

export function OutreachEmpty({ onGenerate, busy }: { onGenerate: () => void; busy: boolean }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-indigo-400" />
        <h3 className="text-sm font-bold text-white">Ready for Personalized Cold Outreach</h3>
      </div>
      <p className="text-xs text-slate-400 sm:text-sm">
        LeadPilot will synthesize your research data, business value props, and contact intelligence
        to generate a tailored email draft.
      </p>
      <div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={busy}
          className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          Draft Personalized Email →
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
  return (
    <form onSubmit={props.onSubmit} className="flex flex-col gap-5 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white">Customize Outreach Parameters</h3>
        <span className="text-xs text-slate-400">n8n AI Generator</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {props.fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label htmlFor={`draft-${field.key}`} className="text-xs font-semibold text-slate-300">
              {field.label} {field.required ? <span className="text-indigo-400">*</span> : null}
            </label>
            <input
              id={`draft-${field.key}`}
              type="text"
              required={field.required}
              value={props.values[field.key]}
              disabled={props.busy}
              onChange={(e) => props.onChange(field.key, e.target.value)}
              className="input-control rounded-xl text-sm"
              placeholder={`Enter ${field.label.toLowerCase()}...`}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={props.busy}
          className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          {props.busyAction === "draft" ? "Generating AI Draft…" : "Generate Email Draft →"}
        </button>
        <button
          type="button"
          onClick={props.onCancel}
          disabled={props.busy}
          className="btn-secondary rounded-xl px-4 py-2 text-sm"
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
  const editable = props.emailDrafted || (props.emailApproved && props.editingApproved);

  return (
    <div className="glass-panel overflow-hidden rounded-2xl border border-white/10">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Outreach Email Studio
          </span>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            props.emailSent
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : props.emailApproved
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
          }`}
        >
          {props.emailSent ? "Dispatched" : props.emailApproved ? "Approved" : "Draft Ready"}
        </span>
      </div>

      <div className="flex flex-col gap-5 p-5 sm:p-6">
        {editable ? (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email-subject" className="text-xs font-semibold text-slate-400">
                Subject Line
              </label>
              <input
                id="email-subject"
                type="text"
                value={props.editSubject}
                disabled={props.busy}
                onChange={(e) => props.onEditSubject(e.target.value)}
                className="input-control rounded-xl font-medium text-white text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email-body" className="text-xs font-semibold text-slate-400">
                Message Body
              </label>
              <textarea
                id="email-body"
                rows={10}
                value={props.editBody}
                disabled={props.busy}
                onChange={(e) => props.onEditBody(e.target.value)}
                className="input-control min-h-60 rounded-xl font-sans text-sm leading-relaxed text-slate-200"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={props.onSave}
                  disabled={props.busy || !props.emailDirty}
                  className="btn-primary rounded-xl px-4 py-2 text-xs font-semibold"
                >
                  {props.saveLabel}
                </button>
                {props.emailDirty ? (
                  <button
                    type="button"
                    onClick={props.onDiscard}
                    disabled={props.busy}
                    className="btn-secondary rounded-xl px-4 py-2 text-xs font-semibold"
                  >
                    Discard Edits
                  </button>
                ) : null}
              </div>

              {props.emailDrafted ? (
                <button
                  type="button"
                  onClick={props.onApprove}
                  disabled={props.busy || props.emailDirty}
                  className="btn-primary rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 text-xs font-semibold shadow-emerald-500/20"
                >
                  {props.busyAction === "approve" ? "Approving…" : "Approve Draft ✓"}
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400">Subject</p>
              <p className="mt-1 text-sm font-semibold text-white">{props.lead.email_subject}</p>
            </div>
            <div className="border-t border-slate-800 pt-4">
              <p className="text-xs font-semibold text-slate-400">Body</p>
              <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/80 p-4 font-sans text-sm leading-relaxed text-slate-200 whitespace-pre-line">
                {props.lead.email_body}
              </div>
            </div>

            {props.emailApproved && !props.emailSent ? (
              <div className="flex flex-wrap gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={props.onSendClick}
                  disabled={props.busy}
                  className="btn-primary rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold"
                >
                  Send Approved Email →
                </button>
                <button
                  type="button"
                  onClick={props.onEditApproved}
                  disabled={props.busy}
                  className="btn-secondary rounded-xl px-4 py-2 text-sm"
                >
                  Edit Email
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               SIDEBAR PANELS                               */
/* -------------------------------------------------------------------------- */

export function StatusPanel({ lead }: { lead: Lead }) {
  const rows = [
    { name: "Research Stage", state: researchStage(lead) },
    { name: "Contact Stage", state: contactStage(lead) },
    { name: "Outreach Stage", state: outreachStage(lead) },
    { name: "Approval Stage", state: approvalStage(lead) },
    { name: "Send Stage", state: sendStage(lead) },
  ];

  return (
    <div className="glass-panel rounded-2xl border border-white/10 p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Stage Audit Log
      </h3>
      <dl className="flex flex-col gap-2.5">
        {rows.map((row) => {
          const badge = toneBadge(row.state.tone);
          return (
            <div key={row.name} className="flex items-center justify-between text-xs">
              <dt className="text-slate-400">{row.name}</dt>
              <dd className={`rounded px-1.5 py-0.5 font-semibold ${badge.bg} ${badge.text}`}>
                {row.state.label}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export function SidebarMeta({ lead }: { lead: Lead }) {
  const address = lead.address.trim();
  const locality = address ? localityOf(address) : "";

  return (
    <div className="glass-panel rounded-2xl border border-white/10 p-5">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Company Metadata
      </h3>
      <dl className="flex flex-col gap-3 text-xs">
        {lead.phone ? (
          <div>
            <dt className="text-slate-500">Phone</dt>
            <dd className="mt-0.5 font-semibold text-white">{lead.phone}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-slate-500">Place ID</dt>
          <dd className="mt-0.5 font-mono text-[11px] text-slate-400 break-all">{lead.place_id}</dd>
        </div>
        {locality ? (
          <div>
            <dt className="text-slate-500">Location Area</dt>
            <dd className="mt-0.5 font-semibold text-white">{locality}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-slate-500">Discovered Source</dt>
          <dd className="mt-0.5 font-semibold text-indigo-400">{lead.source || "Google Places"}</dd>
        </div>
      </dl>
    </div>
  );
}

export function NoticeBanner({
  notice,
}: {
  notice: { tone: "ok" | "error" | "info"; text: string };
}) {
  const isErr = notice.tone === "error";
  const isOk = notice.tone === "ok";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-4 text-xs sm:text-sm font-medium ${
        isErr
          ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
          : isOk
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
      }`}
      role={isErr ? "alert" : "status"}
    >
      {isErr ? (
        <AlertCircle className="h-4 w-4 flex-none" />
      ) : isOk ? (
        <CheckCircle2 className="h-4 w-4 flex-none" />
      ) : (
        <Sparkles className="h-4 w-4 flex-none" />
      )}
      <p>{notice.text}</p>
    </div>
  );
}
