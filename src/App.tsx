import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import VistaAdmin from "./components/VistaAdmin";
import VistaCaja from "./components/VistaCaja";
import VistaInventario from "./components/VistaInventario";
import VistaTecnico from "./components/VistaTecnico";
import Icon from "./components/Icon";
import type { InventoryItem, InventoryScanFeedback, Ticket, ViewName } from "./types";
import { createWhatsAppText, printTicket } from "./utils/ticketGenerator";
import { readInventory, readTickets, saveInventory, saveTickets, subscribeToInventoryChanges, subscribeToTicketChanges } from "./utils/storage";
import { useRfidScanner } from "./hooks/useRfidScanner";

type Toast = { message: string; kind: "success" | "error" };

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try { return readTickets(); }
    catch (error) { console.error("No se pudieron leer las órdenes guardadas.", error); return []; }
  });
  const [view, setView] = useState<ViewName>("caja");
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try { return readInventory(); }
    catch (error) { console.error("No se pudo leer el inventario guardado.", error); return []; }
  });
  const [selectedTicketId, setSelectedTicketId] = useState(() => tickets.find((ticket) => ticket.status !== "ready")?.id ?? "");
  const [scanFeedback, setScanFeedback] = useState<InventoryScanFeedback | null>(null);

  useEffect(() => {
    try { saveTickets(tickets); }
    catch (error) { console.error("No se pudieron guardar las órdenes.", error); setToast({ message: "No se pudieron guardar los cambios en el navegador.", kind: "error" }); }
  }, [tickets]);

  useEffect(() => subscribeToTicketChanges(() => {
    try { setTickets(readTickets()); }
    catch (error) { console.error("No se pudieron sincronizar las órdenes.", error); setToast({ message: "No se pudieron sincronizar los datos guardados.", kind: "error" }); }
  }), []);

  useEffect(() => {
    try { saveInventory(inventory); }
    catch (error) { console.error("No se pudo guardar el inventario.", error); setToast({ message: "No se pudo guardar el inventario en el navegador.", kind: "error" }); }
  }, [inventory]);

  useEffect(() => subscribeToInventoryChanges(() => {
    try { setInventory(readInventory()); }
    catch (error) { console.error("No se pudo sincronizar el inventario.", error); setToast({ message: "No se pudo sincronizar el inventario guardado.", kind: "error" }); }
  }), []);

  useEffect(() => {
    if (!tickets.some((ticket) => ticket.id === selectedTicketId && ticket.status !== "ready")) {
      setSelectedTicketId(tickets.find((ticket) => ticket.status !== "ready")?.id ?? "");
    }
  }, [tickets, selectedTicketId]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const notify = (message: string, kind: Toast["kind"] = "success") => setToast({ message, kind });
  const createTicket = (input: Omit<Ticket, "id" | "folio" | "createdAt" | "internalNotes" | "status" | "paid" | "delivered">) => {
    const now = new Date();
    const folio = `ISP-${now.getFullYear()}-${String(Date.now()).slice(-6)}`;
    const ticket: Ticket = { ...input, id: crypto.randomUUID(), folio, createdAt: now.toISOString(), internalNotes: "", status: "pending", paid: false, delivered: false };
    setTickets((current) => [ticket, ...current]);
    return ticket;
  };
  const updateTicket = (id: string, changes: Partial<Ticket>) => setTickets((current) => current.map((ticket) => ticket.id === id ? { ...ticket, ...changes } : ticket));
  const copyTicket = async (ticket: Ticket) => {
    try {
      await navigator.clipboard.writeText(createWhatsAppText(ticket));
      notify("Texto del ticket copiado. Ya puedes pegarlo en WhatsApp.");
    } catch (error) {
      console.error("No se pudo copiar el texto del ticket.", error);
      notify("No se pudo copiar. Verifica los permisos del portapapeles del navegador.", "error");
    }
  };
  const handlePrint = (ticket: Ticket) => {
    try { printTicket(ticket); }
    catch (error) { console.error("No se pudo generar el comprobante.", error); notify(error instanceof Error ? error.message : "No se pudo generar el comprobante.", "error"); }
  };

  const handleRfidScan = (code: string) => {
    if (view !== "inventario") return;
    const item = inventory.find((entry) => entry.tagCode.trim().toLowerCase() === code.trim().toLowerCase());
    if (!item) {
      const message = `Tag ${code} no registrado. Completa sus datos en Recepción de stock.`;
      setScanFeedback({ code, message, kind: "error" });
      notify(message, "error");
      return;
    }
    if (item.stock < 1) {
      const message = `${item.name} está sin unidades disponibles.`;
      setScanFeedback({ code, message, kind: "error" });
      notify(message, "error");
      return;
    }
    const ticket = tickets.find((entry) => entry.id === selectedTicketId && entry.status !== "ready");
    if (!ticket) {
      const message = `${item.name} tiene stock, pero debes seleccionar una orden abierta para vincularlo.`;
      setScanFeedback({ code, message, kind: "error" });
      notify(message, "error");
      return;
    }

    const linkedAt = new Date().toISOString();
    setInventory((current) => current.map((entry) => entry.id === item.id ? { ...entry, stock: entry.stock - 1, updatedAt: linkedAt } : entry));
    updateTicket(ticket.id, {
      usedParts: (() => {
        const parts = ticket.usedParts ?? [];
        const existing = parts.find((part) => part.inventoryItemId === item.id);
        return existing
          ? parts.map((part) => part === existing ? { ...part, quantity: part.quantity + 1, linkedAt } : part)
          : [...parts, { inventoryItemId: item.id, name: item.name, tagCode: item.tagCode, quantity: 1, linkedAt }];
      })(),
    });
    const remaining = item.stock - 1;
    const message = `${item.name} vinculado a ${ticket.folio}; ${remaining === 1 ? "queda 1 unidad" : `quedan ${remaining} unidades`} en stock.`;
    setScanFeedback({ code, message, kind: "success" });
    notify(message);
  };
  useRfidScanner(handleRfidScan);

  const receiveInventoryItem = (input: Pick<InventoryItem, "tagCode" | "name" | "category" | "stock">) => {
    const tagCode = input.tagCode.trim();
    const existing = inventory.find((item) => item.tagCode.trim().toLowerCase() === tagCode.toLowerCase());
    if (existing && (existing.name.trim().toLowerCase() !== input.name.trim().toLowerCase() || existing.category.trim().toLowerCase() !== input.category.trim().toLowerCase())) {
      const message = `El tag ${tagCode} ya está asociado a ${existing.name}.`;
      notify(message, "error");
      return { ok: false };
    }
    if (existing) {
      setInventory((current) => current.map((item) => item.id === existing.id ? { ...item, stock: item.stock + input.stock, updatedAt: new Date().toISOString() } : item));
      const message = `Recepción registrada: ${existing.name}, +${input.stock} unidades.`;
      notify(message);
      return { ok: true };
    }

    const item: InventoryItem = { ...input, id: crypto.randomUUID(), tagCode, name: input.name.trim(), category: input.category.trim(), updatedAt: new Date().toISOString() };
    setInventory((current) => [item, ...current]);
    const message = `${item.name} agregado al inventario con ${item.stock} unidades.`;
    notify(message);
    return { ok: true };
  };

  return <div className={`app-shell ${dark ? "dark-theme" : ""}`}>
    <Navbar view={view} onChange={setView} openCount={tickets.filter((ticket) => ticket.status !== "ready").length} dark={dark} onToggleTheme={() => setDark(!dark)} />
    <main className="main-area"><header className="topbar"><div className="breadcrumbs"><span>iPhone Smart Paragua</span><b>/</b><strong>{view === "caja" ? "Recepción" : view === "tecnico" ? "Panel técnico" : view === "inventario" ? "Inventario RFID" : "Administración"}</strong></div><div className="topbar-right"><span className="top-date">{new Date().toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span><span className="topbar-divider" /><button className="icon-button notification-button" aria-label="Notificaciones"><Icon name="bell" size={19} /><i /></button><div className="avatar top-avatar">ISP</div></div></header>
      {view === "caja" && <VistaCaja tickets={tickets} onCreate={createTicket} onUpdate={updateTicket} notify={notify} onCopy={copyTicket} onPrint={handlePrint} />}
      {view === "tecnico" && <VistaTecnico tickets={tickets} onUpdate={updateTicket} notify={notify} />}
      {view === "admin" && <VistaAdmin tickets={tickets} />}
      {view === "inventario" && <VistaInventario inventory={inventory} tickets={tickets} selectedTicketId={selectedTicketId} scanFeedback={scanFeedback} onSelectTicket={setSelectedTicketId} onReceive={receiveInventoryItem} />}
      <footer className="app-footer"><span>© {new Date().getFullYear()} iPhone Smart Paragua · Gestión de servicio técnico</span><span><span className="live-dot" /> Datos guardados en este dispositivo</span></footer>
    </main>
    {toast && <div className={`toast ${toast.kind}`} role="status"><span>{toast.kind === "success" ? "✓" : "!"}</span>{toast.message}<button aria-label="Cerrar notificación" onClick={() => setToast(null)}><Icon name="close" size={15} /></button></div>}
  </div>;
}
