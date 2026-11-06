import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Storefront } from "@/components/storefront/storefront";
import { getStorefrontTenant } from "@/lib/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await getStorefrontTenant(slug);
  if (!tenant) return { title: "Restaurante não encontrado" };

  const description =
    tenant.tagline ??
    `Confira o cardápio de ${tenant.name} e peça online com entrega ou retirada.`;

  return {
    title: tenant.name,
    description,
    openGraph: {
      title: `${tenant.name} · Cardápio online`,
      description,
      type: "website",
      images: tenant.logo ? [{ url: tenant.logo }] : undefined,
    },
  };
}

export default async function StorefrontPage({ params }: PageProps) {
  const { slug } = await params;
  const tenant = await getStorefrontTenant(slug);

  if (!tenant) notFound();

  return <Storefront tenant={tenant} />;
}
