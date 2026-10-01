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
    <div className="relative min-w-0 flex-1 basis-36">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`min-h-11 w-full appearance-none truncate rounded-xl border bg-field py-2 pl-3 pr-9 text-sm hover:border-line-strong ${
          active ? "border-primary font-semibold text-ink" : "border-line text-muted"
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
    <div className="flex flex-col gap-3">
      <div className="relative">
        <label htmlFor="lead-search" className="sr-only">
          Search companies
        </label>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        >
          <circle cx="7" cy="7" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10.8 10.8 14.2 14.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          id="lead-search"
          name="search"
          type="search"
          value={search}
          placeholder="Search companies..."
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onSearchChange(event.target.value)}
          className="min-h-11 w-full rounded-xl border border-line bg-field py-2 pl-10 pr-4 text-sm text-ink placeholder:text-muted hover:border-line-strong"
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
            className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-bold text-primary underline-offset-4 hover:underline"
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
