const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(value: number): string {
  return brl.format(Number.isFinite(value) ? value : 0);
}

/** Convert a Prisma Decimal / string / number into integer cents. */
export function toCents(value: number | string | { toString(): string }): number {
  return Math.round(Number(value.toString()) * 100);
}

export function fromCents(cents: number): number {
  return Math.round(cents) / 100;
}
