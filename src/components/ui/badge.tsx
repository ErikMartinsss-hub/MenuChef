import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "info"
  | "danger"
  | "dark";

const tones: Record<Tone, string> = {
  neutral: "bg-stone-100 text-stone-600 ring-stone-200",
  brand: "bg-brand-soft text-brand-strong ring-brand/20",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  dark: "bg-stone-900 text-white ring-stone-800",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
