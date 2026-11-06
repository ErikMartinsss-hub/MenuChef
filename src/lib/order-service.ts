import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { publishOrderEvent } from "@/lib/realtime";
import { fromCents, toCents } from "@/lib/money";
import { serializeOrder } from "@/lib/serializers";
import type { CreateOrderInput } from "@/lib/validators";
import type { OrderDTO, SelectedOption } from "@/types";

export class OrderServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "OrderServiceError";
    this.status = status;
  }
}

interface PricedItem {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  notes: string | null;
  options: SelectedOption[];
}

function priceCart(
  input: CreateOrderInput,
  products: Array<{
    id: string;
    name: string;
    price: Prisma.Decimal;
    optionGroups: Array<{
      id: string;
      name: string;
      minChoices: number;
      maxChoices: number;
      options: Array<{ id: string; name: string; price: Prisma.Decimal }>;
    }>;
  }>,
): { items: PricedItem[]; subtotalCents: number } {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const items: PricedItem[] = [];

  for (const line of input.items) {
    const product = productMap.get(line.productId);
    if (!product) {
      throw new OrderServiceError(
        "Um dos produtos não está mais disponível. Atualize o cardápio.",
        409,
      );
    }

    if (line.optionIds.length !== new Set(line.optionIds).size) {
      throw new OrderServiceError("Opções duplicadas no item.", 400);
    }

    const requested = new Set(line.optionIds);
    const knownOptionIds = new Set(
      product.optionGroups.flatMap((group) =>
        group.options.map((option) => option.id),
      ),
    );

    for (const optionId of requested) {
      if (!knownOptionIds.has(optionId)) {
        throw new OrderServiceError(
          "Uma opção escolhida não pertence a este produto.",
          400,
        );
      }
    }

    const options: SelectedOption[] = [];

    for (const group of product.optionGroups) {
      const selected = group.options.filter((option) =>
        requested.has(option.id),
      );

      if (selected.length < group.minChoices) {
        throw new OrderServiceError(
          `Escolha ao menos ${group.minChoices} opção(ões) em "${group.name}".`,
          400,
        );
      }
      if (selected.length > group.maxChoices) {
        throw new OrderServiceError(
          `Escolha no máximo ${group.maxChoices} opção(ões) em "${group.name}".`,
          400,
        );
      }

      for (const option of selected) {
        options.push({
          groupId: group.id,
          groupName: group.name,
          optionId: option.id,
          optionName: option.name,
          price: Number(option.price.toString()),
        });
      }
    }

    const optionCents = options.reduce((sum, option) => sum + toCents(option.price), 0);
    const unitPriceCents = toCents(product.price) + optionCents;
    const totalCents = unitPriceCents * line.quantity;

    items.push({
      productId: product.id,
      name: product.name,
      quantity: line.quantity,
      unitPriceCents,
      totalCents,
      notes: line.notes?.trim() || null,
      options,
    });
  }

  return {
    items,
    subtotalCents: items.reduce((sum, item) => sum + item.totalCents, 0),
  };
}

export async function createOrder(input: CreateOrderInput): Promise<OrderDTO> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: input.tenantSlug },
    select: {
      id: true,
      slug: true,
      isOpen: true,
      deliveryFee: true,
    },
  });

  if (!tenant) {
    throw new OrderServiceError("Restaurante não encontrado.", 404);
  }
  if (!tenant.isOpen) {
    throw new OrderServiceError(
      "O restaurante está fechado no momento. Tente novamente mais tarde.",
      409,
    );
  }

  const uniqueProductIds = [...new Set(input.items.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: {
      tenantId: tenant.id,
      id: { in: uniqueProductIds },
      active: true,
    },
    select: {
      id: true,
      name: true,
      price: true,
      optionGroups: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          minChoices: true,
          maxChoices: true,
          options: {
            orderBy: { order: "asc" },
            select: { id: true, name: true, price: true },
          },
        },
      },
    },
  });

  if (products.length !== uniqueProductIds.length) {
    throw new OrderServiceError(
      "Um dos produtos não está mais disponível. Atualize o cardápio.",
      409,
    );
  }

  const { items, subtotalCents } = priceCart(input, products);
  const deliveryFeeCents =
    input.type === "DELIVERY" ? toCents(tenant.deliveryFee) : 0;
  const totalCents = subtotalCents + deliveryFeeCents;

  if (totalCents <= 0) {
    throw new OrderServiceError("O total do pedido é inválido.", 400);
  }

  const created = await prisma.$transaction(async (tx) => {
    const sequence = await tx.tenant.update({
      where: { id: tenant.id },
      data: { orderSequence: { increment: 1 } },
      select: { orderSequence: true },
    });

    return tx.order.create({
      data: {
        tenantId: tenant.id,
        orderNumber: String(sequence.orderSequence).padStart(4, "0"),
        type: input.type,
        status: "PENDING",
        customerName: input.customerName.trim(),
        customerPhone: input.customerPhone.trim(),
        address: input.type === "DELIVERY" ? input.address?.trim() : null,
        tableNumber: input.type === "TABLE" ? input.tableNumber?.trim() : null,
        paymentMethod: input.paymentMethod,
        changeFor:
          input.paymentMethod === "CASH" && input.changeFor != null
            ? fromCents(Math.round(input.changeFor * 100))
            : null,
        notes: input.notes?.trim() || null,
        subtotal: fromCents(subtotalCents),
        deliveryFee: fromCents(deliveryFeeCents),
        total: fromCents(totalCents),
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: fromCents(item.unitPriceCents),
            total: fromCents(item.totalCents),
            notes: item.notes,
            options: item.options as unknown as Prisma.InputJsonValue,
          })),
        },
      },
      include: { items: true },
    });
  });

  const order = serializeOrder(created);
  publishOrderEvent(tenant.id, "order.created", order);
  return order;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<OrderDTO> {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, tenantId: true, status: true },
  });

  if (!existing) {
    throw new OrderServiceError("Pedido não encontrado.", 404);
  }
  if (existing.status === "CANCELLED" && status !== "CANCELLED") {
    throw new OrderServiceError(
      "Pedidos cancelados não podem ser reabertos.",
      409,
    );
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: true },
  });

  const order = serializeOrder(updated);
  publishOrderEvent(existing.tenantId, "order.updated", order);
  return order;
}
