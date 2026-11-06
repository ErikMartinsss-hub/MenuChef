"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Banknote,
  CreditCard,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  PaymentProvider,
  PixKeyType,
  TenantSummaryDTO,
} from "@/types";

const PIX_KEY_TYPE_LABELS: Record<PixKeyType, string> = {
  CPF: "CPF (pessoa física)",
  CNPJ: "CNPJ (empresa)",
  EMAIL: "E-mail",
  PHONE: "Telefone",
  RANDOM: "Chave aleatória",
};

export function TenantPaymentSettingsPanel({
  tenant,
}: {
  tenant: TenantSummaryDTO;
}) {
  const router = useRouter();
  const [provider] = useState<PaymentProvider>(tenant.payment.provider);
  const [pixEnabled, setPixEnabled] = useState(tenant.payment.pixEnabled);
  const [cashEnabled, setCashEnabled] = useState(tenant.payment.cashEnabled);
  const [cardEnabled, setCardEnabled] = useState(tenant.payment.cardEnabled);
  const [pixKeyType, setPixKeyType] = useState<PixKeyType | null>(
    tenant.payment.pixKeyType,
  );
  const [pixKey, setPixKey] = useState(tenant.payment.pixKey ?? "");
  const [pixHolderName, setPixHolderName] = useState(
    tenant.payment.pixHolderName ?? "",
  );
  const [pixCity, setPixCity] = useState(tenant.payment.pixCity ?? "");
  const [instructions, setInstructions] = useState(
    tenant.payment.instructions ?? "",
  );
  const [saving, setSaving] = useState(false);

  const enabledCount = [pixEnabled, cashEnabled, cardEnabled].filter(
    Boolean,
  ).length;

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/tenants/${tenant.slug}/payment-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pixEnabled,
          cashEnabled,
          cardEnabled,
          pixKeyType: pixEnabled ? pixKeyType : null,
          pixKey: pixEnabled ? pixKey.trim() || null : null,
          pixHolderName: pixEnabled ? pixHolderName.trim() || null : null,
          pixCity: pixEnabled ? pixCity.trim() || null : null,
          instructions: instructions.trim() || null,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Não foi possível salvar.");
      }

      toast.success("Configurações de pagamento salvas.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível salvar.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight text-stone-900">
            Pagamentos
          </h2>
          <p className="mt-0.5 text-xs text-stone-500">
            Defina como esta loja recebe pedidos.
          </p>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-stone-600 ring-1 ring-stone-200">
          {provider === "MANUAL" ? "Confirmação manual" : provider}
        </span>
      </div>

      <p className="rounded-xl bg-stone-50 px-3.5 py-3 text-[11px] leading-relaxed text-stone-500 ring-1 ring-stone-200">
        No plano atual, cada loja configura sua chave PIX e decide quais
        formas de pagamento estão disponíveis no cardápio público. A confirmação
        do pagamento é feita pela cozinha.
      </p>

      <div className="grid gap-2.5 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setPixEnabled(true)}
          disabled={!pixEnabled && cashEnabled && cardEnabled}
          className={cn(
            "flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition",
            pixEnabled
              ? "border-brand/50 bg-brand-softer ring-1 ring-brand/20"
              : "border-stone-200 bg-white hover:border-stone-300",
          )}
        >
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-lg",
              pixEnabled
                ? "bg-brand text-brand-foreground"
                : "bg-stone-100 text-stone-500",
            )}
          >
            <QrCode className="h-4.5 w-4.5" />
          </span>
          <span className="text-xs font-bold text-stone-900">PIX</span>
          <span className="text-[10px] leading-snug text-stone-500">
            {pixEnabled
              ? "Chave PIX da loja"
              : "Habilitar com chave PIX"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCashEnabled(true)}
          disabled={!cashEnabled && pixEnabled && cardEnabled}
          className={cn(
            "flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition",
            cashEnabled
              ? "border-emerald-500/50 bg-emerald-50 ring-1 ring-emerald-200"
              : "border-stone-200 bg-white hover:border-stone-300",
          )}
        >
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-lg",
              cashEnabled
                ? "bg-emerald-500 text-white"
                : "bg-stone-100 text-stone-500",
            )}
          >
            <Banknote className="h-4.5 w-4.5" />
          </span>
          <span className="text-xs font-bold text-stone-900">Dinheiro</span>
          <span className="text-[10px] leading-snug text-stone-500">
            {cashEnabled ? "Pagamento na entrega/retirada" : "Habilitar"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCardEnabled(true)}
          disabled={!cardEnabled && pixEnabled && cashEnabled}
          className={cn(
            "flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition",
            cardEnabled
              ? "border-sky-500/50 bg-sky-50 ring-1 ring-sky-200"
              : "border-stone-200 bg-white hover:border-stone-300",
          )}
        >
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-lg",
              cardEnabled
                ? "bg-sky-500 text-white"
                : "bg-stone-100 text-stone-500",
            )}
          >
            <CreditCard className="h-4.5 w-4.5" />
          </span>
          <span className="text-xs font-bold text-stone-900">Cartão</span>
          <span className="text-[10px] leading-snug text-stone-500">
            {cardEnabled
              ? "Pagamento na entrega/retirada"
              : "Habilitar"}
          </span>
        </button>
      </div>

      {pixEnabled ? (
        <div className="grid gap-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 p-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="pix-key-type"
              className="text-xs font-bold text-stone-700"
            >
              Tipo de chave PIX
            </label>
            <select
              id="pix-key-type"
              value={pixKeyType ?? ""}
              onChange={(event) =>
                setPixKeyType(event.target.value as PixKeyType)
              }
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-900 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/15"
            >
              <option value="">Selecione…</option>
              {Object.entries(PIX_KEY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="pix-holder"
              className="text-xs font-bold text-stone-700"
            >
              Nome do titular
            </label>
            <input
              id="pix-holder"
              value={pixHolderName}
              onChange={(event) => setPixHolderName(event.target.value)}
              maxLength={80}
              placeholder="Ex: Loja LTDA"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-900 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/15"
            />
          </div>
          <div>
            <label htmlFor="pix-key" className="text-xs font-bold text-stone-700">
              Chave PIX
            </label>
            <input
              id="pix-key"
              value={pixKey}
              onChange={(event) => setPixKey(event.target.value)}
              maxLength={120}
              placeholder="Chave, e-mail, telefone ou aleatória da loja"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-900 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/15"
            />
          </div>
          <div>
            <label htmlFor="pix-city" className="text-xs font-bold text-stone-700">
              Cidade (BR Code)
            </label>
            <input
              id="pix-city"
              value={pixCity}
              onChange={(event) => setPixCity(event.target.value)}
              maxLength={40}
              placeholder="Ex: SAO PAULO"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-900 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/15"
            />
          </div>
        </div>
      ) : null}

      <div>
        <label
          htmlFor="pix-instructions"
          className="text-xs font-bold text-stone-700"
        >
          Instruções para o cliente
        </label>
        <textarea
          id="pix-instructions"
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          rows={2}
          maxLength={500}
          placeholder="Ex: Envie o comprovante no WhatsApp (11) 98888-1234."
          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-900 outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/15"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" loading={saving}>
          Salvar configurações
        </Button>
        <span className="text-[11px] text-stone-400">
          {enabledCount} forma(s) de pagamento habilitada(s)
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
        <Link
          href={`/admin/${tenant.slug}`}
          className="inline-flex h-9 items-center rounded-lg border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
        >
          Cozinha
        </Link>
        <a
          href={`/${tenant.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Cardápio público
        </a>
      </div>

      <p className="text-[10px] leading-relaxed text-stone-400">
        Para receber via gateway automaticamente (PIX dinâmico e cartão online),
        cada loja terá sua própria conta/credenciais no provedor (Mercado Pago,
        Pagar.me, Asaas, Stripe). As chaves ficarão salvas criptografadas no
        servidor e o checkout usará a conta daquela loja.
      </p>
    </form>
  );
}
