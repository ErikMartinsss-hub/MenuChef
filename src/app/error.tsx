"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#faf8f5] px-4">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertTriangle className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-black tracking-tight text-stone-950">
          Algo saiu da cozinha errado.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-500">
          Não conseguimos carregar esta página. Verifique a conexão com o banco de
          dados e tente novamente.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-[10px] text-stone-400">
            ref: {error.digest}
          </p>
        ) : null}
        <Button className="mt-6" onClick={reset}>
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
