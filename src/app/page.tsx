import Link from "next/link";
import { Sparkles, Building2, MapPin, Zap, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { LeadDiscoveryForm } from "@/components/LeadDiscoveryForm";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Floating Glass Header */}
      <header className="glass-panel mb-8 flex items-center justify-between rounded-2xl border border-white/10 px-5 py-4">
        <div className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="block text-base font-bold text-white tracking-tight">LeadPilot</span>
            <span className="block text-xs text-slate-400">Autonomous B2B Intelligence</span>
          </div>
        </div>

        <nav aria-label="Primary" className="flex items-center gap-3">
          <Link
            href="/leads"
            className="btn-primary group inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold shadow-md shadow-indigo-500/20"
          >
            <span>View Leads Pipeline</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </nav>
      </header>

      {/* Main Hero & Console Split */}
      <main className="my-auto py-6 sm:py-10">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Left Hero Column */}
          <section aria-labelledby="hero-heading" className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>Google Places + n8n + Neon Engine</span>
            </div>

            <h1
              id="hero-heading"
              className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Find Businesses. <br />
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
                Automate Cold Outreach.
              </span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
              Target any business niche anywhere in the world. LeadPilot extracts place data,
              discovers verified decision-maker emails, synthesizes deep company intelligence dossiers,
              and drafts personalized outreach campaigns.
            </p>

            {/* Feature Pillars */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
                <Building2 className="h-4 w-4 text-indigo-400 flex-none" />
                <span className="text-xs font-medium text-slate-300">Live Google Places Discovery</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
                <Zap className="h-4 w-4 text-cyan-400 flex-none" />
                <span className="text-xs font-medium text-slate-300">Autonomous AI Intelligence</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
                <Mail className="h-4 w-4 text-emerald-400 flex-none" />
                <span className="text-xs font-medium text-slate-300">Verified Contact Email Extraction</span>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
                <ShieldCheck className="h-4 w-4 text-purple-400 flex-none" />
                <span className="text-xs font-medium text-slate-300">Human-in-the-Loop Email Approval</span>
              </div>
            </div>
          </section>

          {/* Right Lead Discovery Console */}
          <section aria-labelledby="lead-form-heading" className="w-full">
            <div className="glass-panel-elevated relative overflow-hidden rounded-3xl border border-white/15 p-6 sm:p-8 glow-indigo shadow-2xl">
              <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -left-20 -bottom-20 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl" />

              <div className="relative mb-6">
                <div className="flex items-center justify-between">
                  <h2 id="lead-form-heading" className="text-xl font-bold text-white tracking-tight">
                    Start Lead Discovery
                  </h2>
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300">
                    n8n Webhook
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Configure search parameters below to query Google Places and seed your pipeline.
                </p>
              </div>

              <div className="relative">
                <LeadDiscoveryForm />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
