import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant =
  | "brand"
  | "dark"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "white";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

const variants: Record<Variant, string> = {
  brand:
    "bg-brand text-brand-foreground shadow-sm hover:bg-brand-strong active:translate-y-px",
  dark: "bg-stone-900 text-white shadow-sm hover:bg-stone-800 active:translate-y-px",
  secondary:
    "bg-stone-100 text-stone-900 hover:bg-stone-200 active:translate-y-px",
  outline:
    "border border-stone-200 bg-white text-stone-800 shadow-xs hover:border-stone-300 hover:bg-stone-50",
  ghost: "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 active:translate-y-px",
  success:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:translate-y-px",
  white:
    "bg-white text-stone-900 shadow-sm hover:bg-stone-100 active:translate-y-px",
};

const sizes: Record<Size, string> = {
  sm: "h-9 rounded-lg px-3 text-xs font-semibold gap-1.5",
  md: "h-11 rounded-xl px-4 text-sm font-semibold gap-2",
  lg: "h-13 rounded-2xl px-6 text-[15px] font-semibold gap-2",
  icon: "h-11 w-11 rounded-xl",
  "icon-sm": "h-9 w-9 rounded-lg",
};

export function buttonStyles({
  variant = "brand",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}): string {
  return cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "brand",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonStyles({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
