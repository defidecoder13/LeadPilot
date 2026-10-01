"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent, RefObject } from "react";
import Link from "next/link";
import { CountrySelect } from "@/components/CountrySelect";
import { FormField } from "@/components/FormField";
import { SubmitButton } from "@/components/SubmitButton";
import { WorkflowStatus } from "@/components/WorkflowStatus";
import type { WorkflowStatusState } from "@/components/WorkflowStatus";
import { startLeadDiscovery } from "@/lib/leadDiscovery";

type DiscoveryField = "business" | "location" | "country" | "limit";
type DiscoveryValues = Record<DiscoveryField, string>;
type DiscoveryErrors = Partial<Record<DiscoveryField, string>>;

const LEAD_MINIMUM = 1;
const LEAD_MAXIMUM = 100;

const INITIAL_VALUES: DiscoveryValues = {
  business: "",
  location: "",
  country: "India",
  limit: "10",
};

function validateField(field: DiscoveryField, values: DiscoveryValues): string | undefined {
  if (field === "business") {
    if (!values.business.trim()) {
      return "Enter a business or category to search for.";
    }
    return undefined;
  }

  if (field === "location") {
    if (!values.location.trim()) {
      return "Enter the city or area where LeadPilot should search.";
    }
    return undefined;
  }

  if (field === "country") {
    if (!values.country.trim()) {
      return "Choose a country for this search.";
    }
    return undefined;
  }

  const rawLimit = values.limit.trim();
  if (!rawLimit) {
    return "Enter how many leads you want, from 1 to 100.";
  }

  const parsedLimit = Number(rawLimit);
  if (!Number.isFinite(parsedLimit) || !Number.isInteger(parsedLimit)) {
    return "Use a whole number of leads.";
  }

  if (parsedLimit < LEAD_MINIMUM || parsedLimit > LEAD_MAXIMUM) {
    return "Choose between 1 and 100 leads.";
  }

  return undefined;
}

function validateForm(values: DiscoveryValues): DiscoveryErrors {
  const fields: DiscoveryField[] = ["business", "location", "country", "limit"];
  const errors: DiscoveryErrors = {};

  for (const field of fields) {
    const error = validateField(field, values);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

export function LeadDiscoveryForm() {
  const [values, setValues] = useState<DiscoveryValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<DiscoveryErrors>({});
  const [status, setStatus] = useState<WorkflowStatusState>("idle");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const requestInFlightRef = useRef(false);
  const businessRef = useRef<HTMLInputElement | null>(null);
  const locationRef = useRef<HTMLInputElement | null>(null);
  const countryRef = useRef<HTMLSelectElement | null>(null);
  const limitRef = useRef<HTMLInputElement | null>(null);
  const fieldRefs: Record<DiscoveryField, RefObject<HTMLInputElement | HTMLSelectElement | null>> = {
    business: businessRef,
    location: locationRef,
    country: countryRef,
    limit: limitRef,
  };

  function focusField(field: DiscoveryField) {
    fieldRefs[field].current?.focus();
  }

  function updateField(field: DiscoveryField, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }
      const next = { ...previous };
      delete next[field];
      return next;
    });
    if (status !== "idle") {
      setStatus("idle");
    }
    setShowSuccessDialog(false);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    updateField(event.target.name as DiscoveryField, event.target.value);
  }

  function handleValidatedBlur() {
    if (submitAttempted) {
      setErrors(validateForm(values));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlightRef.current || status === "submitting") {
      return;
    }
    setSubmitAttempted(true);
    const nextErrors = validateForm(values);
    setErrors(nextErrors);

    const invalidFields = (Object.keys(nextErrors) as DiscoveryField[]).filter(
      (field) => nextErrors[field],
    );
    if (invalidFields.length > 0) {
      setStatus("idle");
      focusField(invalidFields[0]);
      return;
    }

    requestInFlightRef.current = true;
    setStatus("submitting");
    try {
      await startLeadDiscovery({
        business: values.business.trim(),
        location: values.location.trim(),
        country: values.country.trim(),
        limit: Number(values.limit.trim()),
      });
      setStatus("success");
      setShowSuccessDialog(true);
    } catch {
      setStatus("error");
    } finally {
      requestInFlightRef.current = false;
    }
  }

  return (
    <div id="lead-discovery" className="rounded-[1.75rem] border border-line bg-surface p-6 shadow-[0_32px_70px_-52px_oklch(0.32_0.035_285)] sm:p-8">      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Discovery request</p>
          <h2 id="lead-form-heading" className="mt-2 text-2xl font-bold tracking-tight">
            Start your search
          </h2>
        </div>
        <span aria-hidden="true" className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-primary" />
      </div>

      <form
        noValidate
        onSubmit={handleSubmit}
        aria-busy={status === "submitting" || undefined}
        className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2"
      >
        <FormField
          id="business"
          label="Business / Category"
          error={errors.business}
          required
          className="sm:col-span-2"
        >
          <input
            id="business"
            name="business"
            type="text"
            ref={businessRef}
            value={values.business}
            placeholder="e.g. Dentist, Restaurant, Real Estate Agency"
            autoComplete="off"
            spellCheck={false}
            required
            aria-invalid={errors.business ? true : undefined}
            aria-describedby={errors.business ? "business-error" : undefined}
            onChange={handleInputChange}
            onBlur={handleValidatedBlur}
            className="input-control"
          />
        </FormField>

        <FormField id="location" label="Location" error={errors.location} required className="sm:col-span-2">
          <input
            id="location"
            name="location"
            type="text"
            ref={locationRef}
            value={values.location}
            placeholder="e.g. Kolkata, Mumbai, London"
            autoComplete="address-level2"
            spellCheck={false}
            required
            aria-invalid={errors.location ? true : undefined}
            aria-describedby={errors.location ? "location-error" : undefined}
            onChange={handleInputChange}
            onBlur={handleValidatedBlur}
            className="input-control"
          />
        </FormField>

        <FormField id="country" label="Country" error={errors.country} required>
          <CountrySelect
            id="country"
            value={values.country}
            selectRef={countryRef}
            invalid={Boolean(errors.country)}
            describedBy={errors.country ? "country-error" : undefined}
            onChange={(value) => updateField("country", value)}
            onBlur={handleValidatedBlur}
          />
        </FormField>

        <FormField id="limit" label="Number of Leads" error={errors.limit} required>
          <div className="relative">
            <input
              id="limit"
              name="limit"
              type="number"
              ref={limitRef}
              value={values.limit}
              min={LEAD_MINIMUM}
              max={LEAD_MAXIMUM}
              step={1}
              inputMode="numeric"
              autoComplete="off"
              required
              aria-invalid={errors.limit ? true : undefined}
              aria-describedby={errors.limit ? "limit-error" : undefined}
              onChange={handleInputChange}
              onBlur={handleValidatedBlur}
              className="input-control pr-24"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-12 flex items-center text-sm font-semibold text-muted"
            >
              leads
            </span>
          </div>
        </FormField>

        <div className="sm:col-span-2">
          <SubmitButton status={status} />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Your search will run automatically and the discovered leads will appear in your
            LeadPilot dashboard.
          </p>
        </div>

        <div className="sm:col-span-2">
          <WorkflowStatus status={status} />
        </div>
      </form>
      {showSuccessDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="discovery-success-title"
          onClick={() => setShowSuccessDialog(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-surface p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-sm font-bold text-[var(--success-ink)]" aria-hidden="true">
              ✓
            </p>
            <h2 id="discovery-success-title" className="mt-2 text-xl font-bold tracking-tight">
              Leads generated
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Your search finished and the new leads are ready in your LeadPilot dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/leads" className="primary-action max-w-64">
                View Leads →
              </Link>
              <button
                type="button"
                onClick={() => setShowSuccessDialog(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
