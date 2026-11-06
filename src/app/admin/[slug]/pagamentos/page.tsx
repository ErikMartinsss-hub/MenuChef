import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TenantPaymentSettingsPanel } from "@/components/admin/payment-settings-panel";
import { getTenantSummary } from "@/lib/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await getTenantSummary(slug);
  return {
    title: tenant ? `${tenant.name} · Pagamentos` : "Pagamentos",
    description: "Configurações de pagamento do restaurante.",
  };
}

export default async function PaymentSettingsPage({ params }: PageProps) {
  const { slug } = await params;
  const tenant = await getTenantSummary(slug);

  if (!tenant) notFound();

  return (
    <main className="min-h-dvh bg-stone-950 text-stone-100">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">
              Configurações
            </p>
            <h1
              className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl"
              style={{ color: tenant.primaryColor }}
            >
              {tenant.name} · Pagamentos
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-stone-400">
            <span className="hidden rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-semibold sm:inline">
              {tenant.payment.pixEnabled ? "PIX ativo" : "PIX off"} ·{" "}
              {tenant.payment.cashEnabled ? "Dinheiro ativo" : "Dinheiro off"} ·{" "}
              {tenant.payment.cardEnabled ? "Cartão ativo" : "Cartão off"}
            </span>
            <a
              href={`/${tenant.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-semibold text-stone-300 transition hover:bg-white/5 hover:text-white"
            >
              Abrir cardápio
            </a>
          </div>
        </div>

        <div className="mt-6">
          <TenantPaymentSettingsPanel key={tenant.slug} tenant={tenant} />
        </div>

        <p className="mt-4 text-[10px] leading-relaxed text-stone-600">
          Rotas: <code className="text-stone-400">GET/PUT /api/tenants/[slug]/payment-settings</code>
        </p>
      </div>
    </main>
  );
}
