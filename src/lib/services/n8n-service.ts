import { z } from "zod";
import { getServerEnv } from "@/lib/env";

export const qualificationInputSchema = z.object({
  company: z.string().trim().min(2).max(160),
  sector: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(120).optional(),
});

export type QualificationInput = z.infer<typeof qualificationInputSchema>;

const n8nQualificationSchema = z.object({
  leads: z.array(
    z.object({
      company: z.string(),
      score: z.coerce.number().min(0).max(100),
      tier: z.string(),
      reasoning: z.string(),
      hooks: z.array(z.string()).default([]),
    }),
  ),
  count: z.number(),
  generatedAt: z.string(),
});

export type QualificationResult = {
  correlationId: string;
  origin: "demo" | "n8n";
  score: number;
  tier: "cold" | "warm" | "hot";
  reasoning: string;
  hooks: string[];
};

function buildDemoResult(
  input: QualificationInput,
  correlationId: string,
): QualificationResult {
  const seed = [...`${input.company}:${input.sector}:${input.city ?? ""}`].reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
  const score = 55 + (seed % 36);
  return {
    correlationId,
    origin: "demo",
    score,
    tier: score >= 80 ? "hot" : score >= 60 ? "warm" : "cold",
    reasoning:
      "Score de démonstration calculé localement. Aucun fournisseur IA ni workflow n8n n’a été appelé.",
    hooks: [
      `Réduire les tâches manuelles dans le secteur ${input.sector}.`,
      `Centraliser le suivi commercial de ${input.company}.`,
    ],
  };
}

export async function qualifyProspect(
  input: QualificationInput,
  correlationId: string,
): Promise<QualificationResult> {
  const env = getServerEnv();
  if (env.DEMO_MODE === "true") return buildDemoResult(input, correlationId);

  if (
    env.ENABLE_N8N_QUALIFICATION !== "true" ||
    !env.N8N_BASE_URL ||
    !env.N8N_API_KEY ||
    !env.N8N_PROSPECT_SEARCH_WEBHOOK_PATH
  ) {
    throw new Error("N8N_QUALIFICATION_NOT_CONFIGURED");
  }

  const endpoint = new URL(env.N8N_PROSPECT_SEARCH_WEBHOOK_PATH, env.N8N_BASE_URL);
  if (endpoint.origin !== new URL(env.N8N_BASE_URL).origin) {
    throw new Error("N8N_ENDPOINT_ORIGIN_MISMATCH");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": env.N8N_API_KEY,
      "X-Correlation-Id": correlationId,
    },
    body: JSON.stringify({
      mode: "company",
      company: input.company,
      sector: input.sector,
      city: input.city,
      maxResults: 1,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) throw new Error(`N8N_HTTP_${response.status}`);
  const payload = n8nQualificationSchema.parse(await response.json());
  const lead = payload.leads[0];
  if (!lead) throw new Error("N8N_EMPTY_QUALIFICATION");

  const normalizedScore = Math.round(lead.score);
  return {
    correlationId,
    origin: "n8n",
    score: normalizedScore,
    tier: normalizedScore >= 80 ? "hot" : normalizedScore >= 60 ? "warm" : "cold",
    reasoning: lead.reasoning,
    hooks: lead.hooks.slice(0, 3),
  };
}
