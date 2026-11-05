import type { ViewName } from "../types";
import Icon from "./Icon";

interface NavbarProps {
  view: ViewName;
  onChange: (view: ViewName) => void;
  openCount: number;
  dark: boolean;
  onToggleTheme: () => void;
}

const links: { id: ViewName; label: string; icon: "grid" | "box" | "users" }[] = [
  { id: "caja", label: "Caja y recepción", icon: "grid" },
  { id: "tecnico", label: "Panel técnico", icon: "box" },
  { id: "admin", label: "Administración", icon: "users" },
];

export default function Navbar({ view, onChange, openCount, dark, onToggleTheme }: NavbarProps) {
  return (
    <>
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Icon name="phone" size={23} /></div><div><strong>iPhone Smart</strong><span>PARAGUA · SERVICIO TÉCNICO</span></div></div>
        <div className="side-label">ESPACIO DE TRABAJO</div>
        <nav className="side-nav" aria-label="Navegación principal">
          {links.map((link) => <button key={link.id} className={`nav-link ${view === link.id ? "active" : ""}`} onClick={() => onChange(link.id)}>
            <Icon name={link.icon} /><span>{link.label}</span>{link.id === "tecnico" && openCount > 0 && <span className="nav-count">{openCount}</span>}
          </button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon">?</div><strong>¿Necesitas ayuda?</strong><span>Estamos para apoyarte en tu jornada.</span><button onClick={() => window.alert("Contacta al administrador de tu taller para recibir asistencia.")}>Contactar soporte <Icon name="arrow" size={15} /></button></div>
          <div className="profile"><div className="avatar">ISP</div><div><strong>iPhone Smart</strong><span>Administrador</span></div><button className="icon-button" aria-label="Cambiar tema" onClick={onToggleTheme}><Icon name={dark ? "sun" : "moon"} size={18} /></button></div>
        </div>
      </aside>
      <header className="mobile-header"><div className="brand"><div className="brand-mark"><Icon name="phone" size={20} /></div><div className="mobile-brand-copy"><strong>iPhone Smart</strong><span>PARAGUA</span></div></div><div className="mobile-header-actions"><span className="live-dot">En línea</span><button className="icon-button" aria-label="Cambiar tema" onClick={onToggleTheme}><Icon name={dark ? "sun" : "moon"} size={17} /></button></div></header>
      <nav className="mobile-nav" aria-label="Navegación principal">{links.map((link) => <button key={link.id} className={view === link.id ? "active" : ""} onClick={() => onChange(link.id)}><Icon name={link.icon} size={16} /><span>{link.label}</span>{link.id === "tecnico" && openCount > 0 && <b>{openCount}</b>}</button>)}</nav>
    </>
  );
}
