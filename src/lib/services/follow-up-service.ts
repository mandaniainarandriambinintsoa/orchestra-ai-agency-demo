import "server-only";

import { randomUUID } from "node:crypto";
import { getOrganizationId, toIsoNow } from "@/lib/orchestra";
import { generateFollowUp } from "@/lib/services/n8n-service";
import { createServiceClient } from "@/lib/supabase/server";

export async function createFollowUp(prospectId: number, source: "manual" | "cron") {
  const correlationId = randomUUID();
  const organizationId = await getOrganizationId();
  const supabase = createServiceClient();
  const { data: prospect, error: prospectError } = await supabase
    .from("orchestra_prospects")
    .select("id,full_name,company_name,email,request_text,qualification_summary")
    .eq("organization_id", organizationId)
    .eq("id", prospectId)
    .single();
  if (prospectError || !prospect) throw prospectError ?? new Error("PROSPECT_NOT_FOUND");
  if (!prospect.email) throw new Error("PROSPECT_EMAIL_REQUIRED");

  const generated = await generateFollowUp(
    {
      name: prospect.full_name,
      company: prospect.company_name,
      email: prospect.email,
      request: prospect.request_text ?? "",
      summary: prospect.qualification_summary,
    },
    correlationId,
  );
  const message = generated.variants.email.body.trim();
  if (!message) throw new Error("EMPTY_FOLLOW_UP");

  const { data, error } = await supabase
    .from("orchestra_follow_ups")
    .insert({
      organization_id: organizationId,
      prospect_id: prospectId,
      channel: "email",
      status: "pending_approval",
      proposed_message: message,
      generation_source: source,
      scheduled_for: source === "cron" ? toIsoNow() : null,
    })
    .select("id,prospect_id,channel,status,proposed_message,scheduled_for,generation_source,created_at")
    .single();
  if (error) throw error;
  return { followUp: data, subject: generated.variants.email.subject, correlationId };
}
