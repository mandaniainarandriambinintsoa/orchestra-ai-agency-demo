import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, rejectOversizedRequest, rejectRateLimited } from "@/lib/http";
import { getOrganizationId } from "@/lib/orchestra";
import { createServiceClient } from "@/lib/supabase/server";

const productInput = z.object({
  sku: z.string().trim().min(2).max(80).regex(/^[A-Za-z0-9_-]+$/),
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1_000).optional(),
  quantity: z.coerce.number().int().min(0).max(1_000_000),
  minimumStock: z.coerce.number().int().min(0).max(1_000_000),
  unitPrice: z.coerce.number().min(0).max(100_000_000).optional(),
});

export async function GET() {
  try {
    const organizationId = await getOrganizationId();
    const { data, error } = await createServiceClient()
      .from("orchestra_products")
      .select("id,sku,name,description,quantity_available,minimum_stock,unit_price,is_active,updated_at")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .order("name")
      .limit(200);
    if (error) throw error;
    return NextResponse.json({ data: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiError(error, "PRODUCTS_READ_FAILED");
  }
}

export async function POST(request: Request) {
  const rejection = rejectOversizedRequest(request) ?? rejectRateLimited(request, "product-create", 10);
  if (rejection) return rejection;
  try {
    const input = productInput.parse(await request.json());
    const organizationId = await getOrganizationId();
    const { data, error } = await createServiceClient()
      .from("orchestra_products")
      .insert({
        organization_id: organizationId,
        sku: input.sku.toUpperCase(),
        name: input.name,
        description: input.description || null,
        quantity_available: input.quantity,
        minimum_stock: input.minimumStock,
        unit_price: input.unitPrice ?? null,
      })
      .select("id,sku,name,description,quantity_available,minimum_stock,unit_price,is_active,updated_at")
      .single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return apiError(error, "PRODUCT_CREATE_FAILED");
  }
}
