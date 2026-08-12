export type QuoteItemInput = {
  name: string;
  price: number;
  quantity: number;
  description?: string;
};

export function formatMoney(value: number, currency: string): string {
  const formatted = value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}

/** "2026-08-12" -> "12.08.2026" */
export function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

export function todayISO(): string {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

export function quoteSubtotal(items: QuoteItemInput[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function quoteTotals(items: QuoteItemInput[], vatRate: number) {
  const subtotal = quoteSubtotal(items);
  const vat = subtotal * (vatRate / 100);
  const total = subtotal + vat;
  return { subtotal, vat, total };
}

export const CURRENCIES = [
  { value: "₺", label: "₺ — Türk Lirası (TRY)" },
  { value: "$", label: "$ — ABD Doları (USD)" },
  { value: "€", label: "€ — Euro (EUR)" },
  { value: "£", label: "£ — İngiliz Sterlini (GBP)" },
] as const;
