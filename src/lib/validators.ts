import { OrderStatus, OrderType, PaymentMethod, PaymentStatus, PixKeyType } from "@prisma/client";
import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Informe seu telefone")
  .refine(
    (value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 13;
    },
    { message: "Informe um telefone válido com DDD" },
  );

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
  optionIds: z.array(z.string().min(1)).max(30).default([]),
  notes: z.string().trim().max(240).optional().nullable(),
});

export const createOrderSchema = z
  .object({
    tenantSlug: z.string().trim().min(1, "Restaurante inválido"),
    type: z.nativeEnum(OrderType, { errorMap: () => ({ message: "Tipo de pedido inválido" }) }),
    customerName: z
      .string()
      .trim()
      .min(2, "Informe seu nome")
      .max(80, "Nome muito longo"),
    customerPhone: phoneSchema,
    address: z.string().trim().max(240).optional().nullable(),
    tableNumber: z.string().trim().max(10).optional().nullable(),
    paymentMethod: z.nativeEnum(PaymentMethod, {
      errorMap: () => ({ message: "Forma de pagamento inválida" }),
    }),
    changeFor: z.number().min(0).max(10_000).optional().nullable(),
    notes: z.string().trim().max(500).optional().nullable(),
    items: z
      .array(cartItemSchema)
      .min(1, "Adicione ao menos um item")
      .max(50, "Pedido muito grande"),
  })
  .superRefine((data, ctx) => {
    if (data.type === OrderType.DELIVERY) {
      if (!data.address || data.address.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["address"],
          message: "Informe o endereço de entrega",
        });
      }
    }
    if (data.type === OrderType.TABLE && !data.tableNumber?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tableNumber"],
        message: "Informe o número da mesa",
      });
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: "Status inválido" }),
  }),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const updateOrderPaymentSchema = z.object({
  paymentStatus: z.nativeEnum(PaymentStatus, {
    errorMap: () => ({ message: "Status de pagamento inválido" }),
  }),
});

export type UpdateOrderPaymentInput = z.infer<typeof updateOrderPaymentSchema>;

export const updatePaymentSettingsSchema = z
  .object({
    pixEnabled: z.boolean(),
    cashEnabled: z.boolean(),
    cardEnabled: z.boolean(),
    pixKeyType: z.nativeEnum(PixKeyType).nullable().optional(),
    pixKey: z.string().trim().max(120).nullable().optional(),
    pixHolderName: z.string().trim().max(80).nullable().optional(),
    pixCity: z.string().trim().max(40).nullable().optional(),
    instructions: z.string().trim().max(500).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.pixEnabled && !data.cashEnabled && !data.cardEnabled) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pixEnabled"],
        message: "Habilite ao menos uma forma de pagamento",
      });
    }

    if (!data.pixEnabled) return;

    if (!data.pixKeyType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pixKeyType"],
        message: "Escolha o tipo da chave PIX",
      });
    }
    if (!data.pixKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pixKey"],
        message: "Informe a chave PIX da loja",
      });
    }
    if (!data.pixHolderName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pixHolderName"],
        message: "Informe o nome do titular da conta",
      });
    }
    if (!data.pixCity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pixCity"],
        message: "Informe a cidade da conta PIX",
      });
    }

    if (!data.pixKeyType || !data.pixKey) return;

    const key = data.pixKey;
    const digits = key.replace(/\D/g, "");
    const invalid =
      (data.pixKeyType === "CPF" && digits.length !== 11) ||
      (data.pixKeyType === "CNPJ" && digits.length !== 14) ||
      (data.pixKeyType === "EMAIL" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) ||
      (data.pixKeyType === "PHONE" &&
        (digits.length < 10 || digits.length > 13)) ||
      (data.pixKeyType === "RANDOM" &&
        !/^[0-9a-fA-F-]{32,36}$/.test(key));

    if (invalid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pixKey"],
        message: "Chave PIX inválida para o tipo selecionado",
      });
    }
  });

export type UpdatePaymentSettingsInput = z.infer<
  typeof updatePaymentSettingsSchema
>;

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional().nullable(),
  price: z.number().min(0).max(100_000),
  imageUrl: z.string().url().optional().nullable(),
  categoryId: z.string().min(1),
  active: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});
