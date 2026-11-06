import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { OrderServiceError } from "@/lib/order-service";

export function apiError(
  message: string,
  status = 400,
  details?: Record<string, string[]>,
) {
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status },
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    const details = error.flatten().fieldErrors as Record<string, string[]>;
    return apiError(
      error.issues[0]?.message ?? "Dados inválidos",
      422,
      details,
    );
  }

  if (error instanceof OrderServiceError) {
    return apiError(error.message, error.status);
  }

  console.error("[api] unhandled error", error);
  return apiError("Erro interno. Tente novamente.", 500);
}
