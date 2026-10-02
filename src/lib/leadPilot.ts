import { LeadDiscoveryError, getLeads } from "./leadDiscovery";
import type { Lead } from "./leadDiscovery";

export type { Lead };

export type WebhookResult = {
  success: boolean;
  status?: string;
  reason?: string;
  message?: string;
  lead_id?: string;
  business_name?: string;
  research_status?: string;
  email_status?: string;
  contact_email?: string | null;
  contact_email_source?: string | null;
  contact_email_status?: string;
  subject?: string | null;
  body?: string | null;
  deleted_count?: number;
};

export type DeleteLeadsResult = {
  success: boolean;
  status?: string;
  deleted_count: number;
  message?: string;
};

export type DraftEmailInput = {
  lead_id: string;
  offer: string;
  sender_name: string;
  sender_company: string;
  sender_role: string;
  cta: string;
};

const ACTION_TIMEOUT_MS = 300000;
const QUICK_TIMEOUT_MS = 120000;

function resolveWebhookUrl(specificUrl: string | undefined, path: string): string | undefined {
  if (specificUrl) return specificUrl;
  const baseUrl = process.env.NEXT_PUBLIC_N8N_BASE_URL?.replace(/\/+$/, "");
  return baseUrl ? `${baseUrl}/webhook/${path}` : undefined;
}

const RESEARCH_URL = resolveWebhookUrl(process.env.NEXT_PUBLIC_N8N_RESEARCH_WEBHOOK_URL, "research-lead");
const CONTACT_EMAIL_URL = resolveWebhookUrl(process.env.NEXT_PUBLIC_N8N_CONTACT_EMAIL_WEBHOOK_URL, "find-contact-email");
const DRAFT_EMAIL_URL = resolveWebhookUrl(process.env.NEXT_PUBLIC_N8N_DRAFT_EMAIL_WEBHOOK_URL, "draft-email");
const APPROVE_EMAIL_URL = resolveWebhookUrl(process.env.NEXT_PUBLIC_N8N_APPROVE_EMAIL_WEBHOOK_URL, "approve-email");
const SEND_EMAIL_URL = resolveWebhookUrl(process.env.NEXT_PUBLIC_N8N_SEND_EMAIL_WEBHOOK_URL, "send-approved-email");
const DELETE_LEADS_URL = resolveWebhookUrl(process.env.NEXT_PUBLIC_N8N_DELETE_LEADS_WEBHOOK_URL, "delete-leads");
const UPDATE_DRAFT_URL = resolveWebhookUrl(process.env.NEXT_PUBLIC_N8N_UPDATE_EMAIL_DRAFT_WEBHOOK_URL, "update-email-draft");

export type UpdateDraftResult = {
  success: boolean;
  status?: string;
  email_status?: string;
  lead_id?: string;
  email_subject: string;
  email_body: string;
  message?: string;
};

function requireUrl(value: string | undefined, label: string): string {
  if (!value) {
    throw new LeadDiscoveryError(`${label} is not configured.`, "configuration");
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toResult(data: unknown): WebhookResult {
  if (!isRecord(data)) {
    throw new LeadDiscoveryError("Workflow returned an unexpected response.", "http");
  }
  const success = data.success;
  if (typeof success !== "boolean") {
    throw new LeadDiscoveryError("Workflow returned an unexpected response.", "http");
  }
  const pick = (key: string): string | undefined =>
    typeof data[key] === "string" ? (data[key] as string) : undefined;
  const pickNullable = (key: string): string | null | undefined =>
    data[key] === null || data[key] === undefined
      ? (data[key] as null | undefined)
      : typeof data[key] === "string"
        ? (data[key] as string)
        : undefined;
  const pickNumber = (key: string): number | undefined =>
    typeof data[key] === "number" && Number.isFinite(data[key])
      ? (data[key] as number)
      : undefined;
  return {
    success,
    status: pick("status"),
    reason: pick("reason"),
    message: pick("message"),
    lead_id: pick("lead_id"),
    business_name: pick("business_name"),
    research_status: pick("research_status"),
    email_status: pick("email_status"),
    contact_email: pickNullable("contact_email"),
    contact_email_source: pickNullable("contact_email_source"),
    contact_email_status: pick("contact_email_status"),
    subject: pickNullable("subject") ?? pickNullable("email_subject"),
    body: pickNullable("body") ?? pickNullable("email_body"),
    deleted_count: pickNumber("deleted_count"),
  };
}

async function postWebhook(
  url: string,
  payload: Record<string, unknown>,
  opLabel: string,
  timeoutMs: number,
): Promise<WebhookResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) {
      let data: unknown;
      try {
        data = await response.json();
      } catch {
        data = undefined;
      }
      if (isRecord(data) && typeof data.success === "boolean") {
        return toResult(data);
      }
      throw new LeadDiscoveryError(
        `${opLabel} failed with status ${response.status}.`,
        "http",
        response.status,
      );
    }
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new LeadDiscoveryError(
        `${opLabel} returned an unreadable response.`,
        "http",
        response.status,
      );
    }
    return toResult(data);
  } catch (error) {
    if (error instanceof LeadDiscoveryError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new LeadDiscoveryError(`${opLabel} timed out. Please try again.`, "timeout");
    }
    throw new LeadDiscoveryError(`${opLabel} could not be reached. Please try again.`, "network");
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getLead(id: string): Promise<Lead | undefined> {
  const response = await getLeads();
  return response.leads.find((lead) => lead.id === id);
}

export function triggerResearch(leadId: string): Promise<WebhookResult> {
  return postWebhook(
    requireUrl(RESEARCH_URL, "Company research"),
    { lead_id: leadId },
    "Company research",
    ACTION_TIMEOUT_MS,
  );
}

export function findContactEmail(leadId: string): Promise<WebhookResult> {
  return postWebhook(
    requireUrl(CONTACT_EMAIL_URL, "Contact email discovery"),
    { lead_id: leadId },
    "Contact email discovery",
    ACTION_TIMEOUT_MS,
  );
}

export function draftEmail(input: DraftEmailInput): Promise<WebhookResult> {
  return postWebhook(
    requireUrl(DRAFT_EMAIL_URL, "Email generation"),
    { ...input },
    "Email generation",
    ACTION_TIMEOUT_MS,
  );
}

export function approveEmail(leadId: string): Promise<WebhookResult> {
  return postWebhook(
    requireUrl(APPROVE_EMAIL_URL, "Email approval"),
    { lead_id: leadId },
    "Email approval",
    QUICK_TIMEOUT_MS,
  );
}

export function sendApprovedEmail(leadId: string): Promise<WebhookResult> {
  return postWebhook(
    requireUrl(SEND_EMAIL_URL, "Email sending"),
    { lead_id: leadId },
    "Email sending",
    QUICK_TIMEOUT_MS,
  );
}

function toDeleteResult(result: WebhookResult, opLabel: string): DeleteLeadsResult {
  if (!result.success) {
    throw new LeadDiscoveryError(
      result.message ?? `${opLabel} did not complete.`,
      "http",
    );
  }
  if (typeof result.deleted_count !== "number") {
    throw new LeadDiscoveryError(
      `${opLabel} returned an unexpected response.`,
      "http",
    );
  }
  return {
    success: true,
    status: result.status,
    deleted_count: result.deleted_count,
    message: result.message,
  };
}

export async function deleteLeads(ids: string[]): Promise<DeleteLeadsResult> {
  const result = await postWebhook(
    requireUrl(DELETE_LEADS_URL, "Lead deletion"),
    { lead_ids: ids },
    "Lead deletion",
    QUICK_TIMEOUT_MS,
  );
  return toDeleteResult(result, "Lead deletion");
}

export async function deleteAllLeads(): Promise<DeleteLeadsResult> {
  const result = await postWebhook(
    requireUrl(DELETE_LEADS_URL, "Lead deletion"),
    { delete_all: true },
    "Lead deletion",
    QUICK_TIMEOUT_MS,
  );
  return toDeleteResult(result, "Lead deletion");
}

export async function updateEmailDraft(
  leadId: string,
  emailSubject: string,
  emailBody: string,
): Promise<UpdateDraftResult> {
  const result = await postWebhook(
    requireUrl(UPDATE_DRAFT_URL, "Email draft update"),
    { lead_id: leadId, email_subject: emailSubject, email_body: emailBody },
    "Email draft update",
    QUICK_TIMEOUT_MS,
  );
  if (!result.success) {
    throw new LeadDiscoveryError(
      result.message ?? "Email draft update did not complete.",
      "http",
    );
  }
  if (typeof result.subject !== "string" || typeof result.body !== "string") {
    throw new LeadDiscoveryError(
      "Email draft update returned an unexpected response.",
      "http",
    );
  }
  return {
    success: true,
    status: result.status,
    email_status: result.email_status,
    lead_id: result.lead_id,
    email_subject: result.subject,
    email_body: result.body,
    message: result.message,
  };
}
