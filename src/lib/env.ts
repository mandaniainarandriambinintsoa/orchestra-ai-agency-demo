import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));

const serverEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  N8N_BASE_URL: optionalUrl,
  N8N_API_KEY: z.string().optional(),
  N8N_WEBHOOK_SECRET: z.string().optional(),
  N8N_PROSPECT_SEARCH_WEBHOOK_PATH: z.string().optional(),
  APP_ACTION_TOKEN: z.string().min(24).optional(),
  DEMO_MODE: z.enum(["true", "false"]).default("true"),
  ENABLE_N8N_QUALIFICATION: z.enum(["true", "false"]).default("false"),
  ALLOW_EXTERNAL_SIDE_EFFECTS: z.enum(["true", "false"]).default("false"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    N8N_BASE_URL: process.env.N8N_BASE_URL,
    N8N_API_KEY: process.env.N8N_API_KEY,
    N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET,
    N8N_PROSPECT_SEARCH_WEBHOOK_PATH:
      process.env.N8N_PROSPECT_SEARCH_WEBHOOK_PATH,
    APP_ACTION_TOKEN: process.env.APP_ACTION_TOKEN,
    DEMO_MODE: process.env.DEMO_MODE,
    ENABLE_N8N_QUALIFICATION: process.env.ENABLE_N8N_QUALIFICATION,
    ALLOW_EXTERNAL_SIDE_EFFECTS: process.env.ALLOW_EXTERNAL_SIDE_EFFECTS,
  });
}

export function getPublicIntegrationStatus() {
  const env = getServerEnv();
  return {
    mode: env.DEMO_MODE === "true" ? "demo" : "connected",
    supabase:
      Boolean(
        env.NEXT_PUBLIC_SUPABASE_URL &&
          env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      ),
    n8n:
      Boolean(
        env.N8N_BASE_URL &&
          env.N8N_API_KEY &&
          env.N8N_PROSPECT_SEARCH_WEBHOOK_PATH,
      ),
    liveQualification: env.ENABLE_N8N_QUALIFICATION === "true",
    externalSideEffects: env.ALLOW_EXTERNAL_SIDE_EFFECTS === "true",
  } as const;
}
