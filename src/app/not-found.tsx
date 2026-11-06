import Link from "next/link";
import { ChefHat, Home, UtensilsCrossed } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#faf8f5] px-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-stone-900 text-orange-400">
          <ChefHat className="h-7 w-7" />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
          Erro 404
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-stone-950">
          Esse prato não está no cardápio.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-500">
          O restaurante ou a página que você procura não existe, mudou de slug ou
          saiu do ar.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/brasa-burger"
            className={buttonStyles({ variant: "brand", size: "md" })}
          >
            <UtensilsCrossed className="h-4 w-4" />
            Ver cardápio demo
          </Link>
          <Link
            href="/"
            className={buttonStyles({ variant: "outline", size: "md" })}
          >
            <Home className="h-4 w-4" />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
