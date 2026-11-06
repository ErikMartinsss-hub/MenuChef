"use client";

import { Plus } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { formatBRL } from "@/lib/money";
import type { ProductDTO } from "@/types";

export function ProductCard({
  product,
  onSelect,
  disabled,
}: {
  product: ProductDTO;
  onSelect: (product: ProductDTO) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      disabled={disabled}
      className="group flex w-full items-stretch gap-3.5 rounded-2xl border border-stone-200/80 bg-white p-3 text-left shadow-[0_1px_2px_rgba(28,25,23,.03)] transition duration-200 hover:border-stone-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60 sm:p-3.5"
    >
      <ProductImage
        src={product.imageUrl}
        alt={product.name}
        sizes="(max-width: 640px) 96px, 112px"
        className="h-24 w-24 shrink-0 rounded-xl sm:h-28 sm:w-28"
      />

      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <h3 className="text-[15px] font-bold leading-snug tracking-tight text-stone-900">
          {product.name}
        </h3>
        {product.description ? (
          <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-stone-500">
            {product.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-[15px] font-extrabold tracking-tight text-stone-900">
              {formatBRL(product.price)}
            </p>
            {product.optionGroups.length > 0 ? (
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-400">
                Com opções
              </p>
            ) : null}
          </div>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground shadow-sm transition group-hover:scale-105 group-hover:bg-brand-strong">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </button>
  );
}
