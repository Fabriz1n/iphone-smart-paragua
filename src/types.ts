export type TicketStatus = "pending" | "inProgress" | "ready";
export type PaymentMethod = "QR Altoke" | "Efectivo" | "Transferencia";

export interface Ticket {
  id: string;
  folio: string;
  createdAt: string;
  customer: string;
  phone: string;
  model: string;
  services: string[];
  cost: number;
  estimatedTime: string;
  customerNotes: string;
  internalNotes: string;
  status: TicketStatus;
  paid: boolean;
  paymentMethod?: PaymentMethod;
  delivered: boolean;
}

export type ViewName = "caja" | "tecnico" | "admin";
