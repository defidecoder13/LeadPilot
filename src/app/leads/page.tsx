"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Building2,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
} from "lucide-react";
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
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Floating Glass Navigation Header */}
      <header className="glass-panel mb-8 flex items-center justify-between rounded-2xl border border-white/10 px-5 py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="block text-base font-bold text-white tracking-tight">LeadPilot</span>
            <span className="block text-xs text-slate-400">Prospect Intelligence</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-md shadow-indigo-500/20"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Discover Leads</span>
          </Link>
        </div>
      </header>

      <main className="w-full flex flex-col gap-8" aria-busy={loading || undefined}>
        {/* Title and Top Command Bar */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Database Pipeline
              </span>
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Prospect Directory
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {loading
                ? "Synchronizing pipeline data…"
                : `${visibleCount} ${visibleCount === 1 ? "lead" : "leads"} displayed across your automated workflow.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="btn-secondary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
              <span>{loading ? "Refreshing…" : "Sync Leads"}</span>
            </button>
          </div>
        </div>

        {/* Bento Metric Cards & Filter Dock */}
        {!loading && status === "success" ? (
          <LeadPipeline counts={stageCounts} active={activeStage()} onSelect={applyStage} />
        ) : null}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="mt-2" role="status" aria-label="Loading your leads">
            <LeadSkeleton />
          </div>
        ) : null}

        {/* Error State */}
        {status === "error" ? (
          <div className="glass-panel flex flex-col items-center justify-center rounded-2xl border border-rose-500/25 p-12 text-center" role="alert">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">Pipeline Connection Issue</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-400">
              We couldn&apos;t load your leads from the Neon database. Please verify your connection.
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              className="btn-primary mt-6 rounded-xl px-5 py-2 text-xs font-semibold"
            >
              Retry Connection
            </button>
          </div>
        ) : null}

        {/* Empty State */}
        {status === "success" && leads.length === 0 ? (
          <div className="glass-panel flex flex-col items-center justify-center rounded-2xl border border-white/10 p-12 text-center" role="status">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Building2 className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-white">No prospects discovered yet</h2>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              Launch a Google Places lead discovery query to find targeted businesses, run deep research, and draft personalized outreach.
            </p>
            <Link href="/" className="btn-primary mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold">
              <Plus className="h-4 w-4" />
              <span>Discover Your First Leads</span>
            </Link>
          </div>
        ) : null}

        {/* Filters and Search Bar */}
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

        {/* Floating Batch Action Dock */}
        {status === "success" && leads.length > 0 ? (
          <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={allVisibleSelected ? clearSelection : selectAllVisible}
                className="btn-secondary rounded-lg px-3 py-1.5 text-xs font-semibold"
              >
                {allVisibleSelected ? "Deselect All" : "Select All"}
              </button>

              {selectedCount > 0 ? (
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300">
                  {selectedCount} selected
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {selectedCount > 0 ? (
                <>
                  <button
                    type="button"
                    onClick={handleBulkResearch}
                    disabled={bulkResearching || deleting !== null}
                    className="btn-primary rounded-lg px-3 py-1.5 text-xs font-semibold"
                  >
                    {bulkResearching ? "Researching…" : `Research (${selectedCount})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setDeleteDialog({ mode: "selected" });
                    }}
                    disabled={deleting !== null}
                    className="btn-destructive rounded-lg px-3 py-1.5 text-xs font-semibold"
                  >
                    Delete Selected
                  </button>
                </>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setDeleteError(null);
                  setDeleteDialog({ mode: "all" });
                }}
                disabled={deleting !== null}
                className="btn-destructive-ghost text-xs text-rose-400 hover:text-rose-300"
              >
                Delete All
              </button>
            </div>
          </div>
        ) : null}

        {/* No Filter Results */}
        {status === "success" && leads.length > 0 && visibleLeads.length === 0 ? (
          <div className="glass-panel rounded-2xl border border-white/10 p-8 text-center" role="status">
            <p className="text-base font-bold text-white">No matching prospects found</p>
            <p className="mt-1 text-xs text-slate-400">
              Try adjusting your search criteria or resetting filters.
            </p>
          </div>
        ) : null}

        {/* Lead List Cards Grid */}
        {status === "success" && visibleLeads.length > 0 ? (
          <LeadList
            leads={visibleLeads}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onResearch={handleCardResearch}
            researchingIds={researchingIds}
          />
        ) : null}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-md"
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
            className="glass-panel-elevated w-full max-w-md rounded-2xl border border-white/15 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-dialog-title" className="text-xl font-bold tracking-tight text-white">
              {deleteDialog.mode === "all"
                ? "Delete all stored leads?"
                : `Delete ${selectedCount} selected ${selectedCount === 1 ? "lead" : "leads"}?`}
            </h2>
            <div className="mt-3 text-xs leading-relaxed text-slate-400">
              {deleteDialog.mode === "all" ? (
                <p>
                  This permanently removes all leads, company intelligence, contact discovery data, and email drafts from your Neon database. This action cannot be undone.
                </p>
              ) : (
                <p>
                  This will remove the selected leads and their associated research and email drafts.
                </p>
              )}
            </div>

            {deleteError ? (
              <p role="alert" className="mt-3 text-xs font-semibold text-rose-400">
                {deleteError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteDialog(null)}
                disabled={deleting !== null}
                className="btn-secondary rounded-xl px-4 py-2 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => runDelete(deleteDialog.mode)}
                disabled={deleting !== null}
                className="btn-destructive-solid rounded-xl px-5 py-2 text-xs font-semibold"
              >
                {deleting !== null
                  ? "Deleting…"
                  : deleteDialog.mode === "all"
                    ? "Delete All Leads"
                    : "Confirm Deletion"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
