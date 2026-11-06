"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 50,
  size = "md",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const buttonClass =
    size === "sm"
      ? "h-7 w-7 rounded-md"
      : "h-8 w-8 rounded-lg";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white p-1",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Diminuir quantidade"
        className={cn(
          "grid place-items-center text-stone-600 transition hover:bg-stone-100 disabled:opacity-30",
          buttonClass,
        )}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span
        className={cn(
          "min-w-6 text-center font-semibold tabular-nums text-stone-900",
          size === "sm" ? "text-xs" : "text-sm",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        className={cn(
          "grid place-items-center text-stone-600 transition hover:bg-stone-100 disabled:opacity-30",
          buttonClass,
        )}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
