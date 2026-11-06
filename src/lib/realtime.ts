import type { OrderDTO, RealtimeEventType, RealtimeOrderEvent } from "@/types";

type Listener = (event: RealtimeOrderEvent) => void;

/**
 * In-process pub/sub used by the SSE route.
 *
 * This is perfect for a single Node process (local dev, a single container,
 * a VPS). For multi-instance/serverless deployments, swap this module for
 * Redis pub/sub or Postgres LISTEN/NOTIFY — the rest of the app only depends
 * on `publishOrderEvent` and `subscribeToOrders`.
 */
type Hub = Map<string, Set<Listener>>;

const globalForRealtime = globalThis as unknown as {
  menuChefRealtimeHub?: Hub;
};

const hub: Hub = globalForRealtime.menuChefRealtimeHub ?? new Map();
globalForRealtime.menuChefRealtimeHub = hub;

export function publishOrderEvent(
  tenantId: string,
  type: RealtimeEventType,
  order: OrderDTO,
): void {
  const event: RealtimeOrderEvent = {
    type,
    order,
    at: new Date().toISOString(),
  };

  const listeners = hub.get(tenantId);
  if (!listeners) return;

  for (const listener of listeners) {
    try {
      listener(event);
    } catch (error) {
      console.error("[realtime] listener failed", error);
    }
  }
}

export function subscribeToOrders(
  tenantId: string,
  listener: Listener,
): () => void {
  const listeners = hub.get(tenantId) ?? new Set<Listener>();
  listeners.add(listener);
  hub.set(tenantId, listeners);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) hub.delete(tenantId);
  };
}
