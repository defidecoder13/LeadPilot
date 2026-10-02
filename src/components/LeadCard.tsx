"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  Globe,
  MapPin,
  Star,
  ExternalLink,
  Sparkles,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Send,
  FileText,
} from "lucide-react";
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

export type LeadCardProps = {
  lead: Lead;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onResearch: (lead: Lead) => Promise<void>;
  researching: boolean;
};

export function LeadCard({
  lead,
  selected,
  onToggleSelect,
  onResearch,
  researching,
}: LeadCardProps) {
  const website = lead.website.trim();
  const mapsUrl = lead.google_maps_url.trim();
  const address = lead.address.trim();
  const locality = address ? formatLocality(address) : "";
  const initials = getInitials(lead.business_name);

  const researchDone = lead.research_status.trim().toUpperCase() === "COMPLETED";
  const researchInProgress = lead.research_status.trim().toUpperCase() === "IN_PROGRESS" || researching;
  const contactFound = lead.contact_email_status.trim().toUpperCase() === "FOUND";
  const emailDrafted = lead.email_status.trim().toUpperCase() === "DRAFTED";
  const emailApproved = lead.email_status.trim().toUpperCase() === "APPROVED";
  const emailSent = lead.email_status.trim().toUpperCase() === "SENT";

  return (
    <article
      className={`glass-panel group relative flex h-full flex-col justify-between rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 sm:p-6 ${
        selected ? "border-indigo-500/60 bg-indigo-950/20 shadow-lg shadow-indigo-500/15" : "border-white/10"
      }`}
    >
      <div>
        {/* Header Row: Checkbox, Avatar, Title & Actions */}
        <div className="flex items-start gap-3.5">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(lead.id)}
            aria-label={`Select ${lead.business_name}`}
            className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
          />

          {/* Monogram Avatar */}
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold tracking-wider text-white shadow-md shadow-indigo-500/20">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <Link
              href={`/leads/${lead.id}`}
              className="group-hover:text-indigo-300 transition-colors"
            >
              <h2 className="truncate text-base font-bold text-white tracking-tight">
                {lead.business_name}
              </h2>
            </Link>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              {lead.category.trim() ? (
                <span className="inline-flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                  <Building2 className="h-3 w-3 text-indigo-400" />
                  {lead.category.replace(/_/g, " ")}
                </span>
              ) : null}

              {locality ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 truncate max-w-[150px]">
                  <MapPin className="h-3 w-3 flex-none text-slate-500" />
                  <span className="truncate">{locality}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Rating and Meta Info */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3">
          {lead.rating !== null ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{lead.rating.toFixed(1)}</span>
              <span className="font-normal text-amber-400/80">({lead.review_count})</span>
            </span>
          ) : (
            <span className="text-xs text-slate-500">Unrated</span>
          )}

          <div className="flex items-center gap-1.5">
            {website ? (
              <a
                href={toExternalUrl(website)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-1.5 text-slate-400 hover:border-slate-700 hover:text-white"
                title={domainOf(website)}
              >
                <Globe className="h-3.5 w-3.5" />
              </a>
            ) : null}
            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-1.5 text-slate-400 hover:border-slate-700 hover:text-white"
                title="Google Maps"
              >
                <MapPin className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </div>

        {/* Pipeline Stage Badges */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {/* Research Pill */}
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              researchDone
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : researchInProgress
                  ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-400 animate-pulse"
                  : "border-slate-800 bg-slate-900/50 text-slate-400"
            }`}
          >
            {researchInProgress ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
            ) : (
              <Sparkles className="h-2.5 w-2.5" />
            )}
            <span>{researchDone ? "Researched" : researchInProgress ? "Scanning…" : "Unresearched"}</span>
          </span>

          {/* Contact Pill */}
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
              contactFound
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-slate-800 bg-slate-900/50 text-slate-400"
            }`}
          >
            <Mail className="h-2.5 w-2.5" />
            <span>{contactFound ? "Email Verified" : "No Email"}</span>
          </span>

          {/* Outreach Status */}
          {emailSent || emailApproved || emailDrafted ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                emailSent
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : emailApproved
                    ? "border-teal-500/20 bg-teal-500/10 text-teal-400"
                    : "border-purple-500/20 bg-purple-500/10 text-purple-400"
              }`}
            >
              {emailSent ? <CheckCircle2 className="h-2.5 w-2.5" /> : <FileText className="h-2.5 w-2.5" />}
              <span>{emailSent ? "Sent" : emailApproved ? "Approved" : "Drafted"}</span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-4 border-t border-slate-800/80 pt-3">
        <Link
          href={`/leads/${lead.id}`}
          className="btn-secondary group flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <span>Open Lead Workspace</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-400" />
        </Link>
      </div>
    </article>
  );
}
