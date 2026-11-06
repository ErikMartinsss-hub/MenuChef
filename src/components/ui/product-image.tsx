"use client";

import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductImage({
  src,
  alt,
  sizes,
  className,
  priority = false,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "grid place-items-center bg-gradient-to-br from-brand-soft via-stone-100 to-stone-200 text-brand-strong",
          className,
        )}
        aria-label={alt}
      >
        <UtensilsCrossed className="h-6 w-6 opacity-60" strokeWidth={1.7} />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-stone-100", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition duration-500 group-hover:scale-[1.04]"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
