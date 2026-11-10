import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, rejectOversizedRequest, rejectRateLimited } from "@/lib/http";
import { getOrganizationId, toIsoNow } from "@/lib/orchestra";
import { createServiceClient } from "@/lib/supabase/server";

const idSchema = z.coerce.number().int().positive();
const updateSchema = z.object({
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1_000).optional(),
  minimumStock: z.coerce.number().int().min(0).max(1_000_000),
  unitPrice: z.coerce.number().min(0).max(100_000_000).nullable().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const rejection = rejectOversizedRequest(request) ?? rejectRateLimited(request, "product-update", 30);
  if (rejection) return rejection;
  try {
    const id = idSchema.parse((await context.params).id);
    const input = updateSchema.parse(await request.json());
    const organizationId = await getOrganizationId();
    const { data, error } = await createServiceClient()
      .from("orchestra_products")
      .update({
        name: input.name,
        description: input.description || null,
        minimum_stock: input.minimumStock,
        unit_price: input.unitPrice ?? null,
        updated_at: toIsoNow(),
      })
      .eq("organization_id", organizationId)
      .eq("id", id)
      .eq("is_active", true)
      .select("id,sku,name,description,quantity_available,minimum_stock,unit_price,is_active,updated_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    return apiError(error, "PRODUCT_UPDATE_FAILED");
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const rejection = rejectRateLimited(request, "product-archive", 10);
  if (rejection) return rejection;
  try {
    const id = idSchema.parse((await context.params).id);
    const organizationId = await getOrganizationId();
    const { error } = await createServiceClient()
      .from("orchestra_products")
      .update({ is_active: false, updated_at: toIsoNow() })
      .eq("organization_id", organizationId)
      .eq("id", id)
      .eq("is_active", true);
    if (error) throw error;
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiError(error, "PRODUCT_ARCHIVE_FAILED");
  }
}
