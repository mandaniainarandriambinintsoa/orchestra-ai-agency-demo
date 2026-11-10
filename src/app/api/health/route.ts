import { NextResponse } from "next/server";
import { getPublicIntegrationStatus } from "@/lib/env";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "orchestra-dashboard",
      integrations: getPublicIntegrationStatus(),
      checkedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
