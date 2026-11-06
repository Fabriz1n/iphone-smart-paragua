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
  usedParts?: TicketPart[];
}

export interface TicketPart {
  inventoryItemId: string;
  name: string;
  tagCode: string;
  quantity: number;
  linkedAt?: string;
}

export interface InventoryItem {
  id: string;
  tagCode: string;
  name: string;
  category: string;
  stock: number;
  updatedAt: string;
}

export interface InventoryScanFeedback {
  code: string;
  message: string;
  kind: "success" | "error";
}

export type ViewName = "caja" | "tecnico" | "admin" | "inventario";
