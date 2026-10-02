"use client";

import { Building2, Sparkles, Mail, Send, CheckCircle2, TrendingUp } from "lucide-react";

export type PipelineStage =
  | "all"
  | "new"
  | "researching"
  | "ready"
  | "drafted"
  | "approved"
  | "sent";

export type StageCounts = Record<PipelineStage, number>;

const STAGE_META: { stage: Exclude<PipelineStage, "all">; label: string; dotClass: string }[] = [
  { stage: "new", label: "New Leads", dotClass: "bg-indigo-400" },
  { stage: "researching", label: "Researching", dotClass: "bg-cyan-400 animate-pulse" },
  { stage: "ready", label: "Contact Verified", dotClass: "bg-emerald-400" },
  { stage: "drafted", label: "Drafted", dotClass: "bg-purple-400" },
  { stage: "approved", label: "Approved", dotClass: "bg-teal-400" },
  { stage: "sent", label: "Sent", dotClass: "bg-emerald-400" },
];

type LeadPipelineProps = {
  counts: StageCounts;
  active: PipelineStage | null;
  onSelect: (stage: PipelineStage) => void;
};

export function LeadPipeline({ counts, active, onSelect }: LeadPipelineProps) {
  const researchedTotal = (counts.ready || 0) + (counts.drafted || 0) + (counts.approved || 0) + (counts.sent || 0);
  const contactsVerified = (counts.ready || 0) + (counts.drafted || 0) + (counts.approved || 0) + (counts.sent || 0);
  const outreachReady = (counts.drafted || 0) + (counts.approved || 0) + (counts.sent || 0);

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Bento Metric Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Metric 1 */}
        <div
          onClick={() => onSelect("all")}
          className={`glass-panel cursor-pointer rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
            active === "all" || active === null
              ? "border-indigo-500/40 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
              : "border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Leads</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">{counts.all}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">100%</span>
            <span>Discovered via Places</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => onSelect("researching")}
          className={`glass-panel cursor-pointer rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
            active === "researching"
              ? "border-cyan-500/40 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
              : "border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Researched</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">{researchedTotal}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-cyan-400 font-medium">
              {counts.all > 0 ? Math.round((researchedTotal / counts.all) * 100) : 0}%
            </span>
            <span>Intelligence profile</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => onSelect("ready")}
          className={`glass-panel cursor-pointer rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
            active === "ready"
              ? "border-emerald-500/40 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
              : "border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verified Contacts</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Mail className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">{contactsVerified}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">Verified</span>
            <span>Email addresses</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => onSelect("sent")}
          className={`glass-panel cursor-pointer rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
            active === "sent" || active === "approved" || active === "drafted"
              ? "border-purple-500/40 bg-purple-500/10 shadow-lg shadow-purple-500/10"
              : "border-white/10 hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Outreach Ready</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">{outreachReady}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-purple-400 font-medium">{counts.sent || 0} sent</span>
            <span>• {counts.approved || 0} queued</span>
          </div>
        </div>
      </div>

      {/* Interactive Stage Filter Pills Dock */}
      <div
        className="glass-panel flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 p-2 sm:p-2.5"
        role="group"
        aria-label="Filter leads by pipeline stage"
      >
        <button
          type="button"
          onClick={() => onSelect("all")}
          aria-pressed={active === "all" || active === null}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
            active === "all" || active === null
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
              : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
          }`}
        >
          <span>All Prospects</span>
          <span className="rounded-md bg-white/15 px-1.5 py-0.2 text-[11px] font-bold">
            {counts.all}
          </span>
        </button>

        {STAGE_META.map((item) => {
          const isActive = active === item.stage;
          return (
            <button
              key={item.stage}
              type="button"
              onClick={() => onSelect(item.stage)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${item.dotClass}`} />
              <span>{item.label}</span>
              <span className="rounded-md bg-white/10 px-1.5 py-0.2 text-[11px] font-semibold text-slate-300">
                {counts[item.stage]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
