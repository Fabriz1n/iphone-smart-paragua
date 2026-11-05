import type { Ticket } from "../types";

const STORAGE_KEY = "fixlab-tickets-v1";

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
