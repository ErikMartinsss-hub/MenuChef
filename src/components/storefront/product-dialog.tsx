"use client";

import { useMemo, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { ProductImage } from "@/components/ui/product-image";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { NewCartLine } from "@/hooks/use-cart";
import type { ProductDTO, ProductOptionGroupDTO, SelectedOption } from "@/types";

function GroupOption({
  group,
  option,
  selected,
  disabled,
  onToggle,
}: {
  group: ProductOptionGroupDTO;
  option: ProductOptionGroupDTO["options"][number];
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const isRadio = group.maxChoices <= 1;

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition",
        selected
          ? "border-brand/50 bg-brand-softer"
          : "border-stone-200 bg-white hover:border-stone-300",
        disabled && "cursor-not-allowed opacity-45",
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <input
          type={isRadio ? "radio" : "checkbox"}
          name={`group-${group.id}`}
          className="sr-only"
          checked={selected}
          disabled={disabled}
          onChange={onToggle}
        />
        <span
          className={cn(
            "grid h-5 w-5 shrink-0 place-items-center border-2 transition",
            isRadio ? "rounded-full" : "rounded-md",
            selected
              ? "border-brand bg-brand text-brand-foreground"
              : "border-stone-300 bg-white",
          )}
        >
          {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
        </span>
        <span className="text-sm font-medium text-stone-800">{option.name}</span>
      </span>
      <span
        className={cn(
          "shrink-0 text-xs font-semibold tabular-nums",
          option.price > 0 ? "text-stone-700" : "text-stone-400",
        )}
      >
        {option.price > 0 ? `+ ${formatBRL(option.price)}` : "Grátis"}
      </span>
    </label>
  );
}

export function ProductDialog({
  open,
  product,
  onClose,
  onAdd,
}: {
  open: boolean;
  product: ProductDTO;
  onClose: () => void;
  onAdd: (line: NewCartLine) => void;
}) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedOptions = useMemo<SelectedOption[]>(
    () =>
      product.optionGroups.flatMap((group) =>
        group.options
          .filter((option) => (selections[group.id] ?? []).includes(option.id))
          .map((option) => ({
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            price: option.price,
          })),
      ),
    [product.optionGroups, selections],
  );

  const unitPrice =
    product.price + selectedOptions.reduce((sum, option) => sum + option.price, 0);
  const total = unitPrice * quantity;

  function toggleOption(group: ProductOptionGroupDTO, optionId: string) {
    const current = selections[group.id] ?? [];
    const exists = current.includes(optionId);

    let next: string[];
    if (group.maxChoices <= 1) {
      next = [optionId];
    } else if (exists) {
      next = current.filter((id) => id !== optionId);
    } else {
      if (current.length >= group.maxChoices) return;
      next = [...current, optionId];
    }

    setSelections((previous) => ({ ...previous, [group.id]: next }));
    setErrors((previous) => {
      if (!previous[group.id]) return previous;
      const copy = { ...previous };
      delete copy[group.id];
      return copy;
    });
  }

  function handleAdd() {
    const nextErrors: Record<string, string> = {};

    for (const group of product.optionGroups) {
      const count = (selections[group.id] ?? []).length;
      if (count < group.minChoices) {
        nextErrors[group.id] =
          group.minChoices === 1
            ? "Escolha 1 opção"
            : `Escolha ao menos ${group.minChoices} opções`;
      }
      if (count > group.maxChoices) {
        nextErrors[group.id] = `Escolha no máximo ${group.maxChoices} opções`;
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Confira as opções obrigatórias");
      return;
    }

    onAdd({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      basePrice: product.price,
      unitPrice,
      options: selectedOptions,
      notes,
      quantity,
    });

    toast.success("Adicionado à sacola", {
      description: `${quantity}x ${product.name}`,
    });
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      variant="bottom"
      className="sm:max-w-lg"
      bodyClassName="flex flex-col"
      closeClassName="right-4 top-4"
    >
      <div className="relative h-48 w-full shrink-0 sm:h-56">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(max-width: 640px) 100vw, 512px"
          className="h-full w-full"
          priority
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
            {product.optionGroups.length > 0 ? "Monte do seu jeito" : "Do cardápio"}
          </p>
          <h2 className="mt-1 text-2xl font-black leading-tight tracking-tight text-white drop-shadow-sm">
            {product.name}
          </h2>
        </div>
      </div>

      <div className="flex-1 px-5 pb-5 pt-4">
        {product.description ? (
          <p className="text-sm leading-relaxed text-stone-600">{product.description}</p>
        ) : null}

        <div className="mt-5 space-y-6">
          {product.optionGroups.map((group) => {
            const selectedCount = (selections[group.id] ?? []).length;
            const required = group.minChoices > 0;

            return (
              <fieldset key={group.id}>
                <div className="mb-2.5 flex items-start justify-between gap-3">
                  <div>
                    <legend className="flex items-center gap-2 text-sm font-bold text-stone-900">
                      {group.name}
                      {required ? (
                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-brand-strong">
                          Obrigatório
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-stone-400">
                          Opcional
                        </span>
                      )}
                    </legend>
                    <p className="mt-0.5 text-[11px] text-stone-500">
                      {group.maxChoices <= 1
                        ? "Escolha 1 opção"
                        : `Escolha até ${group.maxChoices} opções`}
                      {selectedCount > 0 ? ` · ${selectedCount} selecionada(s)` : ""}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {group.options.map((option) => {
                    const selected = (selections[group.id] ?? []).includes(option.id);
                    const disabled =
                      group.maxChoices > 1 &&
                      !selected &&
                      selectedCount >= group.maxChoices;

                    return (
                      <GroupOption
                        key={option.id}
                        group={group}
                        option={option}
                        selected={selected}
                        disabled={disabled}
                        onToggle={() => toggleOption(group, option.id)}
                      />
                    );
                  })}
                </div>

                {errors[group.id] ? (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    {errors[group.id]}
                  </p>
                ) : null}
              </fieldset>
            );
          })}

          <div>
            <label
              htmlFor="product-notes"
              className="text-sm font-bold text-stone-900"
            >
              Alguma observação?
            </label>
            <textarea
              id="product-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={240}
              rows={2}
              placeholder="Ex: sem cebola, ponto da carne bem passado..."
              className="mt-2 w-full resize-none rounded-xl border border-stone-200 bg-stone-50/60 px-3.5 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-brand/60 focus:bg-white focus:ring-2 focus:ring-brand/15"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-stone-700">Quantidade</span>
            <QuantityStepper value={quantity} onChange={setQuantity} max={50} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-stone-100 bg-white/95 p-4 backdrop-blur sm:p-5">
        <Button size="lg" className="w-full justify-between" onClick={handleAdd}>
          <span className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Adicionar
          </span>
          <span className="tabular-nums">{formatBRL(total)}</span>
        </Button>
      </div>
    </Dialog>
  );
}
