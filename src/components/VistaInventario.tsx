import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { InventoryItem, InventoryScanFeedback, Ticket } from "../types";
import Icon from "./Icon";
import "./VistaInventario.css";

interface VistaInventarioProps {
  inventory: InventoryItem[];
  tickets: Ticket[];
  selectedTicketId: string;
  scanFeedback: InventoryScanFeedback | null;
  onSelectTicket: (ticketId: string) => void;
  onReceive: (input: Pick<InventoryItem, "tagCode" | "name" | "category" | "stock">) => { ok: boolean };
}

export default function VistaInventario({
  inventory,
  tickets,
  selectedTicketId,
  scanFeedback,
  onSelectTicket,
  onReceive,
}: VistaInventarioProps) {
  const [tagCode, setTagCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Pantalla");
  const [quantity, setQuantity] = useState(1);
  const [query, setQuery] = useState("");
  const openTickets = tickets.filter((ticket) => ticket.status !== "ready");
  const totalUnits = inventory.reduce((sum, item) => sum + item.stock, 0);
  const lowStock = inventory.filter((item) => item.stock > 0 && item.stock <= 2).length;
  const visibleInventory = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return inventory.filter((item) => `${item.name} ${item.category} ${item.tagCode}`.toLowerCase().includes(normalizedQuery));
  }, [inventory, query]);

  useEffect(() => {
    if (scanFeedback && !inventory.some((item) => item.tagCode.toLowerCase() === scanFeedback.code.toLowerCase())) {
      setTagCode(scanFeedback.code);
    }
  }, [scanFeedback, inventory]);

  const receive = (event: FormEvent) => {
    event.preventDefault();
    const normalizedTag = tagCode.trim();
    const normalizedName = name.trim();
    const normalizedCategory = category.trim();
    if (!normalizedTag || !normalizedName || !normalizedCategory || !Number.isInteger(quantity) || quantity < 1) return;

    const result = onReceive({ tagCode: normalizedTag, name: normalizedName, category: normalizedCategory, stock: quantity });
    if (result.ok) {
      setTagCode("");
      setName("");
      setQuantity(1);
    }
  };

  const boundParts = tickets.flatMap((ticket) =>
    (ticket.usedParts ?? []).map((part) => ({ ticket, part })),
  ).sort((left, right) =>
    (right.part.linkedAt ?? right.ticket.createdAt).localeCompare(left.part.linkedAt ?? left.ticket.createdAt),
  ).slice(0, 6);

  return <div className="page-content">
    <div className="page-heading">
      <div><div className="eyebrow">IPHONE SMART PARAGUA <span>/</span> CONTROL DE STOCK</div><h1>Inventario RFID</h1><p>Recibe repuestos y asígnalos a una orden escaneando su tag.</p></div>
      <div className="today-pill"><span className="live-dot" /> Lector listo</div>
    </div>

    <section className={`rfid-scan-status ${scanFeedback?.kind ?? "ready"}`} aria-live="polite">
      <span className="rfid-status-icon"><Icon name={scanFeedback?.kind === "error" ? "close" : "box"} size={20} /></span>
      <div><strong>{scanFeedback?.message ?? "Esperando lectura RFID"}</strong><span>Escanea fuera de campos de texto. El lector debe enviar el código y finalizar con Enter.</span></div>
      <span className="rfid-tag-code">{scanFeedback?.code ?? "RFID"}</span>
    </section>

    <div className="rfid-stats">
      <div className="panel rfid-stat"><span>REPUESTOS REGISTRADOS</span><strong>{inventory.length}</strong><small>Tags vinculados a un producto</small></div>
      <div className="panel rfid-stat"><span>UNIDADES DISPONIBLES</span><strong>{totalUnits}</strong><small>Unidades en stock</small></div>
      <div className="panel rfid-stat"><span>STOCK BAJO</span><strong>{lowStock}</strong><small>Repuestos con 1 o 2 unidades</small></div>
    </div>

    <div className="rfid-layout">
      <section className="panel rfid-inventory-panel">
        <div className="panel-heading"><div><h2>Repuestos en stock</h2><p>El stock baja al vincular una unidad a una orden.</p></div><span className="counter-badge">{inventory.length}</span></div>
        <label className="rfid-search"><Icon name="search" size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, categoría o tag" /></label>
        {visibleInventory.length === 0 ? <div className="rfid-empty">{inventory.length ? "No hay repuestos que coincidan con la búsqueda." : "Aún no hay repuestos. Registra el primero desde Recepción de stock."}</div> :
          <div className="table-scroll"><table className="rfid-table"><thead><tr><th>REPUESTO</th><th>CATEGORÍA</th><th>TAG RFID</th><th>STOCK</th></tr></thead><tbody>
            {visibleInventory.map((item) => <tr key={item.id}><td><strong>{item.name}</strong></td><td>{item.category}</td><td><code>{item.tagCode}</code></td><td><span className={`rfid-stock ${item.stock === 0 ? "empty" : item.stock <= 2 ? "low" : ""}`}>{item.stock}</span></td></tr>)}
          </tbody></table></div>}
      </section>

      <div className="rfid-side-column">
        <section className="panel rfid-receive-panel">
          <div className="panel-heading"><div><h2>Recepción de stock</h2><p>Registra un tag nuevo o suma unidades.</p></div><span className="stat-icon blue"><Icon name="plus" size={17} /></span></div>
          <form onSubmit={receive}>
            <label>Tag RFID<input value={tagCode} onChange={(event) => setTagCode(event.target.value)} placeholder="Escanea o escribe el código" required /></label>
            <label>Nombre del repuesto<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Batería iPhone 13" required /></label>
            <label>Categoría<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Ej. Batería, Pantalla" required /></label>
            <label>Unidades recibidas<input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} required /></label>
            <button className="primary-button" type="submit"><Icon name="plus" size={15} /> Registrar recepción</button>
          </form>
        </section>

        <section className="panel rfid-bind-panel">
          <div className="panel-heading"><div><h2>Vincular a una orden</h2><p>El repuesto escaneado se asigna a esta orden abierta.</p></div></div>
          <label>Orden de reparación<select value={selectedTicketId} onChange={(event) => onSelectTicket(event.target.value)}>
            <option value="">Selecciona una orden</option>
            {openTickets.map((ticket) => <option key={ticket.id} value={ticket.id}>{ticket.folio} · {ticket.customer} · {ticket.model}</option>)}
          </select></label>
          {openTickets.length === 0 && <p className="rfid-help-text">No hay órdenes abiertas para vincular repuestos.</p>}
        </section>
      </div>
    </div>

    <section className="panel rfid-bindings-panel">
      <div className="panel-heading"><div><h2>Repuestos vinculados</h2><p>Asignaciones recientes en las órdenes de trabajo.</p></div></div>
      {boundParts.length === 0 ? <div className="rfid-empty">Todavía no se han vinculado repuestos a órdenes.</div> :
        <div className="table-scroll"><table className="rfid-table"><thead><tr><th>ORDEN</th><th>CLIENTE / EQUIPO</th><th>REPUESTO</th><th>TAG RFID</th><th>UNIDADES</th></tr></thead><tbody>
          {boundParts.map(({ ticket, part }, index) => <tr key={`${ticket.id}-${part.inventoryItemId}-${index}`}><td><strong>{ticket.folio}</strong></td><td>{ticket.customer} · {ticket.model}</td><td>{part.name}</td><td><code>{part.tagCode}</code></td><td>{part.quantity}</td></tr>)}
        </tbody></table></div>}
    </section>
  </div>;
}
