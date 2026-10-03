import Link from "next/link";
import { LeadDiscoveryForm } from "@/components/LeadDiscoveryForm";

export default function Home() {
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
        <nav aria-label="Primary" className="flex items-center gap-2.5">
          <Link
            href="/leads"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:border-line-strong hover:text-ink transition-colors"
          >
            <span>Prospect Pipeline</span>
            <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 items-center">
        <div className="grid w-full items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-12">
          <section aria-labelledby="hero-heading" className="max-w-xl">
            <h1 id="hero-heading" className="text-4xl font-bold leading-[1.04] tracking-[-0.03em] sm:text-6xl">
              <span className="block">Find Businesses.</span>
              <span className="block">Build Your Lead List.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Tell LeadPilot what businesses you&rsquo;re looking for and where to find them. Your
              discovery workflow will automatically collect the results.
            </p>
          </section>

          <section aria-labelledby="lead-form-heading" className="w-full">
            <LeadDiscoveryForm />
          </section>
        </div>
      </main>
    </div>
  );
}
