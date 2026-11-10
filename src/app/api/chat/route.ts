import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { apiError, rejectOversizedRequest, rejectRateLimited } from "@/lib/http";
import { getOrganizationId, toIsoNow } from "@/lib/orchestra";
import { assertN8nChatConfigured, chatInputSchema, runConversation } from "@/lib/services/n8n-service";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const rejection = rejectOversizedRequest(request) ?? rejectRateLimited(request, "chat", 20);
  if (rejection) return rejection;
  const correlationId = randomUUID();

  try {
    const input = chatInputSchema.parse(await request.json());
    assertN8nChatConfigured();
    const organizationId = await getOrganizationId();
    const supabase = createServiceClient();

    let { data: conversation } = await supabase
      .from("orchestra_conversations")
      .select("id,prospect_id")
      .eq("organization_id", organizationId)
      .eq("external_session_id", input.sessionId)
      .maybeSingle();

    if (!conversation) {
      const { data: prospect, error: prospectError } = await supabase
        .from("orchestra_prospects")
        .insert({
          organization_id: organizationId,
          full_name: "Visiteur conversation",
          company_name: `Scénario ${input.scenario}`,
          status: "nouveau",
          request_text: input.userMessage,
          source: "conversation-web",
          last_activity_at: toIsoNow(),
        })
        .select("id")
        .single();
      if (prospectError || !prospect) throw prospectError ?? new Error("CHAT_PROSPECT_FAILED");

      const { data: created, error: conversationError } = await supabase
        .from("orchestra_conversations")
        .insert({
          organization_id: organizationId,
          prospect_id: prospect.id,
          external_session_id: input.sessionId,
          scenario: input.scenario,
          agent_key: "conversation",
          status: "open",
        })
        .select("id,prospect_id")
        .single();
      if (conversationError || !created) throw conversationError ?? new Error("CHAT_CONVERSATION_FAILED");
      conversation = created;
    }

    await supabase.from("orchestra_messages").insert({
      organization_id: organizationId,
      conversation_id: conversation.id,
      direction: "inbound",
      sender_type: "prospect",
      body: input.userMessage,
    });

    const result = await runConversation(input, correlationId);
    await Promise.all([
      supabase.from("orchestra_messages").insert({
        organization_id: organizationId,
        conversation_id: conversation.id,
        direction: "outbound",
        sender_type: "agent",
        body: result.reply,
      }),
      supabase
        .from("orchestra_conversations")
        .update({ updated_at: toIsoNow() })
        .eq("organization_id", organizationId)
        .eq("id", conversation.id),
    ]);
    return NextResponse.json({ data: result });
  } catch (error) {
    return apiError(error, "CHAT_FAILED", correlationId);
  }
}
