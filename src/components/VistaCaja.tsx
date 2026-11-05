import { useMemo, useState, type FormEvent } from "react";
import { getPriceLabel, getPricesForModel, MODELS, PRICE_CATEGORIES, PRICE_LIST, PRICE_LIST_DATE, type PriceEntry } from "../data";
import type { PaymentMethod, Ticket } from "../types";
import { formatCurrency } from "../utils/ticketGenerator";
import Icon from "./Icon";

interface VistaCajaProps {
  tickets: Ticket[];
  onCreate: (ticket: Omit<Ticket, "id" | "folio" | "createdAt" | "internalNotes" | "status" | "paid" | "delivered">) => Ticket;
  onUpdate: (id: string, changes: Partial<Ticket>) => void;
  notify: (message: string, kind?: "success" | "error") => void;
  onCopy: (ticket: Ticket) => void;
  onPrint: (ticket: Ticket) => void;
}

export default function VistaCaja({ tickets, onCreate, onUpdate, notify, onCopy, onPrint }: VistaCajaProps) {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [model, setModel] = useState("");
  const [selectedServices, setSelectedServices] = useState<PriceEntry[]>([]);
  const [cost, setCost] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | "abiertos" | "listos">("todos");
  const [serviceCategory, setServiceCategory] = useState("");
  const [customService, setCustomService] = useState("");
  const [customPrice, setCustomPrice] = useState(0);
  const [showTariff, setShowTariff] = useState(false);
  const [tariffCategory, setTariffCategory] = useState("Todas");
  const [tariffQuery, setTariffQuery] = useState("");
  const [paymentTicket, setPaymentTicket] = useState<Ticket | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QR Altoke");

  const total = useMemo(() => tickets.reduce((sum, ticket) => sum + ticket.cost, 0), [tickets]);
  const filtered = tickets.filter((ticket) => {
    const matchesQuery = `${ticket.customer} ${ticket.model} ${ticket.folio}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "todos" || (filter === "abiertos" ? ticket.status !== "ready" : ticket.status === "ready");
    return matchesQuery && matchesFilter;
  });

  const matchingPrices = useMemo(() => getPricesForModel(model), [model]);
  const availableCategories = useMemo(
    () => [...new Set(matchingPrices.map((entry) => entry.category))],
    [matchingPrices],
  );
  const categoryPrices = matchingPrices.filter((entry) => entry.category === serviceCategory);
  const visibleTariff = PRICE_LIST.filter((entry) => {
    const modelText = entry.models.includes("*") ? "todos los modelos" : entry.models.join(" ");
    const text = `${entry.category} ${entry.variant ?? ""} iPhone ${modelText} ${getPriceLabel(entry)}`.toLowerCase();
    return (tariffCategory === "Todas" || entry.category === tariffCategory) && text.includes(tariffQuery.toLowerCase().trim());
  });

  const toggleService = (entry: PriceEntry) => {
    const selected = selectedServices.some((service) => service.id === entry.id);
    const next = selected
      ? selectedServices.filter((service) => service.id !== entry.id)
      : [...selectedServices, entry];
    setSelectedServices(next);
    setCost(next.reduce((sum, service) => sum + service.price, 0));
  };

  const addCustomService = () => {
    const label = customService.trim();
    if (!label) {
      notify("Escribe el nombre del servicio o producto.", "error");
      return;
    }
    const customEntry: PriceEntry = {
      id: `custom-${crypto.randomUUID()}`,
      category: "Servicio personalizado",
      models: [model ? model.replace(/^iPhone\s*/i, "") : "*"],
      price: customPrice,
      variant: label,
    };
    const next = [...selectedServices, customEntry];
    setSelectedServices(next);
    setCost(next.reduce((sum, service) => sum + service.price, 0));
    setCustomService("");
    setCustomPrice(0);
  };

  const changeModel = (nextModel: string) => {
    setModel(nextModel);
    setServiceCategory("");
    setSelectedServices([]);
    setCost(0);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!customer.trim() || !phone.trim() || !model || selectedServices.length === 0 || !estimatedTime.trim()) {
      notify("Completa cliente, teléfono, modelo, servicio y tiempo estimado.", "error");
      return;
    }
    const ticket = onCreate({ customer: customer.trim(), phone: phone.trim(), model, services: selectedServices.map(getPriceLabel), cost, estimatedTime: estimatedTime.trim(), customerNotes: customerNotes.trim() });
    setCustomer(""); setPhone(""); setModel(""); setSelectedServices([]); setCost(0); setEstimatedTime(""); setCustomerNotes(""); setServiceCategory("");
    notify(`Orden ${ticket.folio} enviada al panel técnico.`);
  };

  return (
    <>
    <div className="page-content">
      <div className="page-heading"><div><div className="eyebrow">IPHONE SMART PARAGUA <span>/</span> RECEPCIÓN</div><h1>Caja y recepción</h1><p>Registra órdenes y mantén cada reparación en movimiento.</p></div><div className="today-pill"><span className="live-dot" /> Sincronizado en tiempo real</div></div>
      <section className="welcome-banner"><div className="welcome-copy"><span className="welcome-kicker"><span className="welcome-spark">✦</span> TU TALLER, MÁS ÁGIL</span><h2>Una experiencia <em>inteligente</em> para cada reparación.</h2><p>Recibe equipos, acompaña el trabajo técnico y cierra cada servicio desde un solo lugar.</p></div><div className="welcome-orbit"><div className="orbit-ring" /><div className="orbit-phone"><Icon name="phone" size={34} /></div><span className="orbit-tag">SMART SERVICE</span></div><div className="welcome-accent" /></section>
      <div className="stat-row">
        <div className="stat-card"><div className="stat-icon blue"><Icon name="clipboard" /></div><div><span>Órdenes registradas</span><strong>{tickets.length}</strong><small>En todos los estados</small></div></div>
        <div className="stat-card"><div className="stat-icon purple"><Icon name="clock" /></div><div><span>En taller</span><strong>{tickets.filter((ticket) => ticket.status !== "ready").length}</strong><small>Requieren seguimiento</small></div></div>
        <div className="stat-card"><div className="stat-icon green"><Icon name="check" /></div><div><span>Valor de órdenes</span><strong>{formatCurrency(total)}</strong><small>Acumulado registrado</small></div></div>
      </div>

      <div className="tariff-toolbar"><div><strong>Tarifario del taller</strong><span>Precios en bolívares · lista del {PRICE_LIST_DATE}</span></div><button className="secondary-button" type="button" onClick={() => setShowTariff(!showTariff)}>{showTariff ? "Ocultar tarifario" : "Consultar todos los precios"} <Icon name="arrow" size={15} /></button></div>
      {showTariff && <section className="panel tariff-panel">
        <div className="panel-heading"><div><h2>Tarifario completo</h2><p>Importes y referencias transcritos de la lista compartida.</p></div><span className="counter-badge">{visibleTariff.length} precios</span></div>
        <div className="tariff-filters"><label>Buscar modelo o reparación<input value={tariffQuery} onChange={(event) => setTariffQuery(event.target.value)} placeholder="Ej. iPhone 13 Pro, pantalla..." /></label><label>Filtrar por categoría<select value={tariffCategory} onChange={(event) => setTariffCategory(event.target.value)}><option>Todas</option>{PRICE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label></div>
        <div className="tariff-table-scroll"><table><thead><tr><th>REPARACIÓN / PRODUCTO</th><th>MODELO(S)</th><th>PRECIO (Bs)</th></tr></thead><tbody>{visibleTariff.map((entry) => <tr key={entry.id}><td><strong>{getPriceLabel(entry)}</strong></td><td>{entry.models.includes("*") ? "Todos los modelos" : entry.models.map((item) => `iPhone ${item}`).join(", ")}</td><td className="amount-cell">{formatCurrency(entry.price)}</td></tr>)}</tbody></table>{visibleTariff.length === 0 && <div className="mini-empty">No hay precios que coincidan con esa búsqueda.</div>}</div>
        <div className="tariff-date-note">Fecha impresa en la lista original: {PRICE_LIST_DATE}. Confirma disponibilidad y precio antes de emitir la orden.</div>
      </section>}
      <div className="content-grid">
        <section className="panel form-panel">
          <div className="panel-heading"><div><h2>Nueva orden de servicio</h2><p>Los datos se compartirán automáticamente con el técnico.</p></div><span className="step-badge">NUEVA</span></div>
          <form onSubmit={submit}>
            <div className="form-grid">
              <label>Nombre del cliente<input value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="Ej. María González" /></label>
              <label>Teléfono<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0412 123 4567" /></label>
              <label>Modelo del equipo<select value={model} onChange={(event) => changeModel(event.target.value)}><option value="">Selecciona un modelo</option>{MODELS.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Tiempo estimado<input value={estimatedTime} onChange={(event) => setEstimatedTime(event.target.value)} placeholder="Ej. 2 horas" /></label>
            </div>
            <div className="field-block"><div className="field-title">Servicio solicitado <span>Precios sugeridos para el modelo seleccionado</span></div>
              <label className="catalog-select-label">Categoría<select value={serviceCategory} onChange={(event) => setServiceCategory(event.target.value)} disabled={!model}><option value="">{model ? "Selecciona un servicio" : "Selecciona primero el modelo"}</option>{availableCategories.map((category) => <option key={category}>{category}</option>)}</select></label>
              {serviceCategory && <div className="service-grid price-choice-grid">{categoryPrices.map((entry) => {const selected = selectedServices.some((service) => service.id === entry.id); return <button className={`service-chip price-choice ${selected ? "selected" : ""}`} type="button" key={entry.id} onClick={() => toggleService(entry)}><span className="service-check">{selected ? <Icon name="check" size={13} /> : <Icon name="plus" size={13} />}</span><span>{getPriceLabel(entry)}<b>{formatCurrency(entry.price)}</b></span></button>;})}</div>}
              {!model && <div className="catalog-hint">Elige el modelo para ver únicamente los trabajos con precio en el tarifario.</div>}
              {model && availableCategories.length === 0 && <div className="catalog-hint">Este modelo no tiene precios en la lista compartida. Puedes agregar un servicio con importe manual.</div>}
              {selectedServices.length > 0 && <div className="selected-service-list"><div className="selected-service-title">Servicios en esta orden</div>{selectedServices.map((entry) => <div className="selected-service-row" key={entry.id}><span>{getPriceLabel(entry)}</span><strong>{formatCurrency(entry.price)}</strong><button type="button" aria-label={`Quitar ${getPriceLabel(entry)}`} onClick={() => toggleService(entry)}><Icon name="close" size={14} /></button></div>)}</div>}
              <div className="custom-service-fields"><label>Servicio o producto no listado<input value={customService} onChange={(event) => setCustomService(event.target.value)} placeholder="Describe otro trabajo, repuesto o accesorio" /></label><label>Precio (Bs)<input type="number" min="0" step="0.01" value={customPrice} onChange={(event) => setCustomPrice(Number(event.target.value))} /></label><button className="secondary-button" type="button" onClick={addCustomService}><Icon name="plus" size={15} /> Añadir al ticket</button></div>
            </div>
            <div className="form-grid cost-row">
              <label>Costo estimado (Bs)<div className="input-prefix"><span>Bs</span><input type="number" min="0" step="0.01" value={cost} onChange={(event) => setCost(Number(event.target.value))} placeholder="0.00" /></div></label>
              <div className="price-hint">Precios sugeridos en Bs. · ajustables según el diagnóstico</div>
            </div>
            <label className="notes-label">Notas extras / observaciones<textarea value={customerNotes} onChange={(event) => setCustomerNotes(event.target.value)} placeholder="Describe la falla, antecedentes o indicaciones del cliente..." rows={3} /></label>
            <div className="form-footer"><span><span className="required">*</span> Campos obligatorios</span><button className="primary-button" type="submit"><Icon name="plus" size={17} /> Enviar a taller <Icon name="arrow" size={16} /></button></div>
          </form>
        </section>

        <section className="panel ticket-panel">
          <div className="panel-heading"><div><h2>Órdenes recientes</h2><p>Tickets emitidos desde recepción.</p></div><span className="counter-badge">{tickets.length.toString().padStart(2, "0")}</span></div>
          <div className="ticket-tools"><div className="search-field"><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar orden..." /></div><select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} aria-label="Filtrar órdenes"><option value="todos">Todas</option><option value="abiertos">En taller</option><option value="listos">Finalizadas</option></select></div>
          <div className="ticket-list">{filtered.length === 0 ? <div className="empty-state"><div className="empty-icon"><Icon name="clipboard" size={24} /></div><strong>{tickets.length === 0 ? "Aún no hay órdenes" : "Sin resultados"}</strong><span>{tickets.length === 0 ? "Las órdenes que registres aparecerán aquí." : "Prueba con otro nombre o filtro."}</span></div> : filtered.slice(0, 6).map((ticket) => <article className="ticket-item" key={ticket.id}>
            <div className="ticket-avatar">{ticket.customer.trim().split(/\s+/).slice(0, 2).map((name) => name[0]).join("").toUpperCase()}</div>
            <div className="ticket-main"><div className="ticket-title"><strong>{ticket.customer}</strong><span className={`status-pill ${ticket.status}`}>{ticket.status === "ready" ? "Listo" : ticket.status === "inProgress" ? "En proceso" : "Pendiente"}</span></div><div className="ticket-sub">{ticket.folio} <span>·</span> {ticket.model}</div><div className="ticket-service">{ticket.services.join(", ")}</div>
              <div className="ticket-meta"><b>{formatCurrency(ticket.cost)}</b><span>{ticket.estimatedTime}</span></div>
              {ticket.customerNotes && <div className="ticket-note">Nota: {ticket.customerNotes}</div>}
              <div className="ticket-actions"><button onClick={() => onCopy(ticket)}><Icon name="clipboard" size={14} /> WhatsApp</button><button onClick={() => onPrint(ticket)}><Icon name="printer" size={14} /> PDF / imprimir</button></div>
              {ticket.status === "ready" && <div className="payment-actions">{ticket.paid ? <button className="complete" onClick={() => { onUpdate(ticket.id, { paid: false, paymentMethod: undefined }); notify("Pago marcado como pendiente."); }}>✓ Pagado · {ticket.paymentMethod ?? "Sin método"} · Deshacer</button> : <button className="collect-button" onClick={() => { setPaymentTicket(ticket); setPaymentMethod("QR Altoke"); }}>Cobrar · elegir método</button>}<button className={ticket.delivered ? "complete" : ""} onClick={() => { onUpdate(ticket.id, { delivered: !ticket.delivered }); notify(ticket.delivered ? "Entrega marcada como pendiente." : "Equipo marcado como entregado."); }}>{ticket.delivered ? "✓ Entregado" : "Marcar entrega"}</button></div>}
            </div>
          </article>)}</div>
          {tickets.length > 6 && <div className="list-foot">Mostrando las 6 órdenes más recientes</div>}
        </section>
      </div>
    </div>
    {paymentTicket && <div className="payment-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setPaymentTicket(null); }}>
      <section className="payment-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-title">
        <div className="payment-dialog-head"><div><span className="payment-kicker">IPHONE SMART PARAGUA</span><h2 id="payment-title">Registrar pago</h2><p>{paymentTicket.customer} · {paymentTicket.folio}</p></div><button className="icon-button" aria-label="Cerrar" onClick={() => setPaymentTicket(null)}><Icon name="close" /></button></div>
        <div className="payment-total"><span>Total a cobrar</span><strong>{formatCurrency(paymentTicket.cost)}</strong><small>Importe de la orden · bolívares (Bs)</small></div>
        <div className="payment-method-label">Selecciona el método de pago</div>
        <div className="payment-methods">{(["QR Altoke", "Efectivo", "Transferencia"] as const).map((method) => <button key={method} className={`payment-method ${paymentMethod === method ? "selected" : ""}`} onClick={() => setPaymentMethod(method)}><span className={`method-symbol ${method === "QR Altoke" ? "altoke-symbol" : ""}`}>{method === "QR Altoke" ? "QR" : method === "Efectivo" ? "$" : "⇄"}</span><span>{method}<small>{method === "QR Altoke" ? "Escanea para pagar" : method === "Efectivo" ? "Pago en caja" : "Transferencia bancaria"}</small></span><i>{paymentMethod === method ? "✓" : ""}</i></button>)}</div>
        {paymentMethod === "QR Altoke" && <div className="qr-payment"><div className="qr-image-wrap"><img className="payment-qr-image" src="/altoke-qr.png" alt="Código QR de Altoke para recibir pagos" /></div><div className="qr-instructions"><span className="qr-status"><span className="live-dot" /> QR ALTOKE</span><h3>Escanea para pagar</h3><p>Abre la app compatible, escanea este código y confirma el importe antes de enviar.</p><div className="qr-detail"><span>Cuenta</span><strong>CTA: 3783863-000-001</strong></div><div className="qr-detail"><span>Vigencia del QR</span><strong>10 de octubre de 2028</strong></div><div className="qr-currency-note">El QR es de Paraguay y la orden está en Bs. Confirma la moneda y el importe exactos que recibirá el comercio antes de cobrar.</div></div></div>}
        <div className="payment-dialog-footer"><span>Confirma el pago únicamente después de verificar que fue recibido.</span><button className="primary-button confirm-payment" onClick={() => { onUpdate(paymentTicket.id, { paid: true, paymentMethod }); notify(`Pago registrado · ${paymentMethod}.`); setPaymentTicket(null); }}><Icon name="check" size={16} /> Confirmar pago recibido</button></div>
      </section>
    </div>}
    </>
  );
}
