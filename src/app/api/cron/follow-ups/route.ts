import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/env";
import { apiError } from "@/lib/http";
import { getOrganizationId } from "@/lib/orchestra";
import { createFollowUp } from "@/lib/services/follow-up-service";
import { createServiceClient } from "@/lib/supabase/server";

function isAuthorized(request: Request) {
  const secret = getServerEnv().CRON_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || !provided) return false;
  const expectedBuffer = Buffer.from(secret);
  const providedBuffer = Buffer.from(provided);
  return expectedBuffer.length === providedBuffer.length && timingSafeEqual(expectedBuffer, providedBuffer);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Accès refusé." } }, { status: 401 });
  }
  try {
    const organizationId = await getOrganizationId();
    const threshold = new Date(Date.now() - 3 * 86_400_000).toISOString();
    const { data: candidates, error } = await createServiceClient()
      .from("orchestra_prospects")
      .select("id")
      .eq("organization_id", organizationId)
      .in("status", ["qualifie", "en_cours"])
      .not("email", "is", null)
      .lt("last_activity_at", threshold)
      .order("last_activity_at", { ascending: true })
      .limit(5);
    if (error) throw error;

    const results: { prospectId: number; status: "created" | "failed" }[] = [];
    for (const candidate of candidates ?? []) {
      try {
        await createFollowUp(Number(candidate.id), "cron");
        results.push({ prospectId: Number(candidate.id), status: "created" });
      } catch {
        results.push({ prospectId: Number(candidate.id), status: "failed" });
      }
    }
    return NextResponse.json({ data: results });
  } catch (error) {
    return apiError(error, "FOLLOW_UP_CRON_FAILED");
  }
}
