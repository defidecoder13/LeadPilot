import type { ReactNode } from "react";

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
  { value: "NEW", label: "New" },
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
  { value: "all", label: "All email" },
  { value: "NOT_STARTED", label: "Not started" },
  { value: "DRAFTED", label: "Drafted" },
  { value: "APPROVED", label: "Approved" },
  { value: "SENT", label: "Sent" },
  { value: "FAILED", label: "Failed" },
];

export const CONTACT_OPTIONS: { value: LeadContactFilter; label: string }[] = [
  { value: "all", label: "All contact" },
  { value: "NOT_STARTED", label: "Not searched" },
  { value: "FOUND", label: "Found" },
  { value: "NOT_FOUND", label: "Not found" },
  { value: "INVALID", label: "Invalid" },
];

export const SORT_OPTIONS: { value: LeadSortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Business name A–Z" },
  { value: "name-desc", label: "Business name Z–A" },
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

function Chevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
    >
      <path
        d="M4 6.2 8 10.2 12 6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
    <div className="relative min-w-0 flex-1 basis-40">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-10 w-full appearance-none truncate rounded-xl border py-1.5 pl-3.5 pr-9 text-xs transition-colors hover:border-line-strong cursor-pointer ${
          active
            ? "border-primary bg-primary/5 font-bold text-primary shadow-xs"
            : "border-line bg-surface text-ink font-medium"
        }`}
      >
        {children}
      </select>
      <Chevron />
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
    <div className="flex flex-col gap-3 mt-6">
      <div className="relative flex items-center">
        <label htmlFor="lead-search" className="sr-only">
          Search companies
        </label>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        >
          <circle cx="7" cy="7" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10.8 10.8 14.2 14.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          id="lead-search"
          name="search"
          type="search"
          value={search}
          placeholder="Search by company name, category, location, phone, or email..."
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-11 w-full rounded-2xl border border-line bg-surface py-2 pl-10 pr-10 text-sm text-ink placeholder:text-muted/80 shadow-xs transition-all hover:border-line-strong focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-canvas hover:text-ink transition-colors"
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : null}
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
          id="lead-contact"
          label="Filter by contact email status"
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
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-canvas px-3.5 text-xs font-bold text-muted hover:border-line-strong hover:text-ink transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
