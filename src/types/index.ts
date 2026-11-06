export type OrderType = "DELIVERY" | "TAKEOUT" | "TABLE";
export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "DISPATCHED"
  | "COMPLETED"
  | "CANCELLED";
export type PaymentMethod = "PIX" | "CASH" | "CARD";
export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED";
export type PaymentProvider =
  | "MANUAL"
  | "MERCADO_PAGO"
  | "STRIPE"
  | "PAGARME"
  | "ASAAS";
export type PixKeyType = "CPF" | "CNPJ" | "EMAIL" | "PHONE" | "RANDOM";

export interface TenantPaymentConfigDTO {
  provider: PaymentProvider;
  pixEnabled: boolean;
  cashEnabled: boolean;
  cardEnabled: boolean;
  pixKeyType: PixKeyType | null;
  pixKey: string | null;
  pixHolderName: string | null;
  pixCity: string | null;
  instructions: string | null;
}

export interface PrintSettings {
  footerNote?: string;
  receiptHeader?: string;
  showLogo?: boolean;
  paperWidthMm?: number;
}

export interface SelectedOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface ProductOptionDTO {
  id: string;
  name: string;
  price: number;
}

export interface ProductOptionGroupDTO {
  id: string;
  name: string;
  minChoices: number;
  maxChoices: number;
  options: ProductOptionDTO[];
}

export interface ProductDTO {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string;
  optionGroups: ProductOptionGroupDTO[];
}

export interface CategoryDTO {
  id: string;
  name: string;
  order: number;
  products: ProductDTO[];
}

export interface TenantSummaryDTO {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  tagline: string | null;
  primaryColor: string;
  phone: string;
  address: string;
  isOpen: boolean;
  deliveryFee: number;
  payment: TenantPaymentConfigDTO;
}

export interface TenantDTO extends TenantSummaryDTO {
  printSettings: PrintSettings;
  categories: CategoryDTO[];
}

export interface OrderItemDTO {
  id: string;
  productId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes: string | null;
  options: SelectedOption[];
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  type: OrderType;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  address: string | null;
  tableNumber: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  changeFor: number | null;
  notes: string | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDTO[];
}

export type RealtimeEventType = "order.created" | "order.updated";

export interface RealtimeOrderEvent {
  type: RealtimeEventType;
  order: OrderDTO;
  at: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}
