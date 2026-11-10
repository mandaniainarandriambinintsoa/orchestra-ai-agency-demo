import "server-only";

import { z } from "zod";
import { getServerEnv } from "@/lib/env";

export const prospectIntakeSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254),
  companyName: z.string().trim().max(180).optional().default(""),
  request: z.string().trim().min(10).max(3_000),
});

export const chatInputSchema = z.object({
  scenario: z.enum(["colis", "dentiste", "garagiste"]),
  sessionId: z.string().trim().min(8).max(120),
  userMessage: z.string().trim().min(1).max(2_000),
});

const qualificationSchema = z.object({
  interested: z.boolean(),
  interestLevel: z.enum(["high", "medium", "low"]),
  subject: z.string().trim().min(2).max(200),
  score: z.coerce.number().int().min(0).max(100),
  confidence: z.coerce.number().int().min(0).max(100),
  summary: z.string().trim().min(2).max(2_000),
  nextAction: z.string().trim().min(2).max(1_000),
  tags: z.array(z.string().trim().min(1).max(60)).max(8).default([]),
});

const chatResponseSchema = z.object({
  reply: z.string().trim().min(1).max(20_000),
  sessionId: z.string(),
  scenario: z.enum(["colis", "dentiste", "garagiste"]),
  generatedAt: z.string(),
});

const personalizeResponseSchema = z.object({
  variants: z.object({
    email: z.object({ subject: z.string(), body: z.string() }),
    inmail: z.object({ subject: z.string(), body: z.string() }),
    connection: z.object({ body: z.string() }),
  }),
  generatedAt: z.string(),
});

function getWebhookConfig(path: string | undefined) {
  const env = getServerEnv();
  const apiKey = env.N8N_WEBHOOK_API_KEY ?? env.N8N_API_KEY;
  if (!env.N8N_BASE_URL || !apiKey || !path) {
    throw new Error("N8N_WEBHOOK_NOT_CONFIGURED");
  }
  const endpoint = new URL(path, env.N8N_BASE_URL);
  if (endpoint.origin !== new URL(env.N8N_BASE_URL).origin) {
    throw new Error("N8N_ENDPOINT_ORIGIN_MISMATCH");
  }
  return { endpoint, apiKey };
}

async function postWebhook(path: string | undefined, payload: unknown, correlationId: string) {
  const { endpoint, apiKey } = getWebhookConfig(path);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
      "X-Correlation-Id": correlationId,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`N8N_HTTP_${response.status}`);
  return response.json() as Promise<unknown>;
}

export async function qualifyIncomingProspect(
  input: z.infer<typeof prospectIntakeSchema>,
  prospectId: number,
  correlationId: string,
) {
  const env = getServerEnv();
  const payload = await postWebhook(
    env.N8N_PROSPECT_QUALIFY_WEBHOOK_PATH,
    { prospectId, ...input },
    correlationId,
  );
  const candidate = z.object({ output: qualificationSchema }).or(qualificationSchema).parse(payload);
  return "output" in candidate ? candidate.output : candidate;
}

export async function runConversation(
  input: z.infer<typeof chatInputSchema>,
  correlationId: string,
) {
  const env = getServerEnv();
  return chatResponseSchema.parse(
    await postWebhook(env.N8N_CHAT_WEBHOOK_PATH, input, correlationId),
  );
}

export async function generateFollowUp(
  lead: { name: string; company: string; email: string; request: string; summary?: string | null },
  correlationId: string,
) {
  const env = getServerEnv();
  return personalizeResponseSchema.parse(
    await postWebhook(
      env.N8N_PERSONALIZE_WEBHOOK_PATH,
      { lead, tone: "consultatif", contexte: "Relance d'un prospect ayant demandé une automatisation IA" },
      correlationId,
    ),
  );
}
