"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogVariant = "center" | "right" | "bottom";

const outer: Record<DialogVariant, string> = {
  center: "items-center justify-center p-3 sm:p-6",
  right: "justify-end",
  bottom: "items-end justify-center sm:items-center sm:p-6",
};

const panel: Record<DialogVariant, string> = {
  center: "max-w-lg rounded-3xl",
  right: "h-[100dvh] max-w-md rounded-none sm:rounded-l-3xl",
  bottom:
    "max-h-[92dvh] rounded-t-3xl sm:max-h-[88dvh] sm:rounded-3xl sm:max-w-2xl",
};

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  variant?: DialogVariant;
  className?: string;
  bodyClassName?: string;
  closeClassName?: string;
  hideClose?: boolean;
}

export function Dialog({
  open,
  onClose,
  children,
  title,
  description,
  variant = "center",
  className,
  bodyClassName,
  closeClassName,
  hideClose = false,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => panelRef.current?.focus(), 30);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
      previousFocus?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" role="presentation">
      <div
        className="absolute inset-0 animate-[fade-in_.18s_ease-out] bg-stone-950/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={cn("relative flex w-full", outer[variant])}>
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          tabIndex={-1}
          className={cn(
            "relative flex w-full flex-col overflow-hidden bg-white shadow-2xl outline-none",
            panel[variant],
            variant === "bottom" && "animate-[slide-up_.24s_cubic-bezier(.16,1,.3,1)]",
            variant === "right" && "animate-[slide-left_.24s_cubic-bezier(.16,1,.3,1)]",
            variant === "center" && "animate-[pop-in_.2s_cubic-bezier(.16,1,.3,1)]",
            className,
          )}
        >
          {title ? (
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-stone-100 px-5 py-4 pr-14 sm:px-6">
              <div>
                <h2 id={titleId} className="text-lg font-bold tracking-tight text-stone-900">
                  {title}
                </h2>
                {description ? (
                  <p className="mt-0.5 text-sm text-stone-500">{description}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", bodyClassName)}>
            {children}
          </div>

          {!hideClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className={cn(
                "absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-stone-600 shadow-sm ring-1 ring-stone-200/70 backdrop-blur transition hover:bg-white hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
                closeClassName,
              )}
            >
              <X className="h-4.5 w-4.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
