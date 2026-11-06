import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  orderQueryInclude,
  serializeOrder,
  serializeStorefrontTenant,
  serializeTenantSummary,
} from "@/lib/serializers";
import type { PrintSettings, TenantDTO, TenantSummaryDTO } from "@/types";

export async function getTenants(): Promise<TenantSummaryDTO[]> {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "asc" },
  });
  return tenants.map(serializeTenantSummary);
}

export async function getTenantSummary(
  slug: string,
): Promise<TenantSummaryDTO | null> {
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  return tenant ? serializeTenantSummary(tenant) : null;
}

export async function getStorefrontTenant(
  slug: string,
): Promise<TenantDTO | null> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      categories: {
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: {
          products: {
            where: { active: true },
            orderBy: [{ order: "asc" }, { name: "asc" }],
            include: {
              optionGroups: {
                orderBy: [{ order: "asc" }, { name: "asc" }],
                include: {
                  options: { orderBy: [{ order: "asc" }, { name: "asc" }] },
                },
              },
            },
          },
        },
      },
    },
  });

  return tenant ? serializeStorefrontTenant(tenant) : null;
}

export async function getKitchenData(slug: string) {
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return null;

  const [activeOrders, completedOrders, tenants] = await Promise.all([
    prisma.order.findMany({
      where: {
        tenantId: tenant.id,
        status: { in: ["PENDING", "PREPARING", "READY", "DISPATCHED"] },
      },
      include: orderQueryInclude(),
      orderBy: { createdAt: "asc" },
      take: 120,
    }),
    prisma.order.findMany({
      where: { tenantId: tenant.id, status: "COMPLETED" },
      include: orderQueryInclude(),
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.tenant.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

  return {
    tenant: {
      ...serializeTenantSummary(tenant),
      printSettings: (tenant.printSettings ?? {}) as PrintSettings,
    },
    activeOrders: activeOrders.map(serializeOrder),
    completedOrders: completedOrders.map(serializeOrder),
    tenants: tenants.map(serializeTenantSummary),
  };
}

export async function getTenantOrders(
  slug: string,
  status: "active" | "completed" | "all" = "active",
  take = 120,
) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!tenant) return null;

  let statuses: OrderStatus[] | undefined;
  if (status === "active") {
    statuses = ["PENDING", "PREPARING", "READY", "DISPATCHED"];
  } else if (status === "completed") {
    statuses = ["COMPLETED"];
  }

  const orders = await prisma.order.findMany({
    where: {
      tenantId: tenant.id,
      ...(statuses ? { status: { in: statuses } } : {}),
    },
    include: orderQueryInclude(),
    orderBy:
      status === "completed" ? { updatedAt: "desc" } : { createdAt: "asc" },
    take: Math.min(Math.max(take, 1), 200),
  });

  return orders.map(serializeOrder);
}

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: orderQueryInclude(),
  });
  return order ? serializeOrder(order) : null;
}
