import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, rejectOversizedRequest, rejectRateLimited } from "@/lib/http";
import { getOrganizationId } from "@/lib/orchestra";
import { createFollowUp } from "@/lib/services/follow-up-service";
import { createServiceClient } from "@/lib/supabase/server";

const inputSchema = z.object({ prospectId: z.coerce.number().int().positive() });

export async function GET() {
  try {
    const organizationId = await getOrganizationId();
    const supabase = createServiceClient();
    const [{ data: followUps, error: followUpError }, { data: prospects, error: prospectError }] =
      await Promise.all([
        supabase
          .from("orchestra_follow_ups")
          .select("id,prospect_id,channel,status,proposed_message,scheduled_for,generation_source,created_at")
          .eq("organization_id", organizationId)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("orchestra_prospects")
          .select("id,full_name,company_name,email,status,last_activity_at")
          .eq("organization_id", organizationId)
          .not("email", "is", null)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);
    if (followUpError) throw followUpError;
    if (prospectError) throw prospectError;
    return NextResponse.json(
      { data: { followUps: followUps ?? [], prospects: prospects ?? [] } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error, "FOLLOW_UPS_READ_FAILED");
  }
}

export async function POST(request: Request) {
  const rejection = rejectOversizedRequest(request) ?? rejectRateLimited(request, "follow-up", 8);
  if (rejection) return rejection;
  try {
    const input = inputSchema.parse(await request.json());
    const data = await createFollowUp(input.prospectId, "manual");
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return apiError(error, "FOLLOW_UP_CREATE_FAILED");
  }
}
