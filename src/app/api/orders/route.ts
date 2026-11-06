import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { createOrder } from "@/lib/order-service";
import { createOrderSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload: unknown = await request.json().catch(() => null);
    const input = createOrderSchema.parse(payload);
    const order = await createOrder(input);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
