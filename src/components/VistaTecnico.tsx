import { useState } from "react";
import type { Ticket, TicketStatus } from "../types";
import { formatCurrency } from "../utils/ticketGenerator";
import Icon from "./Icon";

interface VistaTecnicoProps {
  tickets: Ticket[];
  onUpdate: (id: string, changes: Partial<Ticket>) => void;
  notify: (message: string, kind?: "success" | "error") => void;
}

export default function VistaTecnico({ tickets, onUpdate, notify }: VistaTecnicoProps) {
  const [filter, setFilter] = useState<"all" | TicketStatus>("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const ordered = [...tickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const visible = ordered.filter((ticket) => filter === "all" || ticket.status === filter);
  const updateStatus = (ticket: Ticket, status: TicketStatus) => {
    onUpdate(ticket.id, { status });
    notify(`Estado de ${ticket.folio} actualizado.`);
  };

  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">OPERACIONES <span>/</span> TALLER</div><h1>Panel técnico</h1><p>Órdenes sincronizadas directamente desde recepción.</p></div><div className="today-pill"><span className="live-dot" /> Actualización automática</div></div>
    <div className="tech-stats"><div><span className="tech-stat-icon blue"><Icon name="clipboard" /></span><span>Pendientes</span><strong>{tickets.filter((ticket) => ticket.status === "pending").length}</strong></div><div><span className="tech-stat-icon amber"><Icon name="clock" /></span><span>En proceso</span><strong>{tickets.filter((ticket) => ticket.status === "inProgress").length}</strong></div><div><span className="tech-stat-icon green"><Icon name="check" /></span><span>Finalizados</span><strong>{tickets.filter((ticket) => ticket.status === "ready").length}</strong></div></div>
    <div className="toolbar"><div><h2>Órdenes de reparación</h2><p>Información del cliente y sus indicaciones originales.</p></div><div className="filter-tabs">{[["all", "Todas"], ["pending", "Pendientes"], ["inProgress", "En proceso"], ["ready", "Finalizados"]].map(([key, label]) => <button key={key} className={filter === key ? "active" : ""} onClick={() => setFilter(key as typeof filter)}>{label}</button>)}</div></div>
    {visible.length === 0 ? <div className="panel empty-board"><div className="empty-icon"><Icon name="box" size={25} /></div><strong>No hay órdenes en esta categoría</strong><span>Cuando recepción registre un equipo, aparecerá aquí automáticamente.</span></div> : <div className="repair-grid">{visible.map((ticket) => <article className="panel repair-card" key={ticket.id}>
      <div className="repair-head"><div className="repair-model"><div className="device-icon"><Icon name="phone" size={20} /></div><div><strong>{ticket.model}</strong><span>{ticket.folio} · {new Date(ticket.createdAt).toLocaleDateString("es-VE")}</span></div></div><span className={`status-pill ${ticket.status}`}>{ticket.status === "ready" ? "Finalizado" : ticket.status === "inProgress" ? "En proceso" : "Pendiente"}</span></div>
      <div className="repair-customer"><strong>{ticket.customer}</strong><span>{ticket.phone}</span></div>
      <div className="repair-service"><div className="repair-label">REPARACIÓN SOLICITADA</div><strong>{ticket.services.join(", ")}</strong></div>
      <div className="repair-facts"><div><span>Costo estimado</span><strong>{formatCurrency(ticket.cost)}</strong></div><div><span>Tiempo estimado</span><strong><Icon name="clock" size={14} /> {ticket.estimatedTime}</strong></div></div>
      {ticket.customerNotes && <div className="customer-note"><div className="repair-label">NOTAS DEL CLIENTE</div><p>{ticket.customerNotes}</p></div>}
      <div className="internal-note"><label htmlFor={`notes-${ticket.id}`}>Nota interna del técnico</label><textarea id={`notes-${ticket.id}`} rows={2} placeholder="Agrega avances o hallazgos..." value={notes[ticket.id] ?? ticket.internalNotes} onChange={(event) => setNotes({ ...notes, [ticket.id]: event.target.value })} /><button onClick={() => { onUpdate(ticket.id, { internalNotes: notes[ticket.id] ?? "" }); notify("Nota interna guardada."); }}>Guardar nota</button></div>
      <div className="repair-footer">{ticket.status === "pending" && <button className="primary-button" onClick={() => updateStatus(ticket, "inProgress")}>Iniciar reparación <Icon name="arrow" size={15} /></button>}{ticket.status === "inProgress" && <button className="primary-button ready-button" onClick={() => updateStatus(ticket, "ready")}><Icon name="check" size={16} /> Marcar como finalizado</button>}{ticket.status === "ready" && <button className="secondary-button" onClick={() => updateStatus(ticket, "inProgress")}>Reabrir orden</button>}</div>
    </article>)}</div>}
  </div>;
}
