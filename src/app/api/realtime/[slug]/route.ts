import { apiError, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { subscribeToOrders } from "@/lib/realtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });

    if (!tenant) return apiError("Restaurante não encontrado.", 404);

    const encoder = new TextEncoder();
    let dispose = () => {};

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let closed = false;
        const resources: {
          unsubscribe?: () => void;
          heartbeat?: ReturnType<typeof setInterval>;
        } = {};

        const close = () => {
          if (closed) return;
          closed = true;
          resources.unsubscribe?.();
          if (resources.heartbeat) clearInterval(resources.heartbeat);
          request.signal.removeEventListener("abort", close);
          try {
            controller.close();
          } catch {
            // Already closed by the client.
          }
        };

        const send = (chunk: string) => {
          if (closed) return;
          try {
            controller.enqueue(encoder.encode(chunk));
          } catch {
            close();
          }
        };

        dispose = close;

        // EventSource reconnect delay + initial handshake.
        send("retry: 3000\n\n");
        send(
          `event: connected\ndata: ${JSON.stringify({
            tenantId: tenant.id,
            tenantName: tenant.name,
            at: new Date().toISOString(),
          })}\n\n`,
        );

        resources.unsubscribe = subscribeToOrders(tenant.id, (event) => {
          send(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
        });

        resources.heartbeat = setInterval(() => {
          send(`: heartbeat ${Date.now()}\n\n`);
        }, 25_000);

        request.signal.addEventListener("abort", close, { once: true });
      },
      cancel() {
        dispose();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
