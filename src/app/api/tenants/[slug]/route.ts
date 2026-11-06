import { NextResponse } from "next/server";
import { apiError, handleApiError } from "@/lib/api";
import { getStorefrontTenant } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const tenant = await getStorefrontTenant(slug);
    if (!tenant) return apiError("Restaurante não encontrado.", 404);
    return NextResponse.json({ tenant });
  } catch (error) {
    return handleApiError(error);
  }
}
