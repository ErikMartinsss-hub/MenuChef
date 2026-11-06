import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "MenuChef — Cardápio online e delivery white-label",
    template: "%s · MenuChef",
  },
  description:
    "Starter SaaS white-label de cardápio online e delivery com Next.js 15, Prisma, PostgreSQL e pedidos em tempo real via SSE.",
  applicationName: "MenuChef",
  keywords: [
    "cardápio online",
    "delivery",
    "white-label",
    "restaurante",
    "Next.js",
    "Prisma",
  ],
  authors: [{ name: "MenuChef" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#faf8f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
