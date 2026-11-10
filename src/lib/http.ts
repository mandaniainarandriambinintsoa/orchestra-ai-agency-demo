import { NextResponse } from "next/server";
import { ZodError } from "zod";

const MAX_BODY_SIZE = 16_384;
const windows = new Map<string, { count: number; resetAt: number }>();

export function rejectOversizedRequest(request: Request) {
  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_BODY_SIZE) {
    return NextResponse.json(
      { error: { code: "PAYLOAD_TOO_LARGE", message: "Requête trop volumineuse." } },
      { status: 413 },
    );
  }
  return null;
}

export function rejectRateLimited(request: Request, action: string, limit = 20) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const key = `${action}:${ip}`;
  const now = Date.now();
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + 60_000 });
    return null;
  }
  current.count += 1;
  if (current.count <= limit) return null;
  return NextResponse.json(
    { error: { code: "RATE_LIMITED", message: "Trop de tentatives. Réessayez dans une minute." } },
    { status: 429, headers: { "Retry-After": "60" } },
  );
}

export function apiError(error: unknown, fallbackCode: string, correlationId?: string) {
  if (error instanceof SyntaxError || error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "Les données fournies sont invalides." } },
      { status: 400 },
    );
  }
  const message = error instanceof Error ? error.message : "UNKNOWN";
  console.error(fallbackCode, { correlationId, message });
  return NextResponse.json(
    { error: { code: fallbackCode, message: "Action temporairement indisponible.", correlationId } },
    { status: message.includes("NOT_CONFIGURED") ? 503 : 500 },
  );
}
