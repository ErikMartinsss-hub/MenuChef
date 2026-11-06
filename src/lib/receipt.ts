import type { OrderDTO, PrintSettings, TenantSummaryDTO } from "@/types";
import { formatDateTime, ORDER_TYPE_LABEL, PAYMENT_LABEL, STATUS_LABEL } from "@/lib/format";
import { formatBRL } from "@/lib/money";
import { formatPhone } from "@/lib/utils";

export type ReceiptTenant = TenantSummaryDTO & {
  printSettings: PrintSettings;
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function absoluteAssetUrl(url: string | null, origin: string): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("/")) return `${origin}${url}`;
  return null;
}

function moneyRow(label: string, value: number, strong = false): string {
  return `<div class="row${strong ? " strong" : ""}"><span>${escapeHtml(label)}</span><span>${formatBRL(value)}</span></div>`;
}

/**
 * Builds a self-contained 80mm thermal receipt.
 * Everything from customer input is escaped, and all layout uses monospace
 * text + 72mm content width so it also works with browser-based ESC/POS
 * printer drivers.
 */
export function buildReceiptHtml(
  order: OrderDTO,
  tenant: ReceiptTenant,
  origin: string,
): string {
  const settings = tenant.printSettings ?? {};
  const logo = settings.showLogo === false ? null : absoluteAssetUrl(tenant.logo, origin);
  const orderLabel = `#${order.orderNumber.padStart(4, "0")}`;

  const optionsHtml = order.items
    .map((item) => {
      const options = item.options
        .map(
          (option) =>
            `<div class="row option"><span>+ ${escapeHtml(option.optionName)}</span><span>${option.price > 0 ? formatBRL(option.price) : ""}</span></div>`,
        )
        .join("");
      const notes = item.notes
        ? `<div class="note">Obs: ${escapeHtml(item.notes)}</div>`
        : "";

      return `
        <div class="item">
          <div class="row">
            <span class="item-name">${item.quantity}x ${escapeHtml(item.name)}</span>
            <span>${formatBRL(item.total)}</span>
          </div>
          ${options}
          ${notes}
        </div>`;
    })
    .join("");

  const deliveryTarget =
    order.type === "DELIVERY"
      ? `<div class="block">
          <div class="label">Endereço de entrega</div>
          <div>${escapeHtml(order.address ?? "—")}</div>
        </div>`
      : order.type === "TABLE"
        ? `<div class="row"><span>Mesa</span><span>${escapeHtml(order.tableNumber ?? "—")}</span></div>`
        : "";

  const change =
    order.paymentMethod === "CASH" && order.changeFor
      ? `<div class="row"><span>Troco para</span><span>${formatBRL(order.changeFor)}</span></div>` +
        (order.changeFor > order.total
          ? `<div class="row"><span>Levar troco</span><span>${formatBRL(order.changeFor - order.total)}</span></div>`
          : "")
      : "";

  const customerNotes = order.notes
    ? `<div class="block"><div class="label">Observações do pedido</div><div>${escapeHtml(order.notes)}</div></div>`
    : "";

  const receiptHeader = settings.receiptHeader
    ? `<div class="center header-line">${escapeHtml(settings.receiptHeader)}</div>`
    : "";
  const footerNote = settings.footerNote
    ? `<div class="center footer-note">${escapeHtml(settings.footerNote)}</div>`
    : "";

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pedido ${escapeHtml(orderLabel)} — ${escapeHtml(tenant.name)}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #000; }
    body {
      width: 80mm;
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      line-height: 1.4;
    }
    .receipt { width: 74mm; margin: 0 auto; padding: 3mm 0 4mm; }
    .center { text-align: center; }
    .logo { display: block; max-width: 20mm; max-height: 20mm; margin: 0 auto 2mm; object-fit: contain; filter: grayscale(1); }
    h1 { font-size: 15px; line-height: 1.15; margin: 0 0 1mm; text-transform: uppercase; letter-spacing: .4px; }
    .muted { font-size: 10px; }
    .header-line { font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 2mm; }
    .order-banner { display: flex; justify-content: space-between; align-items: baseline; margin: 0 0 1mm; }
    .order-banner strong { font-size: 18px; letter-spacing: .5px; }
    .status { text-transform: uppercase; font-weight: 700; font-size: 10px; }
    hr { border: 0; border-top: 1px dashed #000; margin: 2.4mm 0; }
    .row { display: flex; justify-content: space-between; gap: 3mm; align-items: baseline; }
    .strong { font-weight: 700; }
    .label { font-size: 9px; text-transform: uppercase; letter-spacing: .5px; margin-bottom: .5mm; }
    .block { margin: 1.6mm 0; }
    .item { margin: 0 0 1.8mm; }
    .item-name { font-weight: 700; padding-right: 2mm; }
    .option { padding-left: 3mm; font-size: 10px; color: #222; }
    .note { padding-left: 3mm; font-size: 10px; font-style: italic; }
    .totals { margin-top: 1mm; }
    .totals .row { margin: .5mm 0; }
    .total { font-size: 14px; font-weight: 700; margin-top: 1mm; }
    .footer-note { margin-top: 3mm; font-size: 10px; white-space: pre-line; }
    .powered { margin-top: 2.5mm; font-size: 8px; letter-spacing: .5px; color: #444; text-transform: uppercase; }
    .no-print { padding: 4mm; text-align: center; }
    .no-print button {
      font: inherit; font-size: 12px; padding: 8px 14px; border: 1px solid #000;
      background: #000; color: #fff; cursor: pointer; border-radius: 4px;
    }
    @media screen {
      body { background: #e7e5e4; padding: 8mm 0; }
      .receipt { background: #fff; padding: 4mm; box-shadow: 0 8px 30px rgba(0,0,0,.18); }
    }
    @media print {
      body { background: #fff; }
      .no-print { display: none; }
      .receipt { box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    ${logo ? `<img class="logo" src="${escapeHtml(logo)}" alt="" />` : ""}
    <h1 class="center">${escapeHtml(tenant.name)}</h1>
    <div class="center muted">${escapeHtml(tenant.address)}</div>
    <div class="center muted">${escapeHtml(formatPhone(tenant.phone))}</div>
    ${receiptHeader}
    <hr />
    <div class="order-banner">
      <strong>PEDIDO ${escapeHtml(orderLabel)}</strong>
      <span class="status">${escapeHtml(STATUS_LABEL[order.status])}</span>
    </div>
    <div class="row"><span>${escapeHtml(formatDateTime(order.createdAt))}</span><span>${escapeHtml(ORDER_TYPE_LABEL[order.type])}</span></div>
    <hr />
    <div class="block">
      <div class="label">Cliente</div>
      <div>${escapeHtml(order.customerName)}</div>
      <div>${escapeHtml(formatPhone(order.customerPhone))}</div>
    </div>
    ${deliveryTarget}
    <hr />
    ${optionsHtml}
    <hr />
    <div class="totals">
      ${moneyRow("Subtotal", order.subtotal)}
      ${order.deliveryFee > 0 ? moneyRow("Taxa de entrega", order.deliveryFee) : ""}
      ${moneyRow("TOTAL", order.total, true)}
    </div>
    <hr />
    <div class="row"><span>Pagamento</span><span>${escapeHtml(PAYMENT_LABEL[order.paymentMethod])}</span></div>
    ${change}
    ${customerNotes}
    <hr />
    ${footerNote}
    <div class="center powered">menuchef · pedido ${escapeHtml(orderLabel)}</div>
  </div>
  <div class="no-print"><button onclick="window.print()">Imprimir novamente</button></div>
</body>
</html>`;
}

export function printOrderReceipt(
  order: OrderDTO,
  tenant: ReceiptTenant,
): boolean {
  const popup = window.open(
    "",
    "menuchef-receipt",
    "width=430,height=760,menubar=no,toolbar=no,location=no,status=no",
  );

  if (!popup) return false;

  const html = buildReceiptHtml(order, tenant, window.location.origin);
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();

  // Give the browser a beat to lay out the receipt (and load the logo) before
  // opening the native print dialog.
  window.setTimeout(() => {
    try {
      popup.print();
    } catch {
      // The user can still print with the button rendered in the popup.
    }
  }, 450);

  return true;
}
