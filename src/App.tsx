import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import VistaAdmin from "./components/VistaAdmin";
import VistaCaja from "./components/VistaCaja";
import VistaTecnico from "./components/VistaTecnico";
import Icon from "./components/Icon";
import type { Ticket, ViewName } from "./types";
import { createWhatsAppText, printTicket } from "./utils/ticketGenerator";
import { readTickets, saveTickets, subscribeToTicketChanges } from "./utils/storage";

type Toast = { message: string; kind: "success" | "error" };

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try { return readTickets(); }
    catch (error) { console.error("No se pudieron leer las órdenes guardadas.", error); return []; }
  });
  const [view, setView] = useState<ViewName>("caja");
  const [dark, setDark] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    try { saveTickets(tickets); }
    catch (error) { console.error("No se pudieron guardar las órdenes.", error); setToast({ message: "No se pudieron guardar los cambios en el navegador.", kind: "error" }); }
  }, [tickets]);

  useEffect(() => subscribeToTicketChanges(() => {
    try { setTickets(readTickets()); }
    catch (error) { console.error("No se pudieron sincronizar las órdenes.", error); setToast({ message: "No se pudieron sincronizar los datos guardados.", kind: "error" }); }
  }), []);

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

  return <div className={`app-shell ${dark ? "dark-theme" : ""}`}>
    <Navbar view={view} onChange={setView} openCount={tickets.filter((ticket) => ticket.status !== "ready").length} dark={dark} onToggleTheme={() => setDark(!dark)} />
    <main className="main-area"><header className="topbar"><div className="breadcrumbs"><span>iPhone Smart Paragua</span><b>/</b><strong>{view === "caja" ? "Recepción" : view === "tecnico" ? "Panel técnico" : "Administración"}</strong></div><div className="topbar-right"><span className="top-date">{new Date().toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span><span className="topbar-divider" /><button className="icon-button notification-button" aria-label="Notificaciones"><Icon name="bell" size={19} /><i /></button><div className="avatar top-avatar">ISP</div></div></header>
      {view === "caja" && <VistaCaja tickets={tickets} onCreate={createTicket} onUpdate={updateTicket} notify={notify} onCopy={copyTicket} onPrint={handlePrint} />}
      {view === "tecnico" && <VistaTecnico tickets={tickets} onUpdate={updateTicket} notify={notify} />}
      {view === "admin" && <VistaAdmin tickets={tickets} />}
      <footer className="app-footer"><span>© {new Date().getFullYear()} iPhone Smart Paragua · Gestión de servicio técnico</span><span><span className="live-dot" /> Datos guardados en este dispositivo</span></footer>
    </main>
    {toast && <div className={`toast ${toast.kind}`} role="status"><span>{toast.kind === "success" ? "✓" : "!"}</span>{toast.message}<button aria-label="Cerrar notificación" onClick={() => setToast(null)}><Icon name="close" size={15} /></button></div>}
  </div>;
}
