"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SelectedOption } from "@/types";

const MAX_QUANTITY = 50;

export interface CartLine {
  key: string;
  productId: string;
  name: string;
  imageUrl: string | null;
  basePrice: number;
  unitPrice: number;
  quantity: number;
  options: SelectedOption[];
  notes: string;
}

export type NewCartLine = Omit<CartLine, "key" | "quantity"> & {
  quantity?: number;
};

function makeKey(
  productId: string,
  options: SelectedOption[],
  notes: string,
): string {
  const optionIds = options
    .map((option) => option.optionId)
    .sort()
    .join(",");
  return `${productId}|${optionIds}|${notes.trim().toLowerCase()}`;
}

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.key === "string" &&
    typeof line.productId === "string" &&
    typeof line.name === "string" &&
    typeof line.unitPrice === "number" &&
    typeof line.quantity === "number" &&
    Array.isArray(line.options)
  );
}

export function useCart(tenantSlug: string) {
  const storageKey = `menuchef:cart:${tenantSlug}`;
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setLines(parsed.filter(isCartLine));
        }
      }
    } catch {
      // Corrupted storage should never break the menu.
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(lines));
    } catch {
      // Ignore private-mode/quota errors.
    }
  }, [lines, hydrated, storageKey]);

  const addLine = useCallback((candidate: NewCartLine) => {
    const notes = candidate.notes.trim();
    const key = makeKey(candidate.productId, candidate.options, notes);

    setLines((previous) => {
      const existing = previous.find((line) => line.key === key);
      if (existing) {
        return previous.map((line) =>
          line.key === key
            ? {
                ...line,
                quantity: Math.min(MAX_QUANTITY, line.quantity + (candidate.quantity ?? 1)),
              }
            : line,
        );
      }

      return [
        ...previous,
        {
          ...candidate,
          key,
          notes,
          quantity: Math.min(MAX_QUANTITY, candidate.quantity ?? 1),
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setLines((previous) =>
      previous
        .map((line) =>
          line.key === key
            ? {
                ...line,
                quantity: Math.min(MAX_QUANTITY, Math.max(0, quantity)),
              }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((previous) => previous.filter((line) => line.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines],
  );

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [lines],
  );

  return {
    lines,
    hydrated,
    itemCount,
    subtotal,
    addLine,
    updateQuantity,
    removeLine,
    clear,
  };
}
