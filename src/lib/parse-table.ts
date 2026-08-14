/**
 * Parsing helpers for pasting product / customer tables from Excel or
 * Google Sheets (tab, semicolon, or multiple-space separated, TR number
 * format like "1.250,50").
 */

/** "1.250,50" / "1250,50" / "1250.50" / "1.250" -> number. Null when unparsable. */
export function parseNumberTR(raw: string): number | null {
  let s = raw.trim().replace(/[^\d.,\-]/g, "");
  if (!s) return null;
  const negative = s.startsWith("-");
  s = s.replace(/-/g, "");
  if (!s) return null;

  if (s.includes(",") && s.includes(".")) {
    // "1.250,50" -> thousands dots + comma decimal
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  } else if (s.includes(".")) {
    // "1.250" (3 digits after dot) -> thousands; "12.50" -> decimal
    if (/\.\d{3}$/.test(s)) {
      s = s.replace(/\./g, "");
    }
  }

  const n = parseFloat(s);
  if (Number.isNaN(n)) return null;
  return negative ? -n : n;
}

/** Split pasted text into cell rows (tabs, semicolons, 2+ spaces). */
export function splitTableLines(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const t = line.trim();
      if (!t) return null;
      const tabbed = t.split("\t").map((c) => c.trim());
      if (tabbed.length > 1) return tabbed;
      const semis = t.split(";").map((c) => c.trim());
      if (semis.length > 1) return semis;
      const spaced = t.split(/\s{2,}/).map((c) => c.trim());
      if (spaced.length > 1) return spaced;
      return [t];
    })
    .filter((row): row is string[] => row !== null);
}

export type ParsedProduct = {
  name: string;
  price: number | null;
  unit: string;
  description: string;
};

/**
 * Products: [ad, fiyat, birim, açıklama]. Supports 2-4 columns and a
 * shifted layout [ad, birim, fiyat, açıklama] when col 2 is not a number.
 * Drops a header row that mentions ürün/fiyat.
 */
export function parseProductRows(text: string): ParsedProduct[] {
  let rows = splitTableLines(text);
  if (
    rows.length > 1 &&
    /ürün|malzeme|fiyat|parça|isim/i.test(rows[0].join(" "))
  ) {
    rows = rows.slice(1);
  }
  return rows
    .map((c) => {
      const name = c[0]?.trim() || "";
      let price = parseNumberTR(c[1] ?? "");
      let unit = c[2]?.trim() || "";
      let description = c[3]?.trim() || "";
      if (price === null && c.length >= 2) {
        // Shifted: name / unit / price / description
        price = parseNumberTR(c[2] ?? "");
        unit = c[1]?.trim() || "";
        description = c[3]?.trim() || "";
      }
      return { name, price, unit, description };
    })
    .filter((r) => r.name.length > 0);
}

export type ParsedCustomer = {
  name: string;
  deliveryAddress: string;
  contactNumber: string;
};

/**
 * Customers: [firma adı, teslimat adresi, telefon]. Drops a header row
 * that mentions firma/adres/telefon.
 */
export function parseCustomerRows(text: string): ParsedCustomer[] {
  let rows = splitTableLines(text);
  if (
    rows.length > 1 &&
    /firma|müşteri|musteri|cari|adres|telefon/i.test(rows[0].join(" "))
  ) {
    rows = rows.slice(1);
  }
  return rows
    .map((c) => ({
      name: c[0]?.trim() || "",
      deliveryAddress: c[1]?.trim() || "",
      contactNumber: c[2]?.trim() || "",
    }))
    .filter((r) => r.name.length > 0);
}
