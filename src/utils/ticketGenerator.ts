import type { Ticket } from "../types";

export function formatCurrency(amount: number): string {
  return `${new Intl.NumberFormat("es-VE", {
    maximumFractionDigits: 2,
  }).format(amount)} Bs`;
}

export function createWhatsAppText(ticket: Ticket): string {
  return [
    `*IPHONE SMART PARAGUA · ORDEN DE SERVICIO ${ticket.folio}*`,
    `Nombre: ${ticket.customer}`,
    `Teléfono: ${ticket.phone}`,
    `Modelo: ${ticket.model}`,
    `Falla / Nota: ${ticket.services.join(", ")}${ticket.customerNotes ? ` — ${ticket.customerNotes}` : ""}`,
    `Costo: ${formatCurrency(ticket.cost)}`,
    `Tiempo estimado: ${ticket.estimatedTime}`,
    "",
    "Gracias por confiar en iPhone Smart Paragua. Te avisaremos cuando esté listo.",
  ].join("\n");
}

export function printTicket(ticket: Ticket): void {
  const printWindow = window.open("", "_blank", "width=720,height=800");
  if (!printWindow) throw new Error("El navegador bloqueó la ventana del comprobante. Permite ventanas emergentes e inténtalo de nuevo.");

  const safe = (value: string) =>
    value.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character] ?? character);
  const issued = new Date(ticket.createdAt).toLocaleString("es-VE");

  printWindow.document.write(`<!doctype html>
    <html lang="es"><head><meta charset="utf-8"><title>Orden ${safe(ticket.folio)}</title>
    <style>
      body{font:15px Arial,sans-serif;color:#172033;max-width:680px;margin:40px auto;padding:24px}
      header{display:flex;justify-content:space-between;border-bottom:2px solid #202c42;padding-bottom:18px}
      h1{font-size:23px;margin:0 0 5px}h2{font-size:16px;margin:26px 0 12px}
      .muted{color:#65718a}.folio{font-size:18px;font-weight:bold;color:#4658d8}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .field{padding:10px 0;border-bottom:1px solid #e6e9ef}.label{font-size:11px;text-transform:uppercase;color:#7a8497}
      .value{margin-top:5px;font-weight:600}.notes{padding:14px;background:#f3f5f9;border-radius:8px;white-space:pre-wrap}
      footer{margin-top:32px;padding-top:16px;border-top:1px solid #ddd;font-size:12px;color:#65718a}
      @media print{body{margin:0 auto}}
    </style></head><body>
    <header><div><h1>iPhone Smart Paragua</h1><div class="muted">Servicio técnico especializado</div></div><div class="folio">${safe(ticket.folio)}</div></header>
    <p class="muted">Comprobante de recepción · ${safe(issued)}</p>
    <h2>Datos del cliente y equipo</h2><div class="grid">
      <div class="field"><div class="label">Cliente</div><div class="value">${safe(ticket.customer)}</div></div>
      <div class="field"><div class="label">Teléfono</div><div class="value">${safe(ticket.phone)}</div></div>
      <div class="field"><div class="label">Equipo</div><div class="value">${safe(ticket.model)}</div></div>
      <div class="field"><div class="label">Tiempo estimado</div><div class="value">${safe(ticket.estimatedTime)}</div></div>
      <div class="field"><div class="label">Servicio(s)</div><div class="value">${safe(ticket.services.join(", "))}</div></div>
      <div class="field"><div class="label">Costo estimado</div><div class="value">${formatCurrency(ticket.cost)}</div></div>
    </div>
    <h2>Observaciones del cliente</h2><div class="notes">${safe(ticket.customerNotes || "Sin observaciones adicionales.")}</div>
    <footer><strong>Condiciones de garantía</strong><br>La garantía cubre únicamente el servicio y repuesto indicado en esta orden. No cubre daños por humedad, golpes, manipulación de terceros ni mal uso. La garantía queda sin efecto si el equipo presenta daños ajenos a la reparación realizada.</footer>
    <script>window.onload=()=>window.print();</script></body></html>`);
  printWindow.document.close();
}
