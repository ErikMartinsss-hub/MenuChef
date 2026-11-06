import { NextResponse } from "next/server";
import { apiError, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { serializePaymentSettings } from "@/lib/serializers";
import { updatePaymentSettingsSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: { paymentSettings: true },
    });

    if (!tenant) return apiError("Restaurante não encontrado.", 404);
    return NextResponse.json({ payment: serializePaymentSettings(tenant.paymentSettings) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const payload: unknown = await request.json().catch(() => null);
    const input = updatePaymentSettingsSchema.parse(payload);

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: { paymentSettings: true },
    });

    if (!tenant) return apiError("Restaurante não encontrado.", 404);

    const payment = await prisma.tenantPaymentSettings.upsert({
      where: { tenantId: tenant.id },
      create: {
        tenantId: tenant.id,
        provider: "MANUAL",
        pixEnabled: input.pixEnabled,
        cashEnabled: input.cashEnabled,
        cardEnabled: input.cardEnabled,
        pixKeyType: input.pixKeyType ?? null,
        pixKey: input.pixKey ?? null,
        pixHolderName: input.pixHolderName ?? null,
        pixCity: input.pixCity ?? null,
        instructions: input.instructions ?? null,
      },
      update: {
        provider: "MANUAL",
        pixEnabled: input.pixEnabled,
        cashEnabled: input.cashEnabled,
        cardEnabled: input.cardEnabled,
        pixKeyType: input.pixKeyType ?? null,
        pixKey: input.pixKey ?? null,
        pixHolderName: input.pixHolderName ?? null,
        pixCity: input.pixCity ?? null,
        instructions: input.instructions ?? null,
      },
    });

    return NextResponse.json({ payment: serializePaymentSettings(payment) });
  } catch (error) {
    return handleApiError(error);
  }
}
