import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { apiError, rejectOversizedRequest, rejectRateLimited } from "@/lib/http";
import { getOrganizationId, toIsoNow } from "@/lib/orchestra";
import { prospectIntakeSchema, qualifyIncomingProspect } from "@/lib/services/n8n-service";
import { createServiceClient } from "@/lib/supabase/server";

const prospectColumns =
  "id,full_name,company_name,email,status,qualification_score,qualification_summary,qualification_subject,interest_level,qualification_confidence,next_action,request_text,source,last_activity_at,created_at,qualified_at";

export async function GET() {
  try {
    const organizationId = await getOrganizationId();
    const { data, error } = await createServiceClient()
      .from("orchestra_prospects")
      .select(prospectColumns)
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ data: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error, "PROSPECTS_READ_FAILED");
  }
}

export async function POST(request: Request) {
  const rejection = rejectOversizedRequest(request) ?? rejectRateLimited(request, "prospect-create", 8);
  if (rejection) return rejection;

  const correlationId = randomUUID();
  try {
    const input = prospectIntakeSchema.parse(await request.json());
    const organizationId = await getOrganizationId();
    const supabase = createServiceClient();
    const now = toIsoNow();
    const { data: prospect, error: insertError } = await supabase
      .from("orchestra_prospects")
      .insert({
        organization_id: organizationId,
        full_name: input.fullName,
        company_name: input.companyName || "Non renseignée",
        email: input.email,
        request_text: input.request,
        source: "formulaire-web",
        status: "en_cours",
        last_activity_at: now,
      })
      .select(prospectColumns)
      .single();
    if (insertError || !prospect) throw insertError ?? new Error("PROSPECT_INSERT_FAILED");

    await supabase.from("orchestra_activity_logs").insert({
      organization_id: organizationId,
      prospect_id: prospect.id,
      actor_type: "user",
      action: "prospect.created",
      entity_type: "prospect",
      entity_id: prospect.id,
      correlation_id: correlationId,
      metadata: { source: "formulaire-web" },
    });

    try {
      const qualification = await qualifyIncomingProspect(input, Number(prospect.id), correlationId);
      const status = qualification.interested && qualification.score >= 50 ? "qualifie" : "non_qualifie";
      const qualifiedAt = toIsoNow();
      const { data: updated, error: updateError } = await supabase
        .from("orchestra_prospects")
        .update({
          status,
          qualification_score: qualification.score,
          qualification_summary: qualification.summary,
          qualification_subject: qualification.subject,
          qualification_confidence: qualification.confidence,
          interest_level: qualification.interestLevel,
          next_action: qualification.nextAction,
          qualified_at: qualifiedAt,
          last_activity_at: qualifiedAt,
          updated_at: qualifiedAt,
        })
        .eq("organization_id", organizationId)
        .eq("id", prospect.id)
        .select(prospectColumns)
        .single();
      if (updateError || !updated) throw updateError ?? new Error("PROSPECT_UPDATE_FAILED");

      await Promise.all([
        supabase.from("orchestra_workflow_executions").insert({
          organization_id: organizationId,
          prospect_id: prospect.id,
          correlation_id: correlationId,
          status: "succeeded",
          input_summary: { source: "formulaire-web" },
          output_summary: { score: qualification.score, subject: qualification.subject },
          started_at: now,
          finished_at: qualifiedAt,
        }),
        supabase.from("orchestra_activity_logs").insert({
          organization_id: organizationId,
          prospect_id: prospect.id,
          actor_type: "agent",
          actor_ref: "qualification",
          action: "prospect.qualified",
          entity_type: "prospect",
          entity_id: prospect.id,
          correlation_id: correlationId,
          metadata: { score: qualification.score, interestLevel: qualification.interestLevel },
        }),
      ]);

      return NextResponse.json({ data: updated, qualification }, { status: 201 });
    } catch (qualificationError) {
      console.error("PROSPECT_QUALIFICATION_DEFERRED", {
        correlationId,
        message: qualificationError instanceof Error ? qualificationError.message : "UNKNOWN",
      });
      await supabase.from("orchestra_workflow_executions").insert({
        organization_id: organizationId,
        prospect_id: prospect.id,
        correlation_id: correlationId,
        status: "failed",
        input_summary: { source: "formulaire-web" },
        error_code: "QUALIFICATION_UNAVAILABLE",
        started_at: now,
        finished_at: toIsoNow(),
      });
      return NextResponse.json(
        { data: prospect, qualification: null, warning: "Le prospect est enregistré. La qualification IA sera relancée." },
        { status: 202 },
      );
    }
  } catch (error) {
    return apiError(error, "PROSPECT_CREATE_FAILED", correlationId);
  }
}
