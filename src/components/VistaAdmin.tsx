import type { Ticket } from "../types";
import { formatCurrency } from "../utils/ticketGenerator";
import Icon from "./Icon";

interface VistaAdminProps {
  tickets: Ticket[];
}

export default function VistaAdmin({ tickets }: VistaAdminProps) {
  const today = new Date().toDateString();
  const todayTickets = tickets.filter((ticket) => new Date(ticket.createdAt).toDateString() === today);
  const revenueToday = todayTickets.filter((ticket) => ticket.paid).reduce((sum, ticket) => sum + ticket.cost, 0);
  const revenueTotal = tickets.filter((ticket) => ticket.paid).reduce((sum, ticket) => sum + ticket.cost, 0);
  const openCount = tickets.filter((ticket) => ticket.status !== "ready").length;
  const completed = tickets.filter((ticket) => ticket.status === "ready").length;

  return <div className="page-content">
    <div className="page-heading"><div><div className="eyebrow">IPHONE SMART PARAGUA <span>/</span> GERENCIA</div><h1>Administración</h1><p>Una visión clara de la operación de tu taller.</p></div><div className="today-pill"><span className="live-dot" /> Datos en tiempo real</div></div>
    <div className="admin-stats">
      <div className="panel admin-stat"><div className="admin-stat-top"><span>INGRESOS DE HOY</span><span className="stat-icon green"><Icon name="arrow" /></span></div><strong>{formatCurrency(revenueToday)}</strong><small>{todayTickets.filter((ticket) => ticket.paid).length} pagos registrados hoy</small></div>
      <div className="panel admin-stat"><div className="admin-stat-top"><span>INGRESOS TOTALES</span><span className="stat-icon blue"><Icon name="grid" /></span></div><strong>{formatCurrency(revenueTotal)}</strong><small>Órdenes pagadas</small></div>
      <div className="panel admin-stat"><div className="admin-stat-top"><span>EQUIPOS EN TALLER</span><span className="stat-icon purple"><Icon name="phone" /></span></div><strong>{openCount}</strong><small>Esperando o en reparación</small></div>
      <div className="panel admin-stat"><div className="admin-stat-top"><span>ÓRDENES FINALIZADAS</span><span className="stat-icon amber"><Icon name="check" /></span></div><strong>{completed}</strong><small>{tickets.length} órdenes en total</small></div>
    </div>
    <div className="admin-content-grid">
      <section className="panel overview-panel"><div className="panel-heading"><div><h2>Resumen de órdenes</h2><p>Estado actual de todos los equipos.</p></div><span className="counter-badge">{tickets.length}</span></div>
        <div className="progress-summary"><div className="progress-label"><span>Progreso del taller</span><strong>{tickets.length ? Math.round((completed / tickets.length) * 100) : 0}% finalizado</strong></div><div className="progress-track"><div style={{ width: `${tickets.length ? (completed / tickets.length) * 100 : 0}%` }} /></div></div>
        {[["Pendientes", tickets.filter((ticket) => ticket.status === "pending").length, "status-pending"], ["En proceso", tickets.filter((ticket) => ticket.status === "inProgress").length, "status-process"], ["Listos para entregar", completed, "status-ready"]].map(([label, count, className]) => <div className="overview-row" key={label as string}><span className={`overview-dot ${className}`} /><span>{label}</span><strong>{count}</strong></div>)}
      </section>
      <section className="panel overview-panel"><div className="panel-heading"><div><h2>Actividad reciente</h2><p>Últimas órdenes ingresadas.</p></div><Icon name="clock" /></div>
        {tickets.length === 0 ? <div className="mini-empty">Todavía no hay actividad.</div> : [...tickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((ticket) => <div className="activity-row" key={ticket.id}><div className="activity-avatar"><Icon name="phone" size={16} /></div><div><strong>{ticket.customer}</strong><span>{ticket.model} · {ticket.services.join(", ")}</span></div><div className="activity-right"><strong>{formatCurrency(ticket.cost)}</strong><span>{new Date(ticket.createdAt).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}</span></div></div>)}
      </section>
    </div>
    <section className="panel admin-table-panel"><div className="panel-heading"><div><h2>Control de tickets emitidos</h2><p>Seguimiento completo de pagos y entregas.</p></div></div>{tickets.length === 0 ? <div className="mini-empty">Los tickets emitidos aparecerán en esta tabla.</div> : <div className="table-scroll"><table><thead><tr><th>FOLIO</th><th>CLIENTE</th><th>EQUIPO / SERVICIO</th><th>ESTADO</th><th>MONTO</th><th>PAGO</th><th>MÉTODO</th><th>ENTREGA</th></tr></thead><tbody>{[...tickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((ticket) => <tr key={ticket.id}><td className="folio-cell">{ticket.folio}</td><td><strong>{ticket.customer}</strong><small>{ticket.phone}</small></td><td>{ticket.model}<small>{ticket.services.join(", ")}</small></td><td><span className={`status-pill ${ticket.status}`}>{ticket.status === "ready" ? "Listo" : ticket.status === "inProgress" ? "En proceso" : "Pendiente"}</span></td><td className="amount-cell">{formatCurrency(ticket.cost)}</td><td><span className={`table-state ${ticket.paid ? "yes" : ""}`}>{ticket.paid ? "Pagado" : "Pendiente"}</span></td><td>{ticket.paymentMethod ?? "—"}</td><td><span className={`table-state ${ticket.delivered ? "yes" : ""}`}>{ticket.delivered ? "Entregado" : "Pendiente"}</span></td></tr>)}</tbody></table></div>}</section>
  </div>;
}
