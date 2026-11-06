import { cn } from "@/lib/utils";

export function TenantLogo({
  src,
  name,
  className,
  imgClassName,
}: {
  src: string | null;
  name: string;
  className?: string;
  imgClassName?: string;
}) {
  if (src) {
    return (
      <span
        className={cn(
          "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-black/5",
          className,
        )}
      >
        {/* White-label logos can live on any domain, so we intentionally use an
            unoptimized <img> instead of Next/Image's remote allow-list. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`Logo ${name}`}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      </span>
    );
  }

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-2xl bg-brand font-black text-brand-foreground",
        className,
      )}
      aria-label={name}
    >
      {initials}
    </span>
  );
}
