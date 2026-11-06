import type { CSSProperties } from "react";

const FALLBACK = "#ea580c";

export function normalizeHex(input: string | null | undefined): string {
  if (!input) return FALLBACK;
  const value = input.trim();
  const short = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(value);
  if (short) {
    return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`.toLowerCase();
  }
  const full = /^#?([a-f\d]{6})$/i.exec(value);
  return full ? `#${full[1].toLowerCase()}` : FALLBACK;
}

function hexToRgb(hex: string): [number, number, number] {
  const value = normalizeHex(hex).slice(1);
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

function rgbToHex(rgb: [number, number, number]): string {
  return `#${rgb
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function mixColor(
  hex: string,
  target: "white" | "black",
  amount: number,
): string {
  const source = hexToRgb(hex);
  const destination = target === "white" ? 255 : 0;
  const ratio = Math.min(Math.max(amount, 0), 1);
  return rgbToHex([
    source[0] + (destination - source[0]) * ratio,
    source[1] + (destination - source[1]) * ratio,
    source[2] + (destination - source[2]) * ratio,
  ]);
}

export function readableForeground(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const linear = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  return luminance > 0.55 ? "#1c1917" : "#ffffff";
}

export type BrandStyle = CSSProperties & Record<`--${string}`, string>;

/** Theme CSS variables consumed by the Tailwind @theme tokens. */
export function getBrandStyle(primaryColor: string | null | undefined): BrandStyle {
  const brand = normalizeHex(primaryColor);
  return {
    "--brand": brand,
    "--brand-strong": mixColor(brand, "black", 0.18),
    "--brand-soft": mixColor(brand, "white", 0.9),
    "--brand-softer": mixColor(brand, "white", 0.96),
    "--brand-foreground": readableForeground(brand),
  } as BrandStyle;
}
