"use client";

import type { ReactNode } from "react";
import { Search, ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";

export type LeadStatusFilter = "all" | "NEW" | "Contacted" | "Replied" | "Converted";

export type LeadResearchFilter = "all" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

export type LeadEmailFilter =
  | "all"
  | "NOT_STARTED"
  | "DRAFTED"
  | "APPROVED"
  | "SENT"
  | "FAILED";

export type LeadContactFilter = "all" | "NOT_STARTED" | "FOUND" | "NOT_FOUND" | "INVALID";

export type LeadSortKey = "newest" | "oldest" | "name-asc" | "name-desc" | "rating" | "reviews";

export const STATUS_OPTIONS: { value: LeadStatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "NEW", label: "New leads" },
  { value: "Contacted", label: "Contacted" },
  { value: "Replied", label: "Replied" },
  { value: "Converted", label: "Converted" },
];

export const RESEARCH_OPTIONS: { value: LeadResearchFilter; label: string }[] = [
  { value: "all", label: "All research" },
  { value: "NOT_STARTED", label: "Not started" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

export const EMAIL_OPTIONS: { value: LeadEmailFilter; label: string }[] = [
  { value: "all", label: "All email status" },
  { value: "NOT_STARTED", label: "Not started" },
  { value: "DRAFTED", label: "Drafted" },
  { value: "APPROVED", label: "Approved" },
  { value: "SENT", label: "Sent" },
  { value: "FAILED", label: "Failed" },
];

export const CONTACT_OPTIONS: { value: LeadContactFilter; label: string }[] = [
  { value: "all", label: "All contacts" },
  { value: "NOT_STARTED", label: "Not searched" },
  { value: "FOUND", label: "Verified email" },
  { value: "NOT_FOUND", label: "Email not found" },
  { value: "INVALID", label: "Invalid" },
];

export const SORT_OPTIONS: { value: LeadSortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
  { value: "rating", label: "Highest rating" },
  { value: "reviews", label: "Most reviews" },
];

type LeadFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  status: LeadStatusFilter;
  onStatusChange: (value: LeadStatusFilter) => void;
  research: LeadResearchFilter;
  onResearchChange: (value: LeadResearchFilter) => void;
  email: LeadEmailFilter;
  onEmailChange: (value: LeadEmailFilter) => void;
  contact: LeadContactFilter;
  onContactChange: (value: LeadContactFilter) => void;
  sort: LeadSortKey;
  onSortChange: (value: LeadSortKey) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
};

function isStatusFilter(value: string): value is LeadStatusFilter {
  return STATUS_OPTIONS.some((option) => option.value === value);
}

function isResearchFilter(value: string): value is LeadResearchFilter {
  return RESEARCH_OPTIONS.some((option) => option.value === value);
}

function isEmailFilter(value: string): value is LeadEmailFilter {
  return EMAIL_OPTIONS.some((option) => option.value === value);
}

function isContactFilter(value: string): value is LeadContactFilter {
  return CONTACT_OPTIONS.some((option) => option.value === value);
}

function isSortKey(value: string): value is LeadSortKey {
  return SORT_OPTIONS.some((option) => option.value === value);
}

function ToolbarSelect({
  id,
  label,
  value,
  onChange,
  children,
  active,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <div className="relative min-w-0 flex-1 basis-36">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-10 w-full appearance-none truncate rounded-xl border bg-slate-900/80 py-2 pl-3 pr-8 text-xs font-medium text-slate-200 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-slate-700 ${
          active ? "border-indigo-500/60 bg-indigo-950/20 text-indigo-300" : "border-slate-800"
        }`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
    </div>
  );
}

export function LeadFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  research,
  onResearchChange,
  email,
  onEmailChange,
  contact,
  onContactChange,
  sort,
  onSortChange,
  onReset,
  hasActiveFilters,
}: LeadFiltersProps) {
  return (
    <div className="glass-panel flex flex-col gap-3 rounded-2xl border border-white/10 p-4">
      <div className="relative">
        <label htmlFor="lead-search" className="sr-only">
          Search companies
        </label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id="lead-search"
          name="search"
          type="search"
          value={search}
          placeholder="Search by company name, category, or area..."
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition-all focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ToolbarSelect
          id="lead-status"
          label="Filter by lead status"
          value={status}
          active={status !== "all"}
          onChange={(value) => {
            if (isStatusFilter(value)) {
              onStatusChange(value);
            }
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </ToolbarSelect>

        <ToolbarSelect
          id="lead-research"
          label="Filter by research status"
          value={research}
          active={research !== "all"}
          onChange={(value) => {
            if (isResearchFilter(value)) {
              onResearchChange(value);
            }
          }}
        >
          {RESEARCH_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </ToolbarSelect>

        <ToolbarSelect
          id="lead-contact"
          label="Filter by contact status"
          value={contact}
          active={contact !== "all"}
          onChange={(value) => {
            if (isContactFilter(value)) {
              onContactChange(value);
            }
          }}
        >
          {CONTACT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </ToolbarSelect>

        <ToolbarSelect
          id="lead-email"
          label="Filter by email status"
          value={email}
          active={email !== "all"}
          onChange={(value) => {
            if (isEmailFilter(value)) {
              onEmailChange(value);
            }
          }}
        >
          {EMAIL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </ToolbarSelect>

        <ToolbarSelect
          id="lead-sort"
          label="Sort leads"
          value={sort}
          onChange={(value) => {
            if (isSortKey(value)) {
              onSortChange(value);
            }
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </ToolbarSelect>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
