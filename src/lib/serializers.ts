import { Prisma, type Category, type Order, type OrderItem, type Product, type ProductOption, type ProductOptionGroup, type Tenant, type TenantPaymentSettings } from "@prisma/client";
import type {
  CategoryDTO,
  OrderDTO,
  OrderItemDTO,
  PrintSettings,
  ProductDTO,
  ProductOptionGroupDTO,
  SelectedOption,
  TenantDTO,
  TenantPaymentConfigDTO,
  TenantSummaryDTO,
} from "@/types";

type TenantWithRelations = Tenant & {
  paymentSettings?: TenantPaymentSettings | null;
  categories: Array<
    Category & {
      products: Array<
        Product & {
          optionGroups: Array<ProductOptionGroup & { options: ProductOption[] }>;
        }
      >;
    }
  >;
};

const orderInclude = { items: true } satisfies Prisma.OrderInclude;

export type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export function orderQueryInclude() {
  return orderInclude;
}

export function serializePaymentSettings(
  settings: TenantPaymentSettings | null | undefined,
): TenantPaymentConfigDTO {
  return {
    provider: settings?.provider ?? "MANUAL",
    pixEnabled: settings?.pixEnabled ?? true,
    cashEnabled: settings?.cashEnabled ?? true,
    cardEnabled: settings?.cardEnabled ?? true,
    pixKeyType: settings?.pixKeyType ?? null,
    pixKey: settings?.pixKey ?? null,
    pixHolderName: settings?.pixHolderName ?? null,
    pixCity: settings?.pixCity ?? null,
    instructions: settings?.instructions ?? null,
  };
}

export function serializeTenantSummary(
  tenant: Tenant & { paymentSettings?: TenantPaymentSettings | null },
): TenantSummaryDTO {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    logo: tenant.logo,
    tagline: tenant.tagline,
    primaryColor: tenant.primaryColor,
    phone: tenant.phone,
    address: tenant.address,
    isOpen: tenant.isOpen,
    deliveryFee: Number(tenant.deliveryFee.toString()),
    payment: serializePaymentSettings(tenant.paymentSettings),
  };
}

function serializeProduct(product: TenantWithRelations["categories"][number]["products"][number]): ProductDTO {
  const optionGroups: ProductOptionGroupDTO[] = product.optionGroups.map(
    (group) => ({
      id: group.id,
      name: group.name,
      minChoices: group.minChoices,
      maxChoices: group.maxChoices,
      options: group.options.map((option) => ({
        id: option.id,
        name: option.name,
        price: Number(option.price.toString()),
      })),
    }),
  );

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price.toString()),
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    optionGroups,
  };
}

function serializeCategory(category: TenantWithRelations["categories"][number]): CategoryDTO {
  return {
    id: category.id,
    name: category.name,
    order: category.order,
    products: category.products.map(serializeProduct),
  };
}

export function serializeStorefrontTenant(tenant: TenantWithRelations): TenantDTO {
  return {
    ...serializeTenantSummary(tenant),
    printSettings: (tenant.printSettings ?? {}) as PrintSettings,
    categories: tenant.categories.map(serializeCategory),
  };
}

function parseOptions(value: Prisma.JsonValue): SelectedOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (
      entry &&
      typeof entry === "object" &&
      "optionId" in entry &&
      "optionName" in entry &&
      "price" in entry
    ) {
      return [entry as unknown as SelectedOption];
    }
    return [];
  });
}

export function serializeOrderItem(item: OrderItem): OrderItemDTO {
  return {
    id: item.id,
    productId: item.productId,
    name: item.name,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice.toString()),
    total: Number(item.total.toString()),
    notes: item.notes,
    options: parseOptions(item.options),
  };
}

export function serializeOrder(order: Order & { items: OrderItem[] }): OrderDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    type: order.type,
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    address: order.address,
    tableNumber: order.tableNumber,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    changeFor: order.changeFor ? Number(order.changeFor.toString()) : null,
    notes: order.notes,
    subtotal: Number(order.subtotal.toString()),
    deliveryFee: Number(order.deliveryFee.toString()),
    total: Number(order.total.toString()),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map(serializeOrderItem),
  };
}
