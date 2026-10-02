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
        <nav aria-label="Primary">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted hover:border-line-strong hover:text-ink"
          >
            Discover Leads
          </Link>
        </nav>
      </header>

      <main className="w-full py-10 sm:py-14" aria-busy={loading || undefined}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h1 className="text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Leads</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              Your prospect pipeline. Discover, research, and prepare personalized outreach.
            </p>
            <p className="mt-1 text-sm text-muted" role="status">
              {loading
                ? "Loading leads…"
                : `${visibleCount} ${visibleCount === 1 ? "lead" : "leads"} found`}
              {!loading && visibleCount !== count ? (
                <span>
                  {" "}
                  · {count} {count === 1 ? "lead" : "leads"} total
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="btn-primary"
            >
              + Discover leads
            </Link>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="btn-secondary"
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {!loading && status === "success" ? (
          <LeadPipeline counts={stageCounts} active={activeStage()} onSelect={applyStage} />
        ) : null}

        {loading ? (
          <div className="mt-6 animate-pulse" aria-hidden="true">
            <div className="h-4 w-44 rounded-md bg-line" />
            <div className="mt-3 h-11 rounded-xl border border-line bg-surface" />
          </div>
        ) : null}

        {status === "success" && leads.length > 0 ? (
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            {selectedCount === 0 ? (
              <button
                type="button"
                onClick={allVisibleSelected ? clearSelection : selectAllVisible}
                className="inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-bold text-muted hover:text-ink"
              >
                {allVisibleSelected ? "✓ All selected" : "Select all"}
              </button>
            ) : (
              <>
                <p role="status" className="text-sm font-bold text-ink">
                  {selectedCount} {selectedCount === 1 ? "lead" : "leads"} selected
                </p>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-bold text-muted hover:text-ink"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleBulkResearch}
                  disabled={bulkResearching || deleting !== null}
                  className="btn-secondary"
                >
                  {bulkResearching ? "Researching…" : "Research selected"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteDialog({ mode: "selected" });
                  }}
                  disabled={deleting !== null}
                  className="btn-destructive"
                >
                  Delete selected
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setDeleteDialog({ mode: "all" });
              }}
              disabled={deleting !== null}
              className="btn-destructive-ghost sm:ml-auto"
            >
              Delete All Leads
            </button>
          </div>
        ) : null}

        <div className="mt-8">
          {status === "loading" ? (
            <div className="mt-8" role="status" aria-label="Loading your leads">
              <LeadSkeleton />
            </div>
          ) : null}

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
                  className="primary-action mt-4 max-w-52"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : null}

          {status === "success" && leads.length === 0 ? (
            <div className="status-card" role="status">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
                <circle cx="9" cy="9" r="5.8" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M13.6 13.6 17.8 17.8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div>
                <p className="text-lg font-bold tracking-tight">No prospects yet</p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                  Discover businesses and let LeadPilot research them and prepare
                  personalized outreach.
                </p>
                <Link href="/" className="primary-action mt-5 max-w-64">
                  + Discover your first leads
                </Link>
              </div>
            </div>
          ) : null}

          {status === "success" && leads.length > 0 ? (
            <div>
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
            </div>
          ) : null}

          {status === "success" && leads.length > 0 && visibleLeads.length === 0 ? (
            <div className="status-card mt-8" role="status">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
                <circle cx="9" cy="9" r="5.8" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M13.6 13.6 17.8 17.8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div>
                <p className="text-sm font-bold leading-snug">No matching leads</p>
                <p className="mt-1 text-sm leading-snug text-muted">
                  Try changing your search or filters.
                </p>
              </div>
            </div>
          ) : null}

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

      {deleteDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-5"
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
            className="w-full max-w-md rounded-2xl border border-line bg-surface p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-dialog-title" className="text-xl font-bold tracking-tight">
              {deleteDialog.mode === "all"
                ? "Delete all leads?"
                : `Delete ${selectedCount} ${selectedCount === 1 ? "lead" : "leads"}?`}
            </h2>
            {deleteDialog.mode === "all" ? (
              <div className="mt-4 text-sm leading-relaxed text-muted">
                <p>
                  This will permanently delete all leads currently stored in LeadPilot,
                  including:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>business information</li>
                  <li>research data</li>
                  <li>contact email data</li>
                  <li>email drafts</li>
                  <li>approval state</li>
                  <li>sent state metadata</li>
                </ul>
                <p className="mt-2 font-semibold text-ink">This action cannot be undone.</p>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-muted">
                This will permanently remove the selected leads and all stored
                research/email/contact data associated with them.
              </p>
            )}
            {deleteError ? (
              <p role="alert" className="mt-4 text-sm font-medium leading-snug text-danger">
                {deleteError}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setDeleteDialog(null)}
                disabled={deleting !== null}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => runDelete(deleteDialog.mode)}
                disabled={deleting !== null}
                className="btn-destructive-solid"
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
