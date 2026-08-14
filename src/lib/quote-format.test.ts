import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatMoney,
  quoteSubtotal,
  quoteTotals,
} from "./quote-format";

describe("formatMoney", () => {
  it("formats TR-style with the currency symbol", () => {
    expect(formatMoney(1250.5, "₺")).toBe("1.250,50 ₺");
    expect(formatMoney(0, "$")).toBe("0,00 $");
  });
});

describe("formatDate", () => {
  it("converts ISO to dd.mm.yyyy", () => {
    expect(formatDate("2026-08-12")).toBe("12.08.2026");
  });

  it("falls back gracefully", () => {
    expect(formatDate("")).toBe("—");
  });
});

describe("quoteTotals", () => {
  const items = [
    { name: "A", price: 100, quantity: 2 },
    { name: "B", price: 50, quantity: 3 },
  ];

  it("computes the subtotal as sum of price * quantity", () => {
    expect(quoteSubtotal(items)).toBe(350);
  });

  it("applies VAT on the subtotal", () => {
    const { subtotal, vat, total } = quoteTotals(items, 20);
    expect(subtotal).toBe(350);
    expect(vat).toBe(70);
    expect(total).toBe(420);
  });

  it("works with 0% VAT", () => {
    expect(quoteTotals(items, 0).total).toBe(350);
  });

  it("works with an empty item list", () => {
    expect(quoteTotals([], 20).total).toBe(0);
  });
});
