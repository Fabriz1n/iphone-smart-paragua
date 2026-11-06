import type { InventoryItem, Ticket } from "../types";

const STORAGE_KEY = "fixlab-tickets-v1";
const INVENTORY_STORAGE_KEY = "fixlab-inventory-v1";

export function readTickets(): Ticket[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed)) throw new Error("Los tickets guardados tienen un formato inválido.");
  return parsed as Ticket[];
}

export function saveTickets(tickets: Ticket[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

export function subscribeToTicketChanges(onChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) onChange();
  };
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

export function readInventory(): InventoryItem[] {
  const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
  if (!stored) return [];

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed)) throw new Error("El inventario guardado tiene un formato inválido.");
  return parsed as InventoryItem[];
}

export function saveInventory(items: InventoryItem[]): void {
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
}

export function subscribeToInventoryChanges(onChange: () => void): () => void {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === INVENTORY_STORAGE_KEY || event.key === null) onChange();
  };
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}
