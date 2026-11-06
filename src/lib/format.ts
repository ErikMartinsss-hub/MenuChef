import type { OrderStatus, OrderType, PaymentMethod } from "@/types";

export const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  DELIVERY: "Entrega",
  TAKEOUT: "Retirada",
  TABLE: "Na mesa",
};

export const ORDER_TYPE_SHORT: Record<OrderType, string> = {
  DELIVERY: "Delivery",
  TAKEOUT: "Retirada",
  TABLE: "Mesa",
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  PIX: "PIX",
  CASH: "Dinheiro",
  CARD: "Cartão",
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pendente",
  PREPARING: "Em preparo",
  READY: "Pronto",
  DISPATCHED: "Em entrega",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

export const ACTIVE_STATUSES: OrderStatus[] = [
  "PENDING",
  "PREPARING",
  "READY",
  "DISPATCHED",
];

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatFullDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(iso));
}

export function minutesSince(iso: string, now: number): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
}

export function elapsedLabel(iso: string, now: number): string {
  const minutes = minutesSince(iso, now);
  if (minutes < 1) return "agora";
  if (minutes === 1) return "há 1 min";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `há ${hours}h${String(minutes % 60).padStart(2, "0")}`;
}

export function orderNumberLabel(orderNumber: string): string {
  return `#${orderNumber.padStart(4, "0")}`;
}
