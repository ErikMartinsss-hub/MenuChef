"use client";

import { useMemo, useState } from "react";
import {
  Banknote,
  Bike,
  CreditCard,
  QrCode,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/money";
import { cn, formatPhoneInput, onlyDigits } from "@/lib/utils";
import type { CartLine } from "@/hooks/use-cart";
import type {
  ApiError,
  OrderDTO,
  OrderType,
  PaymentMethod,
  TenantSummaryDTO,
} from "@/types";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-brand/60 focus:ring-2 focus:ring-brand/15";

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1 text-xs font-semibold text-red-600">{children}</p>;
}

const typeOptions: Array<{
  value: OrderType;
  label: string;
  icon: typeof Bike;
}> = [
  { value: "DELIVERY", label: "Entrega", icon: Bike },
  { value: "TAKEOUT", label: "Retirada", icon: ShoppingBag },
  { value: "TABLE", label: "Mesa", icon: UtensilsCrossed },
];

const paymentOptions: Array<{
  value: PaymentMethod;
  label: string;
  icon: typeof Bike;
}> = [
  { value: "PIX", label: "PIX", icon: QrCode },
  { value: "CASH", label: "Dinheiro", icon: Banknote },
  { value: "CARD", label: "Cartão", icon: CreditCard },
];

export function CheckoutDialog({
  open,
  onClose,
  tenant,
  lines,
  subtotal,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  tenant: TenantSummaryDTO;
  lines: CartLine[];
  subtotal: number;
  onSuccess: (order: OrderDTO) => void;
}) {
  const [type, setType] = useState<OrderType>("DELIVERY");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [changeFor, setChangeFor] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = type === "DELIVERY" ? tenant.deliveryFee : 0;
  const total = subtotal + deliveryFee;
  const availablePaymentOptions = paymentOptions.filter((option) =>
    option.value === "PIX"
      ? tenant.payment.pixEnabled
      : option.value === "CASH"
        ? tenant.payment.cashEnabled
        : tenant.payment.cardEnabled,
  );
  const selectedPayment = availablePaymentOptions.find(
    (option) => option.value === paymentMethod,
  );
  const paymentMethodEffective = selectedPayment?.value ?? "CASH";
  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (customerName.trim().length < 2) {
      next.customerName = "Informe seu nome";
    }
    const digits = onlyDigits(customerPhone);
    if (digits.length < 10 || digits.length > 11) {
      next.customerPhone = "Informe um telefone com DDD";
    }
    if (type === "DELIVERY" && address.trim().length < 5) {
      next.address = "Informe o endereço completo para entrega";
    }
    if (type === "TABLE" && !tableNumber.trim()) {
      next.tableNumber = "Informe o número da mesa";
    }

    const parsedChange = Number(changeFor.replace(",", "."));
    if (
      paymentMethodEffective === "CASH" &&
      changeFor.trim() &&
      Number.isFinite(parsedChange) &&
      parsedChange > 0 &&
      parsedChange < total
    ) {
      next.changeFor = `O troco deve ser maior que o total (${formatBRL(total)})`;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setServerError(null);

    if (!tenant.isOpen) {
      toast.error("A loja está fechada no momento.");
      return;
    }
    if (lines.length === 0) {
      toast.error("Sua sacola está vazia.");
      return;
    }
    if (!validate()) {
      toast.error("Confira os dados do pedido");
      return;
    }

    setSubmitting(true);
    try {
      const parsedChange = Number(changeFor.replace(",", "."));
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: tenant.slug,
          type,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          address: type === "DELIVERY" ? address.trim() : null,
          tableNumber: type === "TABLE" ? tableNumber.trim() : null,
          paymentMethod: paymentMethodEffective,
          changeFor:
            paymentMethodEffective === "CASH" && Number.isFinite(parsedChange) && parsedChange > 0
              ? parsedChange
              : null,
          notes: notes.trim() || null,
          items: lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            optionIds: line.options.map((option) => option.optionId),
            notes: line.notes || null,
          })),
        }),
      });

      const payload = (await response.json()) as
        | { order: OrderDTO }
        | ApiError;

      if (!response.ok || !("order" in payload)) {
        const message =
          "error" in payload ? payload.error : "Não foi possível criar o pedido.";
        setServerError(message);
        if ("details" in payload && payload.details) {
          setErrors(
            Object.fromEntries(
              Object.entries(payload.details).map(([key, value]) => [
                key,
                value[0] ?? "Valor inválido",
              ]),
            ),
          );
        }
        toast.error(message);
        return;
      }

      onSuccess(payload.order);
    } catch {
      setServerError("Falha de conexão. Verifique sua internet e tente novamente.");
      toast.error("Falha de conexão");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      variant="bottom"
      title="Finalizar pedido"
      description={`${itemCount} ${itemCount === 1 ? "item" : "itens"} · ${tenant.name}`}
      className="sm:max-w-xl"
      bodyClassName="flex flex-col"
    >
      <form onSubmit={handleSubmit} className="flex min-h-full flex-col">
        <div className="flex-1 space-y-6 p-5 sm:p-6">
          <section>
            <h3 className="text-sm font-bold text-stone-900">
              Como você quer receber?
            </h3>
            <div className="mt-2.5 grid grid-cols-3 gap-1.5 rounded-2xl bg-stone-100 p-1.5">
              {typeOptions.map((option) => {
                const Icon = option.icon;
                const active = type === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setType(option.value);
                      setErrors((previous) => {
                        const copy = { ...previous };
                        delete copy.address;
                        delete copy.tableNumber;
                        return copy;
                      });
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-[11px] font-bold transition sm:flex-row sm:justify-center sm:gap-2 sm:text-xs",
                      active
                        ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/60"
                        : "text-stone-500 hover:text-stone-700",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        active ? "text-brand" : "text-stone-400",
                      )}
                    />
                    {option.label}
                  </button>
                );
              })}
            </div>

            {type === "DELIVERY" ? (
              <div className="mt-4">
                <label htmlFor="checkout-address" className="text-xs font-semibold text-stone-700">
                  Endereço de entrega
                </label>
                <textarea
                  id="checkout-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  rows={2}
                  maxLength={240}
                  placeholder="Rua, número, complemento, bairro"
                  className={cn(inputClass, "resize-none")}
                />
                <FieldError>{errors.address}</FieldError>
              </div>
            ) : null}

            {type === "TABLE" ? (
              <div className="mt-4">
                <label htmlFor="checkout-table" className="text-xs font-semibold text-stone-700">
                  Número da mesa
                </label>
                <input
                  id="checkout-table"
                  value={tableNumber}
                  onChange={(event) => setTableNumber(event.target.value)}
                  maxLength={10}
                  placeholder="Ex: 12"
                  className={inputClass}
                />
                <FieldError>{errors.tableNumber}</FieldError>
              </div>
            ) : null}
          </section>

          <section>
            <h3 className="text-sm font-bold text-stone-900">Seus dados</h3>
            <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="checkout-name" className="text-xs font-semibold text-stone-700">
                  Nome
                </label>
                <input
                  id="checkout-name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  autoComplete="name"
                  maxLength={80}
                  placeholder="Como podemos chamar você?"
                  className={inputClass}
                />
                <FieldError>{errors.customerName}</FieldError>
              </div>
              <div>
                <label htmlFor="checkout-phone" className="text-xs font-semibold text-stone-700">
                  Telefone / WhatsApp
                </label>
                <input
                  id="checkout-phone"
                  value={customerPhone}
                  onChange={(event) =>
                    setCustomerPhone(formatPhoneInput(event.target.value))
                  }
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  className={inputClass}
                />
                <FieldError>{errors.customerPhone}</FieldError>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-stone-900">Pagamento</h3>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {availablePaymentOptions.map((option) => {
                const Icon = option.icon;
                const active = paymentMethod === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPaymentMethod(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-[11px] font-bold transition",
                      active
                        ? "border-brand/50 bg-brand-softer text-stone-900 ring-1 ring-brand/20"
                        : "border-stone-200 bg-white text-stone-500 hover:border-stone-300",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4.5 w-4.5",
                        active ? "text-brand-strong" : "text-stone-400",
                      )}
                    />
                    {option.label}
                  </button>
                );
              })}
            </div>

            {paymentMethodEffective === "CASH" ? (
              <div className="mt-3">
                <label htmlFor="checkout-change" className="text-xs font-semibold text-stone-700">
                  Troco para quanto?{" "}
                  <span className="font-normal text-stone-400">(opcional)</span>
                </label>
                <input
                  id="checkout-change"
                  value={changeFor}
                  onChange={(event) => setChangeFor(event.target.value)}
                  inputMode="decimal"
                  placeholder={`Ex: ${formatBRL(total + 10)}`}
                  className={inputClass}
                />
                <FieldError>{errors.changeFor}</FieldError>
              </div>
            ) : null}

            <p className="mt-2 text-[11px] leading-relaxed text-stone-400">
              {paymentMethodEffective === "PIX"
                ? tenant.payment.instructions
                  ? `Pague via PIX com a chave da loja. ${tenant.payment.instructions}`
                  : "Pague via PIX com a chave da loja."
                : paymentMethodEffective === "CARD"
                  ? "O pagamento via cartão é combinado diretamente com a loja."
                  : "Informe o valor para calcularmos seu troco."}
            </p>

            {paymentMethodEffective === "PIX" && tenant.payment.pixKey ? (
              <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">
                  Chave PIX da loja
                </p>
                <p className="mt-0.5 text-xs font-semibold text-stone-700">
                  {[tenant.payment.pixHolderName, tenant.payment.pixKey]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {tenant.payment.pixCity ? (
                  <p className="mt-0.5 text-[10px] text-stone-400">
                    Cidade: {tenant.payment.pixCity}
                  </p>
                ) : null}
                <p className="mt-1 text-[10px] leading-relaxed text-stone-400">
                  {tenant.payment.instructions ??
                    "Pague pelo seu app e envie o comprovante para a loja."}
                </p>
              </div>
            ) : null}
          </section>

          <section>
            <label htmlFor="checkout-notes" className="text-sm font-bold text-stone-900">
              Observações do pedido{" "}
              <span className="font-normal text-stone-400">(opcional)</span>
            </label>
            <textarea
              id="checkout-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Ex: interfone quebrado, entregar na portaria..."
              className={cn(inputClass, "resize-none")}
            />
          </section>

          <section className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-stone-500">
              Resumo
            </h3>
            <div className="mt-2.5 space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>
                  Subtotal ({itemCount} {itemCount === 1 ? "item" : "itens"})
                </span>
                <span className="tabular-nums">{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Taxa de entrega</span>
                <span className="tabular-nums">
                  {type === "DELIVERY"
                    ? deliveryFee > 0
                      ? formatBRL(deliveryFee)
                      : "Grátis"
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-extrabold text-stone-900">
                <span>Total</span>
                <span className="tabular-nums">{formatBRL(total)}</span>
              </div>
            </div>
          </section>

          {serverError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-xs font-semibold text-red-700">
              {serverError}
            </p>
          ) : null}
        </div>

        <div className="sticky bottom-0 border-t border-stone-100 bg-white/95 p-4 backdrop-blur sm:p-5">
          <Button
            type="submit"
            size="lg"
            className="w-full justify-between"
            loading={submitting}
            disabled={!tenant.isOpen || availablePaymentOptions.length === 0}
          >
            <span>{submitting ? "Enviando..." : "Enviar pedido"}</span>
            <span className="tabular-nums">{formatBRL(total)}</span>
          </Button>
          <p className="mt-2 text-center text-[10px] leading-relaxed text-stone-400">
            Ao enviar, seu pedido cai direto na cozinha em tempo real.
          </p>
        </div>
      </form>
    </Dialog>
  );
}
