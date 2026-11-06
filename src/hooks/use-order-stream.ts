"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeOrderEvent } from "@/types";

export type StreamStatus = "connecting" | "live" | "offline";

interface Options {
  onEvent: (event: RealtimeOrderEvent) => void;
  onReconnect?: () => void;
  enabled?: boolean;
}

/**
 * Subscribes to the tenant's SSE channel. EventSource reconnects on its own;
 * `onReconnect` lets the KDS re-sync the full order list after a network blip.
 */
export function useOrderStream(
  tenantSlug: string,
  { onEvent, onReconnect, enabled = true }: Options,
): StreamStatus {
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const eventRef = useRef(onEvent);
  const reconnectRef = useRef(onReconnect);

  useEffect(() => {
    eventRef.current = onEvent;
    reconnectRef.current = onReconnect;
  }, [onEvent, onReconnect]);

  useEffect(() => {
    if (!enabled) return;

    let hasConnected = false;
    let disposed = false;

    const source = new EventSource(
      `/api/realtime/${encodeURIComponent(tenantSlug)}`,
    );

    const handleEvent = (raw: Event) => {
      const message = raw as MessageEvent<string>;
      try {
        const event = JSON.parse(message.data) as RealtimeOrderEvent;
        if (event?.order?.id) eventRef.current(event);
      } catch {
        console.error("[sse] invalid event payload");
      }
    };

    const handleConnected = () => {
      if (disposed) return;
      setStatus("live");
      if (hasConnected) reconnectRef.current?.();
      hasConnected = true;
    };

    const handleError = () => {
      if (disposed) return;
      setStatus("offline");
    };

    source.addEventListener("connected", handleConnected);
    source.addEventListener("order.created", handleEvent as EventListener);
    source.addEventListener("order.updated", handleEvent as EventListener);
    source.onerror = handleError;

    return () => {
      disposed = true;
      source.removeEventListener("connected", handleConnected);
      source.removeEventListener("order.created", handleEvent as EventListener);
      source.removeEventListener("order.updated", handleEvent as EventListener);
      source.close();
    };
  }, [tenantSlug, enabled]);

  return status;
}
