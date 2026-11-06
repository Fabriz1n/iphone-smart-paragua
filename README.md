# 🛠️ Apple Repair Shop Management System

Sistema web integral desarrollado en React y Tailwind CSS para automatizar el control de ingresos, diagnósticos, reparaciones y cobros en talleres de servicio técnico Apple.

## 🚀 Características
- **Multirrol en tiempo real:** Vista de Caja (Recepcionista), Vista de Técnico (Taller) y Vista de Administrador.
- **Catálogo de Dispositivos:** Soporte completo desde iPhone 7 hasta iPhone 18 Pro Max.
- **Generación de Tickets:** Exportación rápida de comprobantes en texto para WhatsApp y documentos PDF para impresión térmica.
- **Persistencia de Datos:** Estado unificado para sincronizar solicitudes de servicio entre mostrador y área técnica.
- **Inventario RFID:** Recepción de repuestos identificados por tag y asignación del stock a órdenes abiertas mediante lectores RFID tipo teclado (código terminado en Enter).

## 🛠️ Tecnologías Utilizadas
- React / Vite
- Tailwind CSS
- Lucide React (Iconografía)
- jsPDF (Generación de tickets)

## 📦 Instalación Local
```bash
git clone [https://github.com/TU_USUARIO/apple-repair-shop.git](https://github.com/TU_USUARIO/apple-repair-shop.git)
cd apple-repair-shop
npm install
npm run dev
