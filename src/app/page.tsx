import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  ChefHat,
  CreditCard,
  Database,
  BookOpen,
  MonitorSmartphone,
  Palette,
  Printer,
  Radio,
  ShoppingBag,
  Smartphone,
  Volume2,
  Zap,
} from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { getBrandStyle } from "@/lib/branding";

const demos = [
  {
    name: "Brasa Burger",
    slug: "brasa-burger",
    logo: "/brands/brasa-burger.svg",
    tagline: "Hambúrgueres artesanais na brasa, do jeito que você gosta.",
    color: "#ea580c",
    niche: "Hamburgueria",
  },
  {
    name: "Verde Vivo",
    slug: "verde-vivo",
    logo: "/brands/verde-vivo.svg",
    tagline: "Comida fresca, leve e cheia de cor, feita todos os dias.",
    color: "#16a34a",
    niche: "Saudável",
  },
];

const features = [
  {
    icon: Palette,
    title: "White-label de verdade",
    body: "Cada restaurante tem slug, logo, cor primária e configurações de impressão próprias. Zero código duplicado.",
  },
  {
    icon: ShoppingBag,
    title: "Carrinho com opções",
    body: "Grupos de adicionais com mínimo/máximo validados no cliente e recalculados no servidor.",
  },
  {
    icon: CreditCard,
    title: "Checkout completo",
    body: "Entrega, retirada ou mesa, com PIX, dinheiro (e troco) ou cartão. Pedido pronto para a cozinha.",
  },
  {
    icon: Radio,
    title: "Tempo real com SSE",
    body: "Novos pedidos aparecem no KDS na hora, com alerta sonoro e reconexão automática do EventSource.",
  },
  {
    icon: Printer,
    title: "Impressão 80mm",
    body: "Recibo térmico em pop-up com CSS @page, fonte monoespaçada e layout compatível com ESC/POS.",
  },
  {
    icon: Database,
    title: "Prisma + PostgreSQL",
    body: "Schema multi-tenant com preços em Decimal, snapshot dos itens e numeração sequencial por loja.",
  },
];

const phoneProducts = [
  {
    name: "Brasa Clássico",
    description: "Blend 180g, cheddar, bacon e molho da casa",
    price: "R$ 34,90",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Duplo Fogo",
    description: "Dois blends, queijo, cebola crocante e picância",
    price: "R$ 46,90",
    image:
      "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Batata Rústica",
    description: "Porção com alecrim e maionese defumada",
    price: "R$ 19,90",
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=200&q=80",
  },
];

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[292px] sm:w-[310px]">
      <div className="absolute -inset-12 rounded-full bg-brand/15 blur-3xl" aria-hidden />

      <div className="relative rounded-[2.9rem] border-[9px] border-stone-900 bg-stone-900 shadow-[0_40px_80px_-30px_rgba(28,25,23,.55)]">
        <div className="overflow-hidden rounded-[2.25rem] bg-[#faf8f5]">
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-rose-600 px-4 pb-5 pt-3 text-white">
            <div className="absolute inset-0 hero-grid opacity-40" aria-hidden />
            <div className="relative">
              <div className="mx-auto h-1.5 w-20 rounded-full bg-stone-900/80" />
              <div className="mt-4 flex items-center gap-2.5">
                <Image
                  src="/brands/brasa-burger.svg"
                  alt=""
                  width={38}
                  height={38}
                  className="rounded-xl ring-1 ring-white/20"
                />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold">Brasa Burger</p>
                  <p className="flex items-center gap-1 text-[10px] text-white/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Aberto · entrega 30–45 min
                  </p>
                </div>
              </div>
              <p className="mt-5 text-[22px] font-black leading-[1.1] tracking-tight">
                Bateu a fome?
              </p>
              <p className="mt-1 text-[11px] leading-snug text-white/80">
                Hambúrguer artesanal na brasa, feito na hora.
              </p>
            </div>
          </div>

          <div className="no-scrollbar flex gap-1.5 overflow-hidden px-3 py-2.5">
            <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[9px] font-bold text-white">
              Destaques
            </span>
            {["Burgers", "Acompanha", "Bebidas"].map((item) => (
              <span
                key={item}
                className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[9px] font-semibold text-stone-500 ring-1 ring-stone-200"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="space-y-1.5 px-3 pb-1">
            {phoneProducts.map((product) => (
              <div
                key={product.name}
                className="flex gap-2 rounded-xl bg-white p-1.5 ring-1 ring-stone-200/70"
              >
                <Image
                  src={product.image}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="truncate text-[10px] font-bold text-stone-900">
                    {product.name}
                  </p>
                  <p className="line-clamp-1 text-[8.5px] leading-snug text-stone-500">
                    {product.description}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold text-orange-600">
                    {product.price}
                  </p>
                </div>
                <div className="grid h-5 w-5 shrink-0 place-items-center self-center rounded-full bg-orange-600 text-[13px] font-bold text-white">
                  +
                </div>
              </div>
            ))}
          </div>

          <div className="m-3 flex items-center justify-between rounded-xl bg-stone-900 px-3 py-2.5 text-[10px] font-semibold text-white">
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" /> 2 itens
            </span>
            <span>Ver sacola · R$ 67,80</span>
          </div>
        </div>
      </div>

      <div className="absolute -left-14 top-24 hidden items-center gap-2.5 rounded-2xl border border-white bg-white/95 p-3 pr-4 shadow-xl backdrop-blur sm:flex">
        <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-[soft-pulse_1.8s_ease-in-out_infinite] rounded-full bg-emerald-500 ring-2 ring-white" />
          <Radio className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-bold text-stone-900">Novo pedido #0042</p>
          <p className="text-[9px] text-stone-500">Entrega · R$ 67,80</p>
        </div>
      </div>

      <div className="absolute -right-10 bottom-24 hidden items-center gap-2.5 rounded-2xl border border-white bg-white/95 p-3 pr-4 shadow-xl backdrop-blur sm:flex">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-100 text-orange-700">
          <Printer className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[10px] font-bold text-stone-900">Cupom 80mm</p>
          <p className="text-[9px] text-stone-500">Pronto para imprimir</p>
        </div>
      </div>
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-[#faf8f5]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-stone-900 text-orange-400">
            <ChefHat className="h-5 w-5" />
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-stone-900">
            MenuChef
          </span>
          <span className="hidden rounded-full bg-stone-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-500 sm:inline">
            MVP
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-stone-600 md:flex">
          <a href="#recursos" className="transition hover:text-stone-950">
            Recursos
          </a>
          <a href="#demos" className="transition hover:text-stone-950">
            Demos
          </a>
          <a href="#admin" className="transition hover:text-stone-950">
            Cozinha
          </a>
          <a href="#setup" className="transition hover:text-stone-950">
            Setup
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className={buttonStyles({
              variant: "ghost",
              size: "sm",
              className: "hidden sm:inline-flex",
            })}
          >
            <MonitorSmartphone className="h-4 w-4" />
            Admin
          </Link>
          <Link
            href="/brasa-burger"
            className={buttonStyles({ variant: "dark", size: "sm" })}
          >
            Ver demo
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#faf8f5]">
      <SiteHeader />

      <main>
        <section className="relative">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-gradient-to-b from-orange-50/80 via-[#faf8f5] to-transparent"
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-10 lg:px-8 lg:pb-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-orange-800 shadow-sm">
                <Zap className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                SaaS white-label de cardápio e delivery
              </div>

              <h1 className="mt-6 text-[2.65rem] font-black leading-[0.98] tracking-[-0.045em] text-stone-950 sm:text-6xl lg:text-[4.35rem]">
                Seu cardápio online.
                <br />
                Seu delivery.
                <span className="relative ml-0 inline-block text-orange-600">
                  {" "}
                  Sua marca.
                  <svg
                    className="absolute -bottom-2 left-0 w-full text-orange-300"
                    viewBox="0 0 300 12"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <path
                      d="M2 9C65 3 148 2 298 6"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
                Um MVP full-stack pronto para vender: cardápio mobile-first,
                checkout com adicionais, cozinha em tempo real e impressão
                térmica de 80mm. Tudo multi-tenant, com Next.js 15 e Prisma.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/brasa-burger"
                  className={buttonStyles({
                    variant: "brand",
                    size: "lg",
                    className:
                      "group rounded-2xl bg-stone-900 text-white shadow-lg shadow-stone-900/15 hover:bg-stone-800",
                  })}
                >
                  Abrir cardápio demo
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/admin"
                  className={buttonStyles({
                    variant: "outline",
                    size: "lg",
                    className: "rounded-2xl bg-white",
                  })}
                >
                  <MonitorSmartphone className="h-4 w-4" />
                  Ver cozinha ao vivo
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-stone-500">
                {[
                  "Next.js 15 App Router",
                  "Prisma + PostgreSQL",
                  "SSE em tempo real",
                  "Recibo 80mm",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <PhoneMockup />
          </div>
        </section>

        <section className="border-y border-stone-200/80 bg-white/60">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-stone-200/80 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {[
              { value: "2 tenants", label: "prontos no seed" },
              { value: "SSE", label: "pedidos sem refresh" },
              { value: "80mm", label: "layout de impressão" },
              { value: "10 models", label: "schema Prisma" },
            ].map((stat) => (
              <div key={stat.label} className="px-4 py-6 text-center sm:py-7">
                <p className="text-xl font-black tracking-tight text-stone-900 sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-stone-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="demos" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
              Multi-tenant na prática
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
              Dois restaurantes, uma plataforma.
            </h2>
            <p className="mt-4 text-stone-600">
              O mesmo código entrega identidades completamente diferentes. Troque
              o slug, a cor e o cardápio — o resto se adapta.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {demos.map((demo) => (
              <article
                key={demo.slug}
                style={getBrandStyle(demo.color)}
                className="group relative overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-brand" />
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-soft opacity-70 blur-2xl transition group-hover:scale-110" />

                <div className="relative p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Image
                        src={demo.logo}
                        alt={demo.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-2xl shadow-md ring-1 ring-stone-900/5"
                      />
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-brand-strong">
                          {demo.niche}
                        </p>
                        <h3 className="mt-1 text-2xl font-black tracking-tight text-stone-900">
                          {demo.name}
                        </h3>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                      ABERTO
                    </span>
                  </div>

                  <p className="mt-5 max-w-md text-sm leading-relaxed text-stone-600">
                    {demo.tagline}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-[11px] font-medium text-stone-500">
                    <span className="rounded-full bg-stone-100 px-2.5 py-1">Cardápio</span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1">Delivery</span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1">KDS</span>
                  </div>

                  <div className="mt-7 flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={`/${demo.slug}`}
                      className={buttonStyles({
                        variant: "brand",
                        size: "md",
                        className: "flex-1",
                      })}
                    >
                      Abrir cardápio
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/admin/${demo.slug}`}
                      className={buttonStyles({
                        variant: "outline",
                        size: "md",
                        className: "flex-1",
                      })}
                    >
                      <MonitorSmartphone className="h-4 w-4" />
                      Cozinha
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="recursos" className="border-y border-stone-200/80 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
                  O que já está pronto
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
                  Um MVP com as partes difíceis resolvidas.
                </h2>
                <p className="mt-4 leading-relaxed text-stone-600">
                  Sem tela de login para cortar caminho, mas com a base de dados,
                  validação de preços e operação de cozinha prontas para evoluir.
                </p>
                <Link
                  href="#setup"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-orange-700 transition hover:text-orange-800"
                >
                  Ver como rodar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-stone-200/80 bg-[#faf8f5] p-5 transition hover:border-orange-200 hover:bg-orange-50/50"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-orange-600 shadow-sm ring-1 ring-stone-200">
                      <feature.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-bold tracking-tight text-stone-900">
                      {feature.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-stone-600">
                      {feature.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="admin" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-stone-950 text-white shadow-2xl shadow-stone-950/20">
            <div className="grid lg:grid-cols-2">
              <div className="relative p-8 sm:p-12 lg:p-14">
                <div
                  className="pointer-events-none absolute inset-0 dot-grid opacity-[0.07]"
                  aria-hidden
                />
                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-300">
                    <span className="h-1.5 w-1.5 animate-[soft-pulse_1.8s_ease-in-out_infinite] rounded-full bg-emerald-400" />
                    Ao vivo via SSE
                  </span>
                  <h2 className="mt-5 max-w-md text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                    A cozinha acompanha no mesmo segundo.
                  </h2>
                  <p className="mt-4 max-w-md leading-relaxed text-stone-400">
                    Novos pedidos entram na fila, disparam alerta sonoro e podem
                    avançar de status com um toque. Cada card imprime um cupom
                    térmico de 80mm formatado para balcão.
                  </p>

                  <ul className="mt-7 space-y-3">
                    {[
                      "Fila por status: pendente, preparo, pronto e entrega",
                      "Alerta sonoro com Web Audio API",
                      "Impressão 80mm com layout ESC/POS",
                      "Reconexão automática sem perder pedidos",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-stone-300">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
                          <Check className="h-3 w-3" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/admin/brasa-burger"
                    className={buttonStyles({
                      variant: "white",
                      size: "lg",
                      className: "mt-9 rounded-2xl",
                    })}
                  >
                    <Volume2 className="h-4 w-4" />
                    Abrir KDS demo
                  </Link>
                </div>
              </div>

              <div className="relative border-t border-white/10 bg-stone-900/60 p-5 sm:p-8 lg:border-l lg:border-t-0">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" aria-hidden />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold text-stone-300">
                        Cozinha · Brasa Burger
                      </span>
                    </div>
                    <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold text-stone-300">
                      12:42
                    </span>
                  </div>

                  <div className="mt-4 flex gap-1.5">
                    {[
                      ["Pendentes", "1"],
                      ["Em preparo", "2"],
                      ["Prontos", "0"],
                      ["Entrega", "1"],
                    ].map(([label, count], index) => (
                      <div
                        key={label}
                        className={`rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${
                          index === 0
                            ? "bg-orange-500 text-white"
                            : "bg-white/5 text-stone-400"
                        }`}
                      >
                        {label} {count}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-orange-400/30 bg-stone-950 p-4 ring-1 ring-orange-500/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-orange-500 px-2 py-1 text-xs font-black text-white">
                            #0042
                          </span>
                          <span className="text-[10px] font-semibold text-stone-400">
                            há 2 min
                          </span>
                        </div>
                        <span className="rounded-full bg-sky-500/15 px-2 py-1 text-[9px] font-bold text-sky-300">
                          ENTREGA
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-bold text-white">Marina Souza</p>
                      <p className="text-[10px] text-stone-400">
                        Rua das Palmeiras, 128 · (11) 98888-1234
                      </p>
                      <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-[11px] text-stone-300">
                        <div className="flex justify-between">
                          <span>1x Brasa Clássico</span>
                          <span className="tabular-nums">R$ 34,90</span>
                        </div>
                        <div className="flex justify-between">
                          <span>+ Cheddar extra</span>
                          <span className="tabular-nums">R$ 3,00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>2x Batata Rústica</span>
                          <span className="tabular-nums">R$ 39,80</span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button className="flex-1 rounded-lg bg-orange-500 px-3 py-2 text-[11px] font-bold text-white">
                          Iniciar preparo
                        </button>
                        <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-stone-400">
                          <Printer className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-stone-950 p-4 opacity-70">
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-black text-white">
                          #0041
                        </span>
                        <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[9px] font-bold text-emerald-300">
                          RETIRADA
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-bold text-white">Lucas Prado</p>
                      <p className="text-[10px] text-stone-400">2x Duplo Fogo · R$ 93,80</p>
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-[10px] font-semibold text-emerald-300">
                        <Check className="h-3.5 w-3.5" />
                        Pronto para retirada
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="setup" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
          <div className="grid gap-8 rounded-3xl border border-stone-200 bg-white p-7 shadow-sm sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
                Developer experience
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-stone-950">
                Do clone ao pedido em minutos.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-stone-600">
                O seed cria dois restaurantes, cardápios com adicionais e pedidos
                de exemplo em todos os estágios da cozinha. Tudo tipado com
                TypeScript e validado com Zod.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="https://github.com/ErikMartinsss-hub/MenuChef#readme"
                  target="_blank"
                  rel="noreferrer"
                  className={buttonStyles({ variant: "dark", size: "md" })}
                >
                  <BookOpen className="h-4 w-4" />
                  README completo
                </Link>
                <Link
                  href="/verde-vivo"
                  className={buttonStyles({ variant: "outline", size: "md" })}
                >
                  <Smartphone className="h-4 w-4" />
                  Ver outro tenant
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 shadow-xl">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-2 text-[10px] font-medium text-stone-500">
                  terminal
                </span>
              </div>
              <pre className="overflow-x-auto p-5 text-[12px] leading-7 text-stone-300">
                <code>
                  <span className="text-emerald-400">$</span> npm install{"\n"}
                  <span className="text-emerald-400">$</span> docker compose up -d{"\n"}
                  <span className="text-emerald-400">$</span> cp .env.example .env{"\n"}
                  <span className="text-emerald-400">$</span> npm run db:push{"\n"}
                  <span className="text-emerald-400">$</span> npm run db:seed{"\n"}
                  <span className="text-emerald-400">$</span> npm run dev{"\n"}
                  <span className="text-stone-500">
                    {"  "}ready - http://localhost:3000
                  </span>
                </code>
              </pre>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-stone-900 text-orange-400">
              <ChefHat className="h-4 w-4" />
            </span>
            <span className="font-bold text-stone-900">MenuChef</span>
            <span className="text-xs">White-label menu & delivery starter</span>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <Link href="/brasa-burger" className="transition hover:text-stone-900">
              Cardápio demo
            </Link>
            <Link href="/admin" className="transition hover:text-stone-900">
              KDS
            </Link>
            <Link
              href="https://github.com/ErikMartinsss-hub/MenuChef"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 transition hover:text-stone-900"
            >
              <BookOpen className="h-3.5 w-3.5" />
              README
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
