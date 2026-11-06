"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BellRing,
  Bike,
  CheckCircle2,
  ExternalLink,
  Flame,
  Inbox,
  RefreshCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { TenantLogo } from "@/components/tenant-logo";
import { OrderCard, printFailureToast } from "@/components/admin/order-card";
import { useKitchenSound } from "@/hooks/use-kitchen-sound";
import { useNow } from "@/hooks/use-now";
import { useOrderStream, type StreamStatus } from "@/hooks/use-order-stream";
import {
  ACTIVE_STATUSES,
  ORDER_TYPE_SHORT,
  STATUS_LABEL,
  formatTime,
} from "@/lib/format";
import { formatBRL } from "@/lib/money";
import { printOrderReceipt } from "@/lib/receipt";
import { cn } from "@/lib/utils";
import type {
  OrderDTO,
  OrderStatus,
  PrintSettings,
  RealtimeOrderEvent,
  TenantSummaryDTO,
} from "@/types";

type DashboardTenant = TenantSummaryDTO & { printSettings: PrintSettings };

const tabs: Array<{
  status: OrderStatus;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof Inbox;
}> = [
  {
    status: "PENDING",
    label: "Pendentes",
    shortLabel: "Pendentes",
    description: "Pedidos aguardando o início do preparo.",
    icon: Inbox,
  },
  {
    status: "PREPARING",
    label: "Em preparo",
    shortLabel: "Preparo",
    description: "Pedidos que já estão na chapa.",
    icon: Flame,
  },
  {
    status: "READY",
    label: "Prontos",
    shortLabel: "Prontos",
    description: "Prontos para retirada, mesa ou saída para entrega.",
    icon: BellRing,
  },
  {
    status: "DISPATCHED",
    label: "Em entrega",
    shortLabel: "Entrega",
    description: "Pedidos que saíram para entrega.",
    icon: Bike,
  },
  {
    status: "COMPLETED",
    label: "Concluídos",
    shortLabel: "Concluídos",
    description: "Últimos 20 pedidos finalizados.",
    icon: CheckCircle2,
  },
];

function upsertOrder(list: OrderDTO[], order: OrderDTO): OrderDTO[] {
  const index = list.findIndex((item) => item.id === order.id);
  if (index === -1) return [order, ...list];
  const next = [...list];
  next[index] = order;
  return next;
}

function LiveBadge({ status }: { status: StreamStatus }) {
  const config =
    status === "live"
      ? {
          label: "Ao vivo",
          className: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20",
          dot: "bg-emerald-400",
        }
      : status === "connecting"
        ? {
            label: "Conectando",
            className: "bg-amber-500/10 text-amber-300 ring-amber-400/20",
            dot: "bg-amber-400",
          }
        : {
            label: "Reconectando",
            className: "bg-red-500/10 text-red-300 ring-red-400/20",
            dot: "bg-red-400",
          };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide ring-1 ring-inset",
        config.className,
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {status !== "offline" ? (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
              config.dot,
            )}
          />
        ) : null}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", config.dot)} />
      </span>
      {config.label}
    </span>
  );
}

export function KitchenDashboard({
  tenant,
  tenants,
  initialActiveOrders,
  initialCompletedOrders,
}: {
  tenant: DashboardTenant;
  tenants: TenantSummaryDTO[];
  initialActiveOrders: OrderDTO[];
  initialCompletedOrders: OrderDTO[];
}) {
  const router = useRouter();
  const now = useNow(15_000);
  const sound = useKitchenSound();
  const [orders, setOrders] = useState<OrderDTO[]>(() => [
    ...initialActiveOrders,
    ...initialCompletedOrders,
  ]);
  const [activeStatus, setActiveStatus] = useState<OrderStatus>("PENDING");
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const soundHintShown = useRef(false);

  const refreshOrders = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) setRefreshing(true);
      try {
        const [activeResponse, completedResponse] = await Promise.all([
          fetch(`/api/tenants/${tenant.slug}/orders?status=active&limit=200`, {
            cache: "no-store",
          }),
          fetch(`/api/tenants/${tenant.slug}/orders?status=completed&limit=20`, {
            cache: "no-store",
          }),
        ]);

        if (!activeResponse.ok || !completedResponse.ok) {
          throw new Error("refresh failed");
        }

        const activePayload = (await activeResponse.json()) as {
          orders: OrderDTO[];
        };
        const completedPayload = (await completedResponse.json()) as {
          orders: OrderDTO[];
        };

        setOrders([...activePayload.orders, ...completedPayload.orders]);
        if (!silent) toast.success("Fila atualizada");
      } catch {
        if (!silent) {
          toast.error("Não foi possível atualizar a fila agora.");
        }
      } finally {
        if (!silent) setRefreshing(false);
      }
    },
    [tenant.slug],
  );

  const handleRealtimeEvent = useCallback(
    (event: RealtimeOrderEvent) => {
      setOrders((previous) => upsertOrder(previous, event.order));

      if (event.type === "order.created") {
        setNewIds((previous) => new Set(previous).add(event.order.id));
        window.setTimeout(() => {
          setNewIds((previous) => {
            const next = new Set(previous);
            next.delete(event.order.id);
            return next;
          });
        }, 12_000);

        toast.success(
          `Novo pedido #${event.order.orderNumber.padStart(4, "0")}`,
          {
            description: `${ORDER_TYPE_SHORT[event.order.type]} · ${formatBRL(
              event.order.total,
            )} · ${event.order.customerName}`,
            duration: 8000,
          },
        );

        if (sound.enabled) {
          sound.playAlert();
        } else if (!soundHintShown.current) {
          soundHintShown.current = true;
          toast.info("Ative o som para ouvir novos pedidos.", {
            description: "Use o botão “Ativar som” no topo da cozinha.",
            duration: 6000,
          });
        }
      }

      if (
        event.type === "order.updated" &&
        event.order.status === "CANCELLED"
      ) {
        toast.info(
          `Pedido #${event.order.orderNumber.padStart(4, "0")} cancelado`,
        );
      }
    },
    [sound],
  );

  const streamStatus = useOrderStream(tenant.slug, {
    onEvent: handleRealtimeEvent,
    onReconnect: () => {
      void refreshOrders({ silent: true });
      toast.info("Conexão restabelecida. Fila sincronizada.");
    },
  });

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void refreshOrders({ silent: true });
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [refreshOrders]);

  useEffect(() => {
    const pending = orders.filter((order) => order.status === "PENDING").length;
    document.title = pending
      ? `(${pending}) ${tenant.name} · Cozinha`
      : `${tenant.name} · Cozinha`;
    return () => {
      document.title = `${tenant.name} · MenuChef`;
    };
  }, [orders, tenant.name]);

  const counts = useMemo(() => {
    const result: Record<OrderStatus, number> = {
      PENDING: 0,
      PREPARING: 0,
      READY: 0,
      DISPATCHED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };
    for (const order of orders) result[order.status] += 1;
    return result;
  }, [orders]);

  const activeCount = ACTIVE_STATUSES.reduce(
    (sum, status) => sum + counts[status],
    0,
  );

  const visibleOrders = useMemo(() => {
    const filtered = orders.filter((order) => order.status === activeStatus);
    return filtered.sort((a, b) => {
      if (activeStatus === "COMPLETED") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [orders, activeStatus]);

  const activeTab = tabs.find((tab) => tab.status === activeStatus) ?? tabs[0];
  const EmptyIcon = activeTab.icon;

  async function handleEnableSound() {
    const enabled = await sound.enable();
    if (enabled) {
      toast.success("Alerta sonoro ativado");
    } else {
      toast.error("Seu navegador não liberou o áudio. Tente novamente.");
    }
  }

  async function updateStatus(order: OrderDTO, status: OrderStatus) {
    setUpdatingId(order.id);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as {
        order?: OrderDTO;
        error?: string;
      };

      if (!response.ok || !payload.order) {
        throw new Error(payload.error ?? "Falha ao atualizar o pedido");
      }

      setOrders((previous) => upsertOrder(previous, payload.order as OrderDTO));
      toast.success(
        `Pedido #${order.orderNumber.padStart(4, "0")} · ${STATUS_LABEL[status]}`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível atualizar.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function handleCancel(order: OrderDTO) {
    const confirmed = window.confirm(
      `Cancelar o pedido #${order.orderNumber} de ${order.customerName}?`,
    );
    if (!confirmed) return;
    void updateStatus(order, "CANCELLED");
  }

  function handlePrint(order: OrderDTO) {
    const opened = printOrderReceipt(order, tenant);
    if (!opened) printFailureToast();
  }

  return (
    <div
      style={{ "--brand": tenant.primaryColor } as React.CSSProperties}
      className="min-h-dvh bg-[#0b0a09] text-stone-100"
    >
      <header className="sticky top-0 z-40 border-b border-white/10 bg-stone-950/92 backdrop-blur-xl">
        <div className="h-1 bg-brand" />
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6">
          <div className="flex min-h-[68px] flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <TenantLogo
                src={tenant.logo}
                name={tenant.name}
                className="h-10 w-10 rounded-xl"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-sm font-extrabold tracking-tight text-white sm:text-base">
                    {tenant.name}
                  </h1>
                  <LiveBadge status={streamStatus} />
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-stone-500">
                  <Flame className="h-3 w-3 text-brand" />
                  Cozinha · {activeCount} pedido(s) ativo(s)
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 font-mono text-[11px] font-semibold text-stone-300 lg:flex">
                {formatTime(new Date(now).toISOString())}
              </span>

              {tenants.length > 1 ? (
                <select
                  value={tenant.slug}
                  onChange={(event) => router.push(`/admin/${event.target.value}`)}
                  className="h-8 max-w-[150px] rounded-lg border border-white/10 bg-stone-900 px-2 text-[11px] font-semibold text-stone-200 outline-none transition hover:border-white/20 focus:border-brand"
                  aria-label="Trocar restaurante"
                >
                  {tenants.map((option) => (
                    <option key={option.id} value={option.slug}>
                      {option.name}
                    </option>
                  ))}
                </select>
              ) : null}

              <button
                type="button"
                onClick={sound.enabled ? sound.playAlert : handleEnableSound}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10.5px] font-bold transition",
                  sound.enabled
                    ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
                    : "border-brand/40 bg-brand/15 text-brand hover:bg-brand/25",
                )}
                title={sound.enabled ? "Testar alerta sonoro" : "Ativar alerta sonoro"}
              >
                {sound.enabled ? (
                  <Volume2 className="h-3.5 w-3.5" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" />
                )}
                {sound.enabled ? "Som ativo" : "Ativar som"}
              </button>

              <Link
                href={`/${tenant.slug}`}
                target="_blank"
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-stone-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Abrir cardápio público"
                title="Abrir cardápio público"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => void refreshOrders()}
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-stone-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Atualizar pedidos"
                title="Atualizar pedidos"
              >
                <RefreshCw
                  className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
                />
              </button>
            </div>
          </div>

          <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-2.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.status === activeStatus;
              return (
                <button
                  key={tab.status}
                  type="button"
                  onClick={() => setActiveStatus(tab.status)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-bold transition",
                    active
                      ? "bg-brand text-brand-foreground shadow-sm"
                      : "bg-white/[0.04] text-stone-400 hover:bg-white/[0.07] hover:text-stone-200",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span
                    className={cn(
                      "grid h-5 min-w-5 place-items-center rounded-md px-1 text-[10px] font-black tabular-nums",
                      active
                        ? "bg-black/15 text-brand-foreground"
                        : counts[tab.status] > 0
                          ? "bg-white/10 text-stone-200"
                          : "bg-white/5 text-stone-600",
                    )}
                  >
                    {counts[tab.status]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 sm:py-6">
        {!sound.enabled ? (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-400/10 text-amber-300">
                <VolumeX className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-amber-200">
                  Alertas sonoros desativados
                </p>
                <p className="mt-0.5 text-[11px] text-amber-200/60">
                  O navegador exige um toque para liberar o áudio. Ative para ouvir
                  cada novo pedido.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEnableSound}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-amber-400 px-4 text-xs font-bold text-amber-950 transition hover:bg-amber-300"
            >
              <Volume2 className="h-4 w-4" />
              Ativar alerta sonoro
            </button>
          </div>
        ) : null}

        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
              {activeTab.label}
            </h2>
            <p className="mt-0.5 text-[11px] text-stone-500">
              {activeTab.description}{" "}
              <span className="text-stone-600">
                · atualização automática via SSE
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-stone-500">
            <span className="h-1.5 w-1.5 animate-[soft-pulse_2s_ease-in-out_infinite] rounded-full bg-emerald-400" />
            {visibleOrders.length} na tela · {activeCount} ativos
          </div>
        </div>

        {visibleOrders.length === 0 ? (
          <div className="grid min-h-[340px] place-items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-16 text-center">
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04] text-stone-600">
                <EmptyIcon className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <p className="mt-4 text-sm font-bold text-stone-300">
                {activeStatus === "COMPLETED"
                  ? "Nenhum pedido concluído ainda"
                  : `Nenhum pedido em “${activeTab.label.toLowerCase()}”`}
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-stone-600">
                {activeStatus === "PENDING"
                  ? "A fila está limpa. Novos pedidos aparecem aqui automaticamente, com alerta sonoro."
                  : "Quando um pedido avançar de status, ele aparece nesta aba."}
              </p>
              {activeStatus === "PENDING" ? (
                <Link
                  href={`/${tenant.slug}`}
                  target="_blank"
                  className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3.5 text-[11px] font-bold text-stone-300 transition hover:bg-white/5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir cardápio e testar um pedido
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            {visibleOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                now={now}
                isNew={newIds.has(order.id)}
                updating={updatingId === order.id}
                onAdvance={(target, status) => void updateStatus(target, status)}
                onCancel={handleCancel}
                onPrint={handlePrint}
              />
            ))}
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 text-[10px] text-stone-600">
          <span>
            Fila recebida em tempo real. Em caso de queda, reconecta sozinho em ~3s.
          </span>
          <span>KDS · MenuChef</span>
        </div>
      </main>
    </div>
  );
}
