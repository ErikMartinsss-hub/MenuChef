import { NextResponse } from "next/server";
import { apiError, handleApiError } from "@/lib/api";
import { getTenants } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const tenants = await getTenants();
    return NextResponse.json({ tenants });
  } catch (error) {
    return handleApiError(error);
  }
}

export function OPTIONS() {
  return apiError("Método não permitido", 405);
}
