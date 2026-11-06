import { NextResponse } from "next/server";
import { apiError, handleApiError } from "@/lib/api";
import { getOrderById } from "@/lib/queries";
import { updateOrderStatus } from "@/lib/order-service";
import { updateOrderStatusSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) return apiError("Pedido não encontrado.", 404);
    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload: unknown = await request.json().catch(() => null);
    const { status } = updateOrderStatusSchema.parse(payload);
    const order = await updateOrderStatus(id, status);
    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
