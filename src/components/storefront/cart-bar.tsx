"use client";

import { ArrowRight, ShoppingBag } from "lucide-react";
import { formatBRL } from "@/lib/money";

export function CartBar({
  visible,
  itemCount,
  subtotal,
  onOpen,
}: {
  visible: boolean;
  itemCount: number;
  subtotal: number;
  onOpen: () => void;
}) {
  if (!visible || itemCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] sm:bottom-5 sm:left-1/2 sm:right-auto sm:w-[430px] sm:-translate-x-1/2 sm:p-0">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full animate-[slide-up_.28s_cubic-bezier(.16,1,.3,1)] items-center justify-between gap-3 rounded-2xl bg-stone-900 px-4 py-3.5 text-white shadow-[0_18px_40px_-12px_rgba(28,25,23,.65)] transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:px-5"
      >
        <span className="flex items-center gap-3">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground">
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-black text-stone-900 ring-2 ring-stone-900">
              {itemCount}
            </span>
          </span>
          <span className="text-left">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone-400">
              Sua sacola
            </span>
            <span className="block text-sm font-bold tabular-nums">
              {formatBRL(subtotal)}
            </span>
          </span>
        </span>

        <span className="flex items-center gap-1.5 text-xs font-bold">
          Ver sacola
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </button>
    </div>
  );
}
