import "server-only";

import { createServiceClient } from "@/lib/supabase/server";

const ORGANIZATION_SLUG = "orchestra-demo";

export async function getOrganizationId() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("orchestra_organizations")
    .select("id")
    .eq("slug", ORGANIZATION_SLUG)
    .single();

  if (error || !data) throw new Error("ORGANIZATION_NOT_FOUND");
  return Number(data.id);
}

export function toIsoNow() {
  return new Date().toISOString();
}
