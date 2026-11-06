import { NextResponse } from "next/server";
import { apiError, handleApiError } from "@/lib/api";
import { getTenantOrders } from "@/lib/queries";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const allowedStatuses = new Set(["active", "completed", "all"]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status") ?? "active";
    const status = allowedStatuses.has(statusParam)
      ? (statusParam as "active" | "completed" | "all")
      : "active";
    const limit = Number(url.searchParams.get("limit") ?? 120);

    const orders = await getTenantOrders(
      slug,
      status,
      Number.isFinite(limit) ? limit : 120,
    );

    if (!orders) return apiError("Restaurante não encontrado.", 404);
    return NextResponse.json({ orders });
  } catch (error) {
    return handleApiError(error);
  }
}
