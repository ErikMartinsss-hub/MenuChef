"use client";

import { useState } from "react";
import {
  Bike,
  Check,
  Copy,
  MessageCircle,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/money";
import { ORDER_TYPE_LABEL, PAYMENT_LABEL } from "@/lib/format";
import { cn, whatsappUrl } from "@/lib/utils";
import type { OrderDTO, TenantSummaryDTO } from "@/types";

const stepsByType = {
  DELIVERY: ["Recebido", "Em preparo", "Saiu para entrega", "Entregue"],
  TAKEOUT: ["Recebido", "Em preparo", "Pronto", "Retirado"],
  TABLE: ["Recebido", "Em preparo", "Pronto", "Servido"],
} as const;

export function OrderSuccessDialog({
  open,
  onClose,
  order,
  tenant,
}: {
  open: boolean;
  onClose: () => void;
  order: OrderDTO | null;
  tenant: TenantSummaryDTO;
}) {
  const [copiedPixKey, setCopiedPixKey] = useState(false);

  async function handleCopyPixKey() {
    if (!tenant.payment.pixKey) return;
    try {
      await navigator.clipboard.writeText(tenant.payment.pixKey);
      setCopiedPixKey(true);
      window.setTimeout(() => setCopiedPixKey(false), 2000);
    } catch {
      // Alguns contextos bloqueiam clipboard; ignora.
    }
  }

  if (!order) return null;

  const steps = stepsByType[order.type];
  const typeIcon =
    order.type === "DELIVERY"
      ? Bike
      : order.type === "TAKEOUT"
        ? ShoppingBag
        : UtensilsCrossed;
  const TypeIcon = typeIcon;
  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <Dialog open={open} onClose={onClose} variant="center" className="max-w-md">
      <div className="px-5 pb-5 pt-8 text-center sm:px-7">
        <span className="mx-auto grid h-16 w-16 animate-check-pop place-items-center rounded-full bg-emerald-100 text-emerald-700 ring-8 ring-emerald-50">
          <Check className="h-8 w-8" strokeWidth={3} />
        </span>

        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
          Pedido confirmado
        </p>
        <h2 className="mt-1 text-3xl font-black tracking-tight text-stone-950">
          #{order.orderNumber.padStart(4, "0")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          Obrigado, {order.customerName.split(" ")[0]}! A cozinha já recebeu seu
          pedido e vai começar o preparo.
        </p>

        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50/70 p-4 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
            <TypeIcon className="h-4 w-4 text-brand-strong" />
            {ORDER_TYPE_LABEL[order.type]}
            {order.type === "DELIVERY" && order.address ? (
              <span className="truncate font-normal text-stone-400">
                · {order.address}
              </span>
            ) : null}
            {order.type === "TABLE" && order.tableNumber ? (
              <span className="font-normal text-stone-400">
                · Mesa {order.tableNumber}
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-stone-500">
              {totalQuantity} {totalQuantity === 1 ? "item" : "itens"} ·{" "}
              {PAYMENT_LABEL[order.paymentMethod]}
            </span>
            <span className="font-extrabold tabular-nums text-stone-900">
              {formatBRL(order.total)}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50/70 p-4 text-left">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-stone-600">Pagamento</span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide",
                order.paymentStatus === "PAID"
                  ? "bg-emerald-100 text-emerald-700"
                  : order.paymentStatus === "REFUNDED"
                    ? "bg-stone-200 text-stone-500"
                    : "bg-amber-100 text-amber-700",
              )}
            >
              {order.paymentStatus === "PAID"
                ? "Pago"
                : order.paymentStatus === "REFUNDED"
                  ? "Estornado"
                  : "Pendente"}
            </span>
          </div>

          {order.paymentStatus === "PAID" ? (
            <p className="mt-2 text-[11px] font-semibold text-emerald-700">
              Recebemos o pagamento. Obrigado!
            </p>
          ) : (
            <div className="mt-3">
              {order.paymentMethod === "PIX" ? (
                <div className="rounded-xl border border-stone-200 bg-white px-3.5 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">
                    Pague via PIX
                  </p>
                  <p className="mt-1 text-xs font-semibold text-stone-900">
                    {[tenant.payment.pixHolderName, tenant.payment.pixKey]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {tenant.payment.pixCity ? (
                    <p className="mt-0.5 text-[10px] text-stone-400">
                      Cidade: {tenant.payment.pixCity}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void handleCopyPixKey()}
                    className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg bg-stone-900 px-3 text-[10.5px] font-bold text-white transition hover:bg-stone-800"
                  >
                    <Copy className="h-3 w-3" />
                    {copiedPixKey ? "Chave copiada!" : "Copiar chave PIX"}
                  </button>
                  <p className="mt-2 text-[10px] leading-relaxed text-stone-400">
                    {tenant.payment.instructions ?? "Envie o comprovante para a loja."}
                  </p>
                </div>
              ) : order.paymentMethod === "CASH" ? (
                <p className="text-[11px] leading-relaxed text-stone-500">
                  O cliente deve pagar em dinheiro na entrega ou retirada
                  {order.changeFor && order.changeFor > order.total
                    ? ` e entregar troco de ${formatBRL(order.changeFor - order.total)}.`
                    : "."}
                </p>
              ) : (
                <p className="text-[11px] leading-relaxed text-stone-500">
                  O cliente deve pagar o cartão na maquininha na entrega ou
                  retirada.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-start justify-between gap-1">
            {steps.map((step, index) => (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  <span
                    className={cn(
                      "h-0.5 flex-1",
                      index === 0 ? "bg-transparent" : "bg-stone-200",
                    )}
                  />
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                      index === 0
                        ? "bg-brand text-brand-foreground"
                        : "bg-stone-100 text-stone-400",
                    )}
                  >
                    {index === 0 ? <Check className="h-3 w-3" /> : index + 1}
                  </span>
                  <span
                    className={cn(
                      "h-0.5 flex-1",
                      index === steps.length - 1 ? "bg-transparent" : "bg-stone-200",
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "mt-2 text-[9px] font-semibold leading-tight",
                    index === 0 ? "text-stone-900" : "text-stone-400",
                  )}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-2">
          <a
            href={whatsappUrl(
              tenant.phone,
              `Olá! Acabei de fazer o pedido #${order.orderNumber} pelo cardápio online.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            Falar com a loja
          </a>
          <Button variant="outline" onClick={onClose}>
            Fazer novo pedido
          </Button>
        </div>

        <p className="mt-4 text-[10px] leading-relaxed text-stone-400">
          Guarde o número <strong className="text-stone-500">#{order.orderNumber}</strong>{" "}
          para acompanhar seu pedido com a loja.
        </p>
      </div>
    </Dialog>
  );
}
