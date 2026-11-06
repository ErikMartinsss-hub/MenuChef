"use client";

import {
  BellRing,
  Bike,
  Check,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Printer,
  ShoppingBag,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  elapsedLabel,
  formatTime,
  ORDER_TYPE_LABEL,
  PAYMENT_LABEL,
} from "@/lib/format";
import { formatBRL } from "@/lib/money";
import { cn, formatPhone, mapsUrl, whatsappUrl } from "@/lib/utils";
import type { OrderDTO, OrderStatus } from "@/types";

const typeStyle: Record<OrderDTO["type"], { icon: typeof Bike; className: string }> = {
  DELIVERY: { icon: Bike, className: "bg-sky-500/12 text-sky-300 ring-sky-400/20" },
  TAKEOUT: {
    icon: ShoppingBag,
    className: "bg-emerald-500/12 text-emerald-300 ring-emerald-400/20",
  },
  TABLE: {
    icon: UtensilsCrossed,
    className: "bg-violet-500/12 text-violet-300 ring-violet-400/20",
  },
};

const statusStyle: Record<
  OrderStatus,
  { label: string; className: string; bar: string }
> = {
  PENDING: {
    label: "Pendente",
    className: "bg-amber-400/12 text-amber-300 ring-amber-400/20",
    bar: "bg-amber-400",
  },
  PREPARING: {
    label: "Em preparo",
    className: "bg-orange-500/12 text-orange-300 ring-orange-400/20",
    bar: "bg-orange-500",
  },
  READY: {
    label: "Pronto",
    className: "bg-emerald-500/12 text-emerald-300 ring-emerald-400/20",
    bar: "bg-emerald-500",
  },
  DISPATCHED: {
    label: "Em entrega",
    className: "bg-sky-500/12 text-sky-300 ring-sky-400/20",
    bar: "bg-sky-500",
  },
  COMPLETED: {
    label: "Concluído",
    className: "bg-white/5 text-stone-400 ring-white/10",
    bar: "bg-stone-600",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-red-500/12 text-red-300 ring-red-400/20",
    bar: "bg-red-500",
  },
};

interface NextAction {
  label: string;
  status: OrderStatus;
  icon: typeof Play;
  variant: "brand" | "success" | "white";
}

export function getNextAction(order: OrderDTO): NextAction | null {
  switch (order.status) {
    case "PENDING":
      return {
        label: "Iniciar preparo",
        status: "PREPARING",
        icon: Play,
        variant: "brand",
      };
    case "PREPARING":
      return {
        label: "Marcar como pronto",
        status: "READY",
        icon: BellRing,
        variant: "success",
      };
    case "READY":
      return order.type === "DELIVERY"
        ? {
            label: "Saiu para entrega",
            status: "DISPATCHED",
            icon: Bike,
            variant: "brand",
          }
        : {
            label: "Concluir pedido",
            status: "COMPLETED",
            icon: CheckCircle2,
            variant: "success",
          };
    case "DISPATCHED":
      return {
        label: "Concluir entrega",
        status: "COMPLETED",
        icon: CheckCircle2,
        variant: "success",
      };
    default:
      return null;
  }
}

export function OrderCard({
  order,
  now,
  isNew,
  updating,
  onAdvance,
  onCancel,
  onMarkPaid,
  onPrint,
}: {
  order: OrderDTO;
  now: number;
  isNew: boolean;
  updating: boolean;
  onAdvance: (order: OrderDTO, status: OrderStatus) => void;
  onCancel: (order: OrderDTO) => void;
  onMarkPaid: (order: OrderDTO) => void;
  onPrint: (order: OrderDTO) => void;
}) {
  const next = getNextAction(order);
  const type = typeStyle[order.type];
  const status = statusStyle[order.status];
  const TypeIcon = type.icon;
  const NextIcon = next?.icon;
  const canCancel =
    order.status === "PENDING" || order.status === "PREPARING";
  const change =
    order.paymentMethod === "CASH" && order.changeFor
      ? order.changeFor - order.total
      : null;
  const paymentStatusLabel =
    order.paymentStatus === "PAID"
      ? "Pago"
      : order.paymentStatus === "REFUNDED"
        ? "Estornado"
        : "A pagar";

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border bg-stone-900/85 shadow-xl shadow-black/10 transition animate-card-enter",
        isNew
          ? "border-brand/60 ring-2 ring-brand/25"
          : "border-white/10 hover:border-white/20",
      )}
    >
      <div className={cn("h-1 w-full", status.bar)} />

      <div className="flex items-start justify-between gap-2 border-b border-white/8 px-4 py-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white px-2 py-1 text-sm font-black tracking-tight text-stone-950">
              #{order.orderNumber.padStart(4, "0")}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ring-1 ring-inset",
                status.className,
              )}
            >
              {status.label}
            </span>
            {isNew ? (
              <span className="text-[9px] font-bold uppercase tracking-wide text-brand">
                novo
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-[10px] font-medium text-stone-500">
            {formatTime(order.createdAt)} ·{" "}
            {order.status === "COMPLETED"
              ? `concluído ${elapsedLabel(order.updatedAt, now)}`
              : elapsedLabel(order.createdAt, now)}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ring-1 ring-inset",
              type.className,
            )}
          >
            <TypeIcon className="h-3 w-3" />
            {ORDER_TYPE_LABEL[order.type]}
          </span>
          <button
            type="button"
            onClick={() => onPrint(order)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-stone-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Imprimir recibo 80mm"
            title="Imprimir recibo 80mm"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              {order.customerName}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-stone-400">
              <a
                href={`tel:${order.customerPhone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-1 transition hover:text-white"
              >
                <Phone className="h-3 w-3" />
                {formatPhone(order.customerPhone)}
              </a>
              <a
                href={whatsappUrl(
                  order.customerPhone,
                  `Olá ${order.customerName}, sobre seu pedido #${order.orderNumber}...`,
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-400/80 transition hover:text-emerald-300"
                aria-label="Abrir WhatsApp"
              >
                <MessageCircle className="h-3 w-3" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {order.type === "DELIVERY" && order.address ? (
          <a
            href={mapsUrl(order.address)}
            target="_blank"
            rel="noreferrer"
            className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-2 text-[10.5px] leading-relaxed text-stone-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-stone-500" />
            <span className="line-clamp-2">{order.address}</span>
            <ExternalLink className="mt-0.5 h-2.5 w-2.5 shrink-0 text-stone-600" />
          </a>
        ) : null}

        {order.type === "TABLE" && order.tableNumber ? (
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-[10.5px] font-bold text-violet-300 ring-1 ring-violet-400/20">
            <UtensilsCrossed className="h-3 w-3" />
            Mesa {order.tableNumber}
          </div>
        ) : null}

        <div className="mt-3.5 space-y-2 border-t border-white/8 pt-3">
          {order.items.map((item) => (
            <div key={item.id} className="text-[11.5px] leading-snug">
              <div className="flex items-start justify-between gap-3">
                <p className="text-stone-200">
                  <span className="mr-1 inline-flex min-w-5 justify-center rounded bg-white/8 px-1 py-0.5 text-[9.5px] font-bold text-white">
                    {item.quantity}x
                  </span>
                  {item.name}
                </p>
                <span className="shrink-0 font-semibold tabular-nums text-stone-300">
                  {formatBRL(item.total)}
                </span>
              </div>
              {item.options.map((option) => (
                <p
                  key={`${item.id}-${option.optionId}`}
                  className="ml-7 text-[10px] text-stone-500"
                >
                  + {option.optionName}
                  {option.price > 0 ? ` (${formatBRL(option.price)})` : ""}
                </p>
              ))}
              {item.notes ? (
                <p className="ml-7 text-[10px] italic text-amber-300/70">
                  obs: {item.notes}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {order.notes ? (
          <div className="mt-3 rounded-lg border border-amber-400/15 bg-amber-400/[0.07] px-2.5 py-2 text-[10.5px] leading-relaxed text-amber-200/90">
            <span className="font-bold uppercase tracking-wide text-amber-300/80">
              Observação:{" "}
            </span>
            {order.notes}
          </div>
        ) : null}

        <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-2.5">
          <div className="flex items-center gap-2 text-[10px] text-stone-400">
            <span className="rounded bg-white/5 px-1.5 py-1 font-semibold">
              {PAYMENT_LABEL[order.paymentMethod]}
            </span>
            {order.paymentMethod === "CASH" && order.changeFor ? (
              <span>
                troco p/ {formatBRL(order.changeFor)}
                {change != null && change > 0 ? (
                  <span className="text-emerald-400"> · {formatBRL(change)}</span>
                ) : null}
              </span>
            ) : null}
            <span
              className={cn(
                "rounded-full px-1.5 py-1 font-bold uppercase tracking-wide",
                order.paymentStatus === "PAID"
                  ? "bg-emerald-500/15 text-emerald-300"
                  : order.paymentStatus === "REFUNDED"
                    ? "bg-stone-500/20 text-stone-300"
                    : "bg-amber-400/15 text-amber-300",
              )}
            >
              {paymentStatusLabel}
            </span>
          </div>
          <p className="text-base font-black tabular-nums text-white">
            {formatBRL(order.total)}
          </p>
        </div>
      </div>

      {order.paymentStatus === "PENDING" && order.status !== "CANCELLED" ? (
        <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-3.5 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-300/90">
              Pagamento pendente
            </p>
            <p className="mt-0.5 text-[10.5px] leading-relaxed text-amber-200/80">
              Confirme o recebimento (PIX, dinheiro ou cartão) para seguir com o
              pedido.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onMarkPaid(order)}
            disabled={updating}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-amber-400 px-3 text-[10.5px] font-bold text-amber-950 transition hover:bg-amber-300 disabled:opacity-50"
          >
            <CircleDollarSign className="h-3.5 w-3.5" />
            Marcar como pago
          </button>
        </div>
      ) : null}

      <div className="flex items-center gap-2 border-t border-white/8 bg-black/10 px-3.5 py-3">
        {next ? (
          <button
            type="button"
            onClick={() => onAdvance(order, next.status)}
            disabled={updating}
            className={cn(
              "inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-[11px] font-bold transition disabled:opacity-50",
              next.variant === "brand" &&
                "bg-brand text-brand-foreground hover:bg-brand-strong",
              next.variant === "success" &&
                "bg-emerald-500 text-emerald-950 hover:bg-emerald-400",
              next.variant === "white" &&
                "bg-white text-stone-900 hover:bg-stone-100",
            )}
          >
            {updating ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : NextIcon ? (
              <NextIcon className="h-3.5 w-3.5" />
            ) : null}
            {next.label}
          </button>
        ) : (
          <span className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/5 text-[11px] font-semibold text-stone-400">
            <Check className="h-3.5 w-3.5" />
            Pedido finalizado
          </span>
        )}

        <button
          type="button"
          onClick={() => onPrint(order)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-stone-400 transition hover:bg-white/5 hover:text-white"
          aria-label="Imprimir recibo"
          title="Imprimir recibo 80mm"
        >
          <Printer className="h-4 w-4" />
        </button>

        {canCancel ? (
          <button
            type="button"
            onClick={() => onCancel(order)}
            disabled={updating}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-red-400/15 text-red-400/70 transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-40"
            aria-label="Cancelar pedido"
            title="Cancelar pedido"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function printFailureToast() {
  toast.error("Permita pop-ups no navegador para imprimir o recibo.");
}
