"use client";

import Link from "next/link";
import {
  Bike,
  Clock,
  MapPin,
  Phone,
  ShoppingBag,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { TenantLogo } from "@/components/tenant-logo";
import { formatBRL } from "@/lib/money";
import { cn, formatPhone } from "@/lib/utils";
import type { TenantSummaryDTO } from "@/types";

export function StoreHeader({
  tenant,
  itemCount,
  onOpenCart,
}: {
  tenant: TenantSummaryDTO;
  itemCount: number;
  onOpenCart: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">
        <Link href={`/${tenant.slug}`} className="flex min-w-0 items-center gap-2.5">
          <TenantLogo
            src={tenant.logo}
            name={tenant.name}
            className="h-9 w-9 rounded-xl"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold tracking-tight text-stone-900">
              {tenant.name}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium text-stone-500">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  tenant.isOpen ? "bg-emerald-500" : "bg-amber-500",
                )}
              />
              {tenant.isOpen ? "Aberto agora" : "Fechado"}
            </span>
          </span>
        </Link>

        <button
          type="button"
          onClick={onOpenCart}
          className="relative inline-flex h-10 items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 text-xs font-bold text-stone-800 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Sacola</span>
          {itemCount > 0 ? (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-black text-brand-foreground">
              {itemCount}
            </span>
          ) : null}
        </button>
      </div>
    </header>
  );
}

export function StoreHero({ tenant }: { tenant: TenantSummaryDTO }) {
  return (
    <section className="relative overflow-hidden bg-brand text-brand-foreground">
      <div className="absolute inset-0 hero-grid opacity-50" aria-hidden />
      <div
        className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-28 left-10 h-56 w-56 rounded-full bg-black/10 blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-4 pb-7 pt-7 sm:pb-9 sm:pt-9">
        <div className="flex items-start gap-3.5">
          <TenantLogo
            src={tenant.logo}
            name={tenant.name}
            className="hidden h-16 w-16 rounded-2xl shadow-lg ring-1 ring-white/20 sm:inline-grid"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/65">
              Cardápio online
            </p>
            <h1 className="mt-1 text-[26px] font-black leading-tight tracking-tight sm:text-3xl">
              {tenant.name}
            </h1>
            <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-white/80 sm:text-sm">
              {tenant.tagline ??
                "Peça pelo cardápio online e receba onde estiver."}
            </p>
          </div>
        </div>

        <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-0.5">
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold backdrop-blur",
              tenant.isOpen
                ? "bg-white/18 text-white ring-1 ring-white/20"
                : "bg-amber-300 text-amber-950",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                tenant.isOpen ? "bg-emerald-300" : "bg-amber-800",
              )}
            />
            {tenant.isOpen ? "Aberto agora" : "Fechado agora"}
          </span>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur">
            <Bike className="h-3.5 w-3.5" />
            {tenant.deliveryFee > 0
              ? `Entrega ${formatBRL(tenant.deliveryFee)}`
              : "Entrega grátis"}
          </span>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur">
            <Clock className="h-3.5 w-3.5" />
            30–45 min
          </span>

          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-semibold text-white/90 ring-1 ring-white/15 backdrop-blur">
            <Store className="h-3.5 w-3.5" />
            Retirada e mesa
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-1.5 text-[11px] text-white/70 sm:flex-row sm:items-center sm:gap-5">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenant.address)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-1.5 transition hover:text-white"
          >
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">{tenant.address}</span>
          </a>
          <a
            href={`tel:${tenant.phone.replace(/\D/g, "")}`}
            className="flex items-center gap-1.5 transition hover:text-white"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {formatPhone(tenant.phone)}
          </a>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-black/5">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5 text-[10px] font-medium text-white/65">
          <UtensilsCrossed className="h-3 w-3" />
          Feito na hora · Peça sem sair de casa
        </div>
      </div>
    </section>
  );
}

export function ClosedBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-semibold text-amber-800">
      A loja está fechada neste momento. Você pode ver o cardápio, mas os pedidos
      estão pausados.
    </div>
  );
}
