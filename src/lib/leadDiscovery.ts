export type LeadDiscoveryPayload = {
  business: string;
  location: string;
  country: string;
  limit: number;
};

export type LeadDiscoveryErrorCode = "configuration" | "http" | "network" | "timeout";

export class LeadDiscoveryError extends Error {
  code: LeadDiscoveryErrorCode;
  status?: number;

  constructor(message: string, code: LeadDiscoveryErrorCode, status?: number) {
    super(message);
    this.name = "LeadDiscoveryError";
    this.code = code;
    this.status = status;
  }
}

const REQUEST_TIMEOUT_MS = 120000;

function getWebhookUrl(): string {
  const webhookUrl =
    process.env.NEXT_PUBLIC_N8N_LEAD_DISCOVERY_WEBHOOK_URL ||
    (process.env.NEXT_PUBLIC_N8N_BASE_URL
      ? `${process.env.NEXT_PUBLIC_N8N_BASE_URL.replace(/\/+$/, "")}/webhook/lead-discovery`
      : undefined);
  if (!webhookUrl) {
    throw new LeadDiscoveryError(
      "Lead discovery is not configured.",
      "configuration",
    );
  }
  return webhookUrl;
}

export async function startLeadDiscovery(payload: LeadDiscoveryPayload): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(getWebhookUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new LeadDiscoveryError(
        `Lead discovery request failed with status ${response.status}.`,
        "http",
        response.status,
      );
    }
  } catch (error) {
    if (error instanceof LeadDiscoveryError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new LeadDiscoveryError("Lead discovery request timed out.", "timeout");
    }
    throw new LeadDiscoveryError("Lead discovery request failed.", "network");
  } finally {
    clearTimeout(timeoutId);
  }
}

export type Lead = {
  id: string;
  place_id: string;
  business_name: string;
  category: string;
  phone: string;
  website: string;
  address: string;
  rating: number | null;
  review_count: number;
  google_maps_url: string;
  source: string;
  discovered_at: string;
  lead_status: string;
  research_status: string;
  research_data: unknown | null;
  contact_email: string | null;
  contact_name: string | null;
  contact_email_source: string | null;
  contact_email_status: string;
  email_status: string;
  email_subject: string | null;
  email_body: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadsResponse = {
  success: boolean;
  count: number;
  leads: Lead[];
};

function getLeadsUrl(): string {
  const leadsUrl =
    process.env.NEXT_PUBLIC_N8N_LEADS_WEBHOOK_URL ||
    (process.env.NEXT_PUBLIC_N8N_BASE_URL
      ? `${process.env.NEXT_PUBLIC_N8N_BASE_URL.replace(/\/+$/, "")}/webhook/leads`
      : undefined);
  if (!leadsUrl) {
    throw new LeadDiscoveryError("Leads retrieval is not configured.", "configuration");
  }
  return leadsUrl;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return fallback;
}

function toNumberValue(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function toNullableString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }
  return null;
}

function normalizeLead(value: unknown): Lead | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const id = toStringValue(value.id).trim();
  const businessName = toStringValue(value.business_name).trim();
  if (!id || !businessName) {
    return undefined;
  }
  return {
    id,
    place_id: toStringValue(value.place_id),
    business_name: businessName,
    category: toStringValue(value.category),
    phone: toStringValue(value.phone),
    website: toStringValue(value.website),
    address: toStringValue(value.address),
    rating: toNullableNumber(value.rating),
    review_count: toNumberValue(value.review_count),
    google_maps_url: toStringValue(value.google_maps_url),
    source: toStringValue(value.source),
    discovered_at: toStringValue(value.discovered_at),
    lead_status: toStringValue(value.lead_status),
    research_status: toStringValue(value.research_status),
    research_data: "research_data" in value ? (value.research_data ?? null) : null,
    contact_email: toNullableString(value.contact_email),
    contact_name: toNullableString(value.contact_name),
    contact_email_source: toNullableString(value.contact_email_source),
    contact_email_status: toStringValue(value.contact_email_status),
    email_status: toStringValue(value.email_status),
    email_subject: toNullableString(value.email_subject),
    email_body: toNullableString(value.email_body),
    created_at: toStringValue(value.created_at),
    updated_at: toStringValue(value.updated_at),
  };
}

function normalizeLeadsResponse(data: unknown, status: number): LeadsResponse {
  if (!isRecord(data)) {
    throw new LeadDiscoveryError("Leads response had an unexpected shape.", "http", status);
  }
  if (typeof data.success !== "boolean") {
    throw new LeadDiscoveryError("Leads response had an unexpected shape.", "http", status);
  }
  if (typeof data.count !== "number" || !Number.isFinite(data.count)) {
    throw new LeadDiscoveryError("Leads response had an unexpected shape.", "http", status);
  }
  if (!Array.isArray(data.leads)) {
    throw new LeadDiscoveryError("Leads response had an unexpected shape.", "http", status);
  }
  const leads: Lead[] = [];
  for (const item of data.leads) {
    const lead = normalizeLead(item);
    if (lead) {
      leads.push(lead);
    }
  }
  return { success: data.success, count: data.count, leads };
}

export async function getLeads(): Promise<LeadsResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(getLeadsUrl(), {
      method: "GET",
      cache: "no-store",
      headers: {
        "ngrok-skip-browser-warning": "1",
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new LeadDiscoveryError(
        `Leads request failed with status ${response.status}.`,
        "http",
        response.status,
      );
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new LeadDiscoveryError("Leads response was not valid JSON.", "http", response.status);
    }
    return normalizeLeadsResponse(data, response.status);
  } catch (error) {
    if (error instanceof LeadDiscoveryError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new LeadDiscoveryError("Leads request timed out.", "timeout");
    }
    throw new LeadDiscoveryError("Leads request failed.", "network");
  } finally {
    clearTimeout(timeoutId);
  }
}
