import { randomUUID, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getServerEnv } from "@/lib/env";
import {
  qualificationInputSchema,
  qualifyProspect,
} from "@/lib/services/n8n-service";

const MAX_BODY_SIZE = 16_384;

function isAuthorized(request: Request) {
  const env = getServerEnv();
  if (env.DEMO_MODE === "true") return true;
  const provided = request.headers.get("x-action-token");
  if (!provided || !env.APP_ACTION_TOKEN) return false;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(env.APP_ACTION_TOKEN);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export async function POST(request: Request) {
  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_BODY_SIZE) {
    return NextResponse.json(
      { error: { code: "PAYLOAD_TOO_LARGE", message: "Requête trop volumineuse." } },
      { status: 413 },
    );
  }
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Action non autorisée." } },
      { status: 401 },
    );
  }

  const correlationId = request.headers.get("x-correlation-id") ?? randomUUID();
  try {
    const input = qualificationInputSchema.parse(await request.json());
    const result = await qualifyProspect(input, correlationId);
    return NextResponse.json({ data: result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof ZodError) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "Les données fournies sont invalides." } },
        { status: 400 },
      );
    }
    console.error("Prospect qualification failed", { correlationId, error: error instanceof Error ? error.message : "UNKNOWN" });
    return NextResponse.json(
      { error: { code: "QUALIFICATION_FAILED", message: "La qualification est temporairement indisponible.", correlationId } },
      { status: 503 },
    );
  }
}
