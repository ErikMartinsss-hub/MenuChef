"use client";

import { ShoppingBag, Trash2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ProductImage } from "@/components/ui/product-image";
import { formatBRL } from "@/lib/money";
import type { CartLine } from "@/hooks/use-cart";
import type { TenantSummaryDTO } from "@/types";

export function CartDialog({
  open,
  onClose,
  tenant,
  lines,
  itemCount,
  subtotal,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: {
  open: boolean;
  onClose: () => void;
  tenant: TenantSummaryDTO;
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  onUpdateQuantity: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
  onCheckout: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      variant="right"
      title="Sua sacola"
      description={
        itemCount > 0
          ? `${itemCount} ${itemCount === 1 ? "item selecionado" : "itens selecionados"}`
          : "Seu pedido aparece aqui"
      }
      bodyClassName="flex flex-col"
    >
      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-20 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-stone-100 text-stone-400">
            <ShoppingBag className="h-7 w-7" strokeWidth={1.6} />
          </span>
          <p className="mt-5 font-bold text-stone-900">Sua sacola está vazia</p>
          <p className="mt-1 max-w-xs text-sm leading-relaxed text-stone-500">
            Volte ao cardápio e escolha algo delicioso para começar.
          </p>
          <Button variant="outline" className="mt-5" onClick={onClose}>
            Ver cardápio
          </Button>
        </div>
      ) : (
        <div className="flex min-h-full flex-col">
          <div className="flex-1 space-y-3 p-5 sm:p-6">
            {lines.map((line) => (
              <div
                key={line.key}
                className="rounded-2xl border border-stone-200/80 bg-white p-3"
              >
                <div className="flex gap-3">
                  <ProductImage
                    src={line.imageUrl}
                    alt={line.name}
                    sizes="64px"
                    className="h-16 w-16 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold leading-snug text-stone-900">
                        {line.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemove(line.key)}
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-stone-400 transition hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remover ${line.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {line.options.length > 0 ? (
                      <p className="mt-1 text-[11px] leading-relaxed text-stone-500">
                        {line.options.map((option) => option.optionName).join(" · ")}
                      </p>
                    ) : null}
                    {line.notes ? (
                      <p className="mt-1 text-[11px] italic leading-relaxed text-stone-400">
                        “{line.notes}”
                      </p>
                    ) : null}

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <QuantityStepper
                        value={line.quantity}
                        onChange={(quantity) =>
                          onUpdateQuantity(line.key, quantity)
                        }
                        size="sm"
                        max={50}
                      />
                      <div className="text-right">
                        <p className="text-sm font-extrabold tabular-nums text-stone-900">
                          {formatBRL(line.unitPrice * line.quantity)}
                        </p>
                        {line.quantity > 1 ? (
                          <p className="text-[10px] tabular-nums text-stone-400">
                            {formatBRL(line.unitPrice)} cada
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 border-t border-stone-100 bg-white/95 p-5 backdrop-blur sm:p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-stone-500">Subtotal</span>
              <span className="text-base font-extrabold tabular-nums text-stone-900">
                {formatBRL(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-stone-400">
              {tenant.deliveryFee > 0
                ? `Taxa de entrega (${formatBRL(tenant.deliveryFee)}) é adicionada no checkout.`
                : "Este restaurante não cobra taxa de entrega."}
            </p>

            {!tenant.isOpen ? (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                A loja está fechada. Volte quando estivermos abertos para finalizar.
              </p>
            ) : null}

            <Button
              size="lg"
              className="mt-4 w-full justify-between"
              onClick={onCheckout}
              disabled={!tenant.isOpen}
            >
              <span>Finalizar pedido</span>
              <span className="tabular-nums">{formatBRL(subtotal)}</span>
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
