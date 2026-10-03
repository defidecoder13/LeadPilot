"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getLeads } from "@/lib/leadDiscovery";
import type { Lead, LeadsResponse } from "@/lib/leadDiscovery";
import { deleteAllLeads, deleteLeads, triggerResearch } from "@/lib/leadPilot";
import { LeadFilters } from "@/components/LeadFilters";
import type {
  LeadContactFilter,
  LeadEmailFilter,
  LeadResearchFilter,
  LeadSortKey,
  LeadStatusFilter,
} from "@/components/LeadFilters";
import { LeadList } from "@/components/LeadList";
import { LeadPipeline } from "@/components/LeadPipeline";
import type { PipelineStage, StageCounts } from "@/components/LeadPipeline";
import { LeadSkeleton } from "@/components/LeadSkeleton";

type LeadsPageStatus = "loading" | "success" | "error";

function toSortableDate(value: string): number {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function compareLeads(sort: LeadSortKey) {
  return (a: Lead, b: Lead): number => {
    if (sort === "newest") {
      return toSortableDate(b.discovered_at) - toSortableDate(a.discovered_at);
    }
    if (sort === "oldest") {
      return toSortableDate(a.discovered_at) - toSortableDate(b.discovered_at);
    }
    if (sort === "name-asc") {
      return a.business_name.localeCompare(b.business_name);
    }
    if (sort === "name-desc") {
      return b.business_name.localeCompare(a.business_name);
    }
    if (sort === "rating") {
      return (b.rating ?? Number.NEGATIVE_INFINITY) - (a.rating ?? Number.NEGATIVE_INFINITY);
    }
    return b.review_count - a.review_count;
  };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState<LeadsPageStatus>("loading");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatusFilter>("all");
  const [researchFilter, setResearchFilter] = useState<LeadResearchFilter>("all");
  const [emailFilter, setEmailFilter] = useState<LeadEmailFilter>("all");
  const [contactFilter, setContactFilter] = useState<LeadContactFilter>("all");
  const [sortKey, setSortKey] = useState<LeadSortKey>("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [researchingIds, setResearchingIds] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{ mode: "selected" | "all" } | null>(null);
  const [deleting, setDeleting] = useState<"selected" | "all" | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [bulkResearching, setBulkResearching] = useState(false);
  const deleteInFlightRef = useRef(false);
  const refreshInFlightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const requestLeads = useCallback(() => {
    if (refreshInFlightRef.current) {
      return;
    }
    refreshInFlightRef.current = true;
    getLeads().then(
      (response: LeadsResponse) => {
        if (!mountedRef.current) {
          return;
        }
        setLeads(response.leads);
        setCount(response.count);
        setStatus("success");
      },
      () => {
        if (!mountedRef.current) {
          return;
        }
        setStatus("error");
      },
    ).finally(() => {
      refreshInFlightRef.current = false;
    });
  }, []);

  useEffect(() => {
    requestLeads();
  }, [requestLeads]);

  function handleRefresh() {
    if (refreshInFlightRef.current) {
      return;
    }
    setStatus("loading");
    requestLeads();
  }

  function toggleSelect(id: string) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setResearchFilter("all");
    setEmailFilter("all");
    setContactFilter("all");
    setSortKey("newest");
  }

  async function handleCardResearch(lead: Lead) {
    if (researchingIds.has(lead.id)) {
      return;
    }
    setResearchingIds((previous) => new Set(previous).add(lead.id));
    try {
      await triggerResearch(lead.id);
      requestLeads();
    } finally {
      if (mountedRef.current) {
        setResearchingIds((previous) => {
          const next = new Set(previous);
          next.delete(lead.id);
          return next;
        });
      }
    }
  }

  async function runDelete(mode: "selected" | "all") {
    if (deleteInFlightRef.current) {
      return;
    }
    const ids = mode === "selected" ? [...selectedIds] : [];
    if (mode === "selected" && ids.length === 0) {
      return;
    }
    deleteInFlightRef.current = true;
    setDeleting(mode);
    setDeleteError(null);
    try {
      if (mode === "selected") {
        await deleteLeads(ids);
      } else {
        await deleteAllLeads();
      }
      setSelectedIds(new Set());
      if (mode === "all") {
        resetFilters();
      }
      setDeleteDialog(null);
      setStatus("loading");
      requestLeads();
    } catch {
      setDeleteError(
        mode === "all"
          ? "Couldn't delete all leads. Your leads are unchanged — please try again."
          : "Couldn't delete the selected leads. Your leads are unchanged — please try again.",
      );
    } finally {
      deleteInFlightRef.current = false;
      if (mountedRef.current) {
        setDeleting(null);
      }
    }
  }

  const loading = status === "loading";

  const visibleLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = leads.filter((lead) => {
      if (statusFilter !== "all" && lead.lead_status !== statusFilter) {
        return false;
      }
      if (researchFilter !== "all" && lead.research_status !== researchFilter) {
        return false;
      }
      if (emailFilter !== "all" && lead.email_status !== emailFilter) {
        return false;
      }
      if (contactFilter !== "all" && lead.contact_email_status !== contactFilter) {
        return false;
      }
      if (query) {
        const haystack = [
          lead.business_name,
          lead.category,
          lead.address,
          lead.phone,
          lead.contact_email ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });
    return [...filtered].sort(compareLeads(sortKey));
  }, [leads, search, statusFilter, researchFilter, emailFilter, contactFilter, sortKey]);

  const visibleCount = visibleLeads.length;
  const selectedCount = selectedIds.size;
  const allVisibleSelected =
    visibleLeads.length > 0 && visibleLeads.every((lead) => selectedIds.has(lead.id));

  const stageCounts: StageCounts = {
    all: leads.length,
    new: leads.filter((lead) => lead.lead_status === "NEW").length,
    researching: leads.filter((lead) => lead.research_status === "IN_PROGRESS").length,
    ready: leads.filter(
      (lead) => lead.research_status === "COMPLETED" && lead.contact_email_status === "FOUND",
    ).length,
    drafted: leads.filter((lead) => lead.email_status === "DRAFTED").length,
    approved: leads.filter((lead) => lead.email_status === "APPROVED").length,
    sent: leads.filter((lead) => lead.email_status === "SENT").length,
  };

  const filtersClear =
    search === "" &&
    statusFilter === "all" &&
    researchFilter === "all" &&
    emailFilter === "all" &&
    contactFilter === "all";

  function activeStage(): PipelineStage | null {
    if (!filtersClear) {
      if (
        search === "" &&
        statusFilter === "NEW" &&
        researchFilter === "all" &&
        emailFilter === "all" &&
        contactFilter === "all"
      ) {
        return "new";
      }
      if (
        search === "" &&
        statusFilter === "all" &&
        researchFilter === "IN_PROGRESS" &&
        emailFilter === "all" &&
        contactFilter === "all"
      ) {
        return "researching";
      }
      if (
        search === "" &&
        statusFilter === "all" &&
        researchFilter === "COMPLETED" &&
        emailFilter === "all" &&
        contactFilter === "FOUND"
      ) {
        return "ready";
      }
      if (
        search === "" &&
        statusFilter === "all" &&
        researchFilter === "all" &&
        emailFilter === "DRAFTED" &&
        contactFilter === "all"
      ) {
        return "drafted";
      }
      if (
        search === "" &&
        statusFilter === "all" &&
        researchFilter === "all" &&
        emailFilter === "APPROVED" &&
        contactFilter === "all"
      ) {
        return "approved";
      }
      if (
        search === "" &&
        statusFilter === "all" &&
        researchFilter === "all" &&
        emailFilter === "SENT" &&
        contactFilter === "all"
      ) {
        return "sent";
      }
      return null;
    }
    return "all";
  }

  function applyStage(stage: PipelineStage) {
    resetFilters();
    if (stage === "new") {
      setStatusFilter("NEW");
    } else if (stage === "researching") {
      setResearchFilter("IN_PROGRESS");
    } else if (stage === "ready") {
      setResearchFilter("COMPLETED");
      setContactFilter("FOUND");
    } else if (stage === "drafted") {
      setEmailFilter("DRAFTED");
    } else if (stage === "approved") {
      setEmailFilter("APPROVED");
    } else if (stage === "sent") {
      setEmailFilter("SENT");
    }
  }

  const hasActiveFilters = !filtersClear;

  function selectAllVisible() {
    setSelectedIds(new Set(visibleLeads.map((lead) => lead.id)));
  }

  function isResearchStartable(lead: Lead) {
    return (
      lead.research_status !== "COMPLETED" &&
      lead.research_status !== "IN_PROGRESS" &&
      !researchingIds.has(lead.id)
    );
  }

  async function handleBulkResearch() {
    const targets = visibleLeads.filter(
      (lead) => selectedIds.has(lead.id) && isResearchStartable(lead),
    );
    if (targets.length === 0 || bulkResearching) {
      return;
    }
    setBulkResearching(true);
    setResearchingIds((previous) => {
      const next = new Set(previous);
      targets.forEach((lead) => next.add(lead.id));
      return next;
    });
    try {
      await Promise.allSettled(targets.map((lead) => triggerResearch(lead.id)));
      requestLeads();
    } finally {
      if (mountedRef.current) {
        setResearchingIds((previous) => {
          const next = new Set(previous);
          targets.forEach((lead) => next.delete(lead.id));
          return next;
        });
        setBulkResearching(false);
      }
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 sm:px-8 lg:px-12">
      <header className="flex items-center justify-between gap-6 border-b border-line py-6 sm:py-7">
        <Link href="/" className="flex min-h-11 items-center gap-3 rounded-xl">
          <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" focusable="false">
            <rect width="36" height="36" rx="11" fill="var(--primary)" />
            <path
              d="M11 24.5c4.5 0 5-6.5 9.5-6.5H25"
              fill="none"
              stroke="var(--on-primary)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx="11" cy="24.5" r="2.1" fill="var(--on-primary)" />
            <circle cx="25" cy="18" r="2.1" fill="var(--on-primary)" />
            <circle cx="25" cy="11.2" r="1.6" fill="var(--on-primary)" opacity="0.72" />
          </svg>
          <span>
            <span className="block text-lg font-bold leading-tight tracking-tight">LeadPilot</span>
            <span className="block text-sm leading-snug text-muted">AI lead intelligence</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
            Prospect Pipeline
          </span>
        </div>
      </header>

      <main className="w-full py-8 sm:py-12" aria-busy={loading || undefined}>
        {/* Page Hero Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                Prospect Pipeline
              </span>
              {!loading && count > 0 && (
                <span className="inline-flex items-center rounded-full border border-line bg-canvas px-2.5 py-0.5 text-xs font-bold text-ink">
                  {count} {count === 1 ? "Lead" : "Leads"}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-ink">
              Prospect Pipeline
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Track, research, and outreach to discovered business leads.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {!loading && leads.length > 0 ? (
              <Link
                href="/"
                className="btn-primary shadow-sm hover:shadow transition-shadow"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Discover Leads
              </Link>
            ) : null}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="btn-secondary"
            >
              <svg
                width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={`mr-1.5 ${loading ? "animate-spin" : ""}`}
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Pipeline Stage Tabs (shown when leads exist) */}
        {!loading && status === "success" && leads.length > 0 ? (
          <LeadPipeline counts={stageCounts} active={activeStage()} onSelect={applyStage} />
        ) : null}

        {/* Filter bar (shown when leads exist) */}
        {status === "success" && leads.length > 0 ? (
          <LeadFilters
            search={search}
            onSearchChange={setSearch}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            research={researchFilter}
            onResearchChange={setResearchFilter}
            email={emailFilter}
            onEmailChange={setEmailFilter}
            contact={contactFilter}
            onContactChange={setContactFilter}
            sort={sortKey}
            onSortChange={setSortKey}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        ) : null}

        {/* Bulk Action Toolbar */}
        {status === "success" && leads.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface/80 p-3 shadow-xs backdrop-blur-xs">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={allVisibleSelected ? clearSelection : selectAllVisible}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-line bg-canvas px-3.5 text-xs font-bold text-muted hover:border-line-strong hover:text-ink transition-colors"
              >
                <span className={`flex h-4 w-4 items-center justify-center rounded border ${allVisibleSelected ? "border-primary bg-primary text-white" : "border-line"}`}>
                  {allVisibleSelected ? "✓" : ""}
                </span>
                {allVisibleSelected ? "Deselect All" : "Select All Visible"}
              </button>

              {selectedCount > 0 ? (
                <>
                  <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">
                    {selectedCount} {selectedCount === 1 ? "lead" : "leads"} selected
                  </span>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-xs font-semibold text-muted hover:text-ink transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkResearch}
                    disabled={bulkResearching || deleting !== null}
                    className="btn-secondary h-9 px-3.5 text-xs font-bold"
                  >
                    {bulkResearching ? "Researching…" : "Research Selected"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setDeleteDialog({ mode: "selected" });
                    }}
                    disabled={deleting !== null}
                    className="btn-destructive h-9 px-3.5 text-xs font-bold"
                  >
                    Delete Selected
                  </button>
                </>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setDeleteDialog({ mode: "all" });
              }}
              disabled={deleting !== null}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-danger hover:bg-red-50 transition-colors sm:ml-auto"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete All Leads
            </button>
          </div>
        ) : null}

        <div className="mt-8">
          {/* Loading Skeleton */}
          {status === "loading" ? (
            <div role="status" aria-label="Loading your leads">
              <LeadSkeleton />
            </div>
          ) : null}

          {/* Error State */}
          {status === "error" ? (
            <div className="status-card" data-tone="error" role="alert">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
                <path d="M10 6.4v4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="10" cy="13.7" r="1.1" fill="currentColor" />
              </svg>
              <div>
                <p className="text-sm font-bold leading-snug">Something went wrong</p>
                <p className="mt-1 text-sm leading-snug">
                  We couldn&apos;t load your leads. Your lead data is safe.
                </p>
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="btn-primary mt-4 max-w-52 h-10 px-5 text-xs font-bold"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : null}

          {/* Empty State Hero (When 0 leads exist) */}
          {status === "success" && leads.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-surface via-surface to-canvas/40 p-8 sm:p-14 text-center shadow-xs">
              <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

              <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[var(--primary-deep)]/20 bg-primary/10 text-primary shadow-[0_12px_24px_-10px_var(--primary-shadow)]">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                  <path d="M11 8v6M8 11h6" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Your Prospect Pipeline is Empty
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                Search businesses in any category and city. LeadPilot will automatically collect verified company information, conduct AI research, find contact emails, and craft personalized outreach drafts.
              </p>

              {/* 3-Step Pipeline Flow Preview */}
              <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 text-left sm:grid-cols-3">
                <div className="rounded-2xl border border-line bg-surface/90 p-5 shadow-xs transition-colors hover:border-line-strong">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-bold">
                    1
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-ink">Find Businesses</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Search any industry & city to find qualified local prospects.
                  </p>
                </div>

                <div className="rounded-2xl border border-line bg-surface/90 p-5 shadow-xs transition-colors hover:border-line-strong">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 text-sm font-bold">
                    2
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-ink">AI Deep Research</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Extract service offerings, reviews, and decision-maker contact emails.
                  </p>
                </div>

                <div className="rounded-2xl border border-line bg-surface/90 p-5 shadow-xs transition-colors hover:border-line-strong">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold">
                    3
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-ink">Personalized Outreach</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    Review AI-tailored cold email pitches ready for one-click approval.
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-10 flex flex-col items-center justify-center gap-3">
                <Link
                  href="/"
                  className="btn-primary h-12 px-8 text-sm font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <span>Start Lead Discovery</span>
                  <span aria-hidden="true" className="ml-1">→</span>
                </Link>
                <p className="text-xs text-muted mt-0.5">
                  Instant automated prospect discovery & enrichment
                </p>
              </div>
            </div>
          ) : null}

          {/* Filter Empty State (When leads exist but filters match 0) */}
          {status === "success" && leads.length > 0 && visibleLeads.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-line bg-surface p-10 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-canvas border border-line text-muted mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-ink">No matching prospects found</h3>
              <p className="mx-auto mt-1.5 max-w-md text-xs text-muted">
                No leads matched your current search and filter combination. Try adjusting or clearing your active filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="btn-secondary mt-5 h-9 px-4 text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : null}

          {/* Leads Grid */}
          {status === "success" && visibleLeads.length > 0 ? (
            <div className="mt-6">
              <LeadList
                leads={visibleLeads}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onResearch={handleCardResearch}
                researchingIds={researchingIds}
              />
            </div>
          ) : null}
        </div>
      </main>

      {/* Delete Dialog */}
      {deleteDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          onClick={() => {
            if (!deleting) {
              setDeleteDialog(null);
            }
          }}
        >
          <div
            className="relative w-full max-w-md rounded-[2rem] border border-line bg-surface p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDeleteDialog(null)}
              className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-canvas hover:text-ink transition-colors"
              aria-label="Close dialog"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <h2 id="delete-dialog-title" className="text-xl font-bold tracking-tight text-ink">
                {deleteDialog.mode === "all"
                  ? "Delete all leads?"
                  : `Delete ${selectedCount} ${selectedCount === 1 ? "lead" : "leads"}?`}
              </h2>
            </div>

            {deleteDialog.mode === "all" ? (
              <div className="mt-4 text-sm leading-relaxed text-muted">
                <p>
                  This will permanently delete all leads currently stored in LeadPilot,
                  including business profiles, research data, emails, and drafts.
                </p>
                <p className="mt-2 font-semibold text-danger">This action cannot be undone.</p>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-muted">
                This will permanently remove the selected leads and all associated
                research and draft data.
              </p>
            )}

            {deleteError ? (
              <p role="alert" className="mt-4 text-sm font-medium leading-snug text-danger">
                {deleteError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteDialog(null)}
                disabled={deleting !== null}
                className="btn-secondary w-full sm:w-auto px-5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => runDelete(deleteDialog.mode)}
                disabled={deleting !== null}
                className="btn-destructive-solid w-full sm:w-auto px-5"
              >
                {deleting !== null
                  ? "Deleting…"
                  : deleteDialog.mode === "all"
                    ? "Delete All Leads"
                    : "Delete Leads"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
