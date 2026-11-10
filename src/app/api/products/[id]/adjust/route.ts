import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, rejectOversizedRequest, rejectRateLimited } from "@/lib/http";
import { getOrganizationId } from "@/lib/orchestra";
import { createServiceClient } from "@/lib/supabase/server";

const inputSchema = z.object({
  delta: z.coerce.number().int().min(-100_000).max(100_000).refine((value) => value !== 0),
  reason: z.string().trim().min(2).max(500),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const rejection = rejectOversizedRequest(request) ?? rejectRateLimited(request, "stock-adjust", 40);
  if (rejection) return rejection;
  const correlationId = randomUUID();
  try {
    const productId = z.coerce.number().int().positive().parse((await context.params).id);
    const input = inputSchema.parse(await request.json());
    const organizationId = await getOrganizationId();
    const { data, error } = await createServiceClient().rpc("orchestra_adjust_stock", {
      p_organization_id: organizationId,
      p_product_id: productId,
      p_quantity_delta: input.delta,
      p_reason: input.reason,
      p_correlation_id: correlationId,
    });
    if (error) throw error;
    return NextResponse.json({ data, correlationId });
  } catch (error) {
    return apiError(error, "STOCK_ADJUST_FAILED", correlationId);
  }
}
