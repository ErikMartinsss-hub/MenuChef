"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import { cn } from "@/lib/utils";
import type { CategoryDTO, ProductDTO } from "@/types";

export function MenuBrowser({
  categories,
  onSelectProduct,
  readOnly,
}: {
  categories: CategoryDTO[];
  onSelectProduct: (product: ProductDTO) => void;
  readOnly?: boolean;
}) {
  const visibleCategories = useMemo(
    () => categories.filter((category) => category.products.length > 0),
    [categories],
  );
  const [activeId, setActiveId] = useState(visibleCategories[0]?.id ?? "");
  const frame = useRef<number | null>(null);

  const scrollToCategory = useCallback((id: string) => {
    setActiveId(id);
    const element = document.getElementById(`category-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    function updateActive() {
      const offset = 150;
      let current = visibleCategories[0]?.id;

      for (const category of visibleCategories) {
        const element = document.getElementById(`category-${category.id}`);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= offset) {
          current = category.id;
        } else {
          break;
        }
      }

      if (current) setActiveId(current);
    }

    function onScroll() {
      if (frame.current != null) return;
      frame.current = window.requestAnimationFrame(() => {
        updateActive();
        frame.current = null;
      });
    }

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current != null) window.cancelAnimationFrame(frame.current);
    };
  }, [visibleCategories]);

  if (visibleCategories.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg font-bold text-stone-900">Cardápio em atualização</p>
        <p className="mt-2 text-sm text-stone-500">
          Nenhum produto disponível no momento. Volte em breve.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-16 z-30 border-b border-stone-200/80 bg-[#faf8f5]/92 backdrop-blur-xl">
        <div className="no-scrollbar mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-3">
          {visibleCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => scrollToCategory(category.id)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition",
                activeId === category.id
                  ? "bg-brand text-brand-foreground shadow-sm"
                  : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50 hover:text-stone-900",
              )}
            >
              {category.name}
              <span
                className={cn(
                  "ml-1.5 text-[10px] font-semibold",
                  activeId === category.id ? "text-white/70" : "text-stone-400",
                )}
              >
                {category.products.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-28 pt-2">
        {visibleCategories.map((category, index) => (
          <section
            key={category.id}
            id={`category-${category.id}`}
            className="scroll-mt-32 pb-3 pt-7"
          >
            <div className="mb-3.5 flex items-end justify-between gap-3 px-0.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-strong">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-0.5 text-xl font-black tracking-tight text-stone-950">
                  {category.name}
                </h2>
              </div>
              <span className="pb-1 text-[11px] font-medium text-stone-400">
                {category.products.length}{" "}
                {category.products.length === 1 ? "item" : "itens"}
              </span>
            </div>

            <div className="space-y-2.5">
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                  disabled={readOnly}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
