import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KitchenDashboard } from "@/components/admin/kitchen-dashboard";
import { getKitchenData } from "@/lib/queries";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getKitchenData(slug);
  return {
    title: data ? `${data.tenant.name} · Cozinha` : "Cozinha",
    description: "KDS em tempo real para acompanhar e avançar pedidos.",
  };
}

export default async function KitchenPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getKitchenData(slug);

  if (!data) notFound();

  return (
    <KitchenDashboard
      tenant={data.tenant}
      tenants={data.tenants}
      initialActiveOrders={data.activeOrders}
      initialCompletedOrders={data.completedOrders}
    />
  );
}
