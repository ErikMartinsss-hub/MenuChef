import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, ChefHat, Database } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { getTenants } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cozinha",
};

function EmptySetup() {
  return (
    <div className="grid min-h-dvh place-items-center bg-stone-950 px-4 py-10 text-stone-100">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-stone-900 p-7 shadow-2xl sm:p-9">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-brand-foreground">
            <ChefHat className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
              MenuChef · Cozinha
            </p>
            <h1 className="text-xl font-black tracking-tight text-white">
              Banco sem restaurantes
            </h1>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-stone-400">
          O KDS precisa de pelo menos um tenant. Rode as migrações e o seed para
          criar os dois restaurantes de demonstração:
        </p>

        <div className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-stone-950 p-4 font-mono text-xs text-stone-300">
          <p>
            <span className="text-emerald-400">$</span> docker compose up -d
          </p>
          <p>
            <span className="text-emerald-400">$</span> cp .env.example .env
          </p>
          <p>
            <span className="text-emerald-400">$</span> npm run db:push
          </p>
          <p>
            <span className="text-emerald-400">$</span> npm run db:seed
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href="https://github.com/ErikMartinsss-hub/MenuChef#readme"
            target="_blank"
            rel="noreferrer"
            className={buttonStyles({
              variant: "white",
              size: "md",
              className: "flex-1",
            })}
          >
            <BookOpen className="h-4 w-4" />
            Abrir README
          </Link>
          <Link
            href="/"
            className={buttonStyles({
              variant: "outline",
              size: "md",
              className:
                "flex-1 border-white/10 bg-white/5 text-stone-200 hover:bg-white/10 hover:text-white",
            })}
          >
            Voltar ao início
          </Link>
        </div>

        <div className="mt-6 flex items-start gap-2 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-stone-500">
          <Database className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Se o banco estiver vazio mas o seed já tiver rodado, confira se a
          DATABASE_URL aponta para o banco correto.
        </div>
      </div>
    </div>
  );
}

export default async function AdminIndexPage() {
  const tenants = await getTenants();

  if (tenants.length === 0) {
    return <EmptySetup />;
  }

  const preferredSlug = process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG;
  const target =
    tenants.find((tenant) => tenant.slug === preferredSlug) ?? tenants[0];

  redirect(`/admin/${target.slug}`);
}
