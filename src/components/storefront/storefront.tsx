"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { getBrandStyle } from "@/lib/branding";
import { useCart } from "@/hooks/use-cart";
import { formatPhone } from "@/lib/utils";
import { TenantLogo } from "@/components/tenant-logo";
import { StoreHeader, StoreHero, ClosedBanner } from "@/components/storefront/store-header";
import { MenuBrowser } from "@/components/storefront/menu-browser";
import { ProductDialog } from "@/components/storefront/product-dialog";
import { CartDialog } from "@/components/storefront/cart-dialog";
import { CartBar } from "@/components/storefront/cart-bar";
import { CheckoutDialog } from "@/components/storefront/checkout-dialog";
import { OrderSuccessDialog } from "@/components/storefront/order-success-dialog";
import type { OrderDTO, ProductDTO, TenantDTO } from "@/types";

export function Storefront({ tenant }: { tenant: TenantDTO }) {
  const cart = useCart(tenant.slug);
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<OrderDTO | null>(null);

  function handleOrderSuccess(order: OrderDTO) {
    cart.clear();
    setCheckoutOpen(false);
    setCartOpen(false);
    setLastOrder(order);
    toast.success(`Pedido #${order.orderNumber} enviado para a cozinha!`);
  }

  return (
    <div
      style={getBrandStyle(tenant.primaryColor)}
      className="min-h-dvh bg-[#faf8f5] text-stone-900"
    >
      <StoreHeader
        tenant={tenant}
        itemCount={cart.itemCount}
        onOpenCart={() => setCartOpen(true)}
      />

      <main>
        <StoreHero tenant={tenant} />
        {!tenant.isOpen ? <ClosedBanner /> : null}
        <MenuBrowser
          categories={tenant.categories}
          onSelectProduct={setSelectedProduct}
        />
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex items-center gap-3">
            <TenantLogo
              src={tenant.logo}
              name={tenant.name}
              className="h-10 w-10 rounded-xl"
            />
            <div>
              <p className="text-sm font-extrabold tracking-tight text-stone-900">
                {tenant.name}
              </p>
              <p className="text-[11px] text-stone-500">
                {tenant.tagline ?? "Cardápio online e delivery"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-xs text-stone-500">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tenant.address)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2 transition hover:text-stone-800"
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {tenant.address}
            </a>
            <a
              href={`tel:${tenant.phone.replace(/\D/g, "")}`}
              className="flex items-center gap-2 transition hover:text-stone-800"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" />
              {formatPhone(tenant.phone)}
            </a>
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-stone-100 pt-4 text-[10px] text-stone-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} {tenant.name}</span>
            <Link href="/" className="font-semibold transition hover:text-stone-700">
              Cardápio online por MenuChef
            </Link>
          </div>
        </div>
      </footer>

      <CartBar
        visible={cart.hydrated}
        itemCount={cart.itemCount}
        subtotal={cart.subtotal}
        onOpen={() => setCartOpen(true)}
      />

      {selectedProduct ? (
        <ProductDialog
          key={selectedProduct.id}
          open={Boolean(selectedProduct)}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={cart.addLine}
        />
      ) : null}

      <CartDialog
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        tenant={tenant}
        lines={cart.lines}
        itemCount={cart.itemCount}
        subtotal={cart.subtotal}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeLine}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        tenant={tenant}
        lines={cart.lines}
        subtotal={cart.subtotal}
        onSuccess={handleOrderSuccess}
      />

      <OrderSuccessDialog
        open={Boolean(lastOrder)}
        order={lastOrder}
        tenant={tenant}
        onClose={() => setLastOrder(null)}
      />
    </div>
  );
}
