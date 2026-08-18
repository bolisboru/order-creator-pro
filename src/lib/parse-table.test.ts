import { describe, expect, it } from "vitest";
import {
  parseCustomerRows,
  parseNumberTR,
  parseProductRows,
  splitTableLines,
} from "./parse-table";

describe("parseNumberTR", () => {
  it("parses Turkish decimal comma with thousands dots", () => {
    expect(parseNumberTR("1.250,50")).toBe(1250.5);
  });

  it("parses plain comma decimals", () => {
    expect(parseNumberTR("1250,50")).toBe(1250.5);
  });

  it("parses dot decimals (EN style)", () => {
    expect(parseNumberTR("1250.50")).toBe(1250.5);
    expect(parseNumberTR("12.50")).toBe(12.5);
  });

  it("treats a 3-digit dot group as thousands", () => {
    expect(parseNumberTR("1.250")).toBe(1250);
    expect(parseNumberTR("1.250.000")).toBe(1250000);
  });

  it("strips currency symbols and spaces", () => {
    expect(parseNumberTR("₺ 1.250,50")).toBe(1250.5);
    expect(parseNumberTR("450 TL")).toBe(450);
  });

  it("handles negatives and zero", () => {
    expect(parseNumberTR("-500")).toBe(-500);
    expect(parseNumberTR("0")).toBe(0);
  });

  it("returns null for unparsable input", () => {
    expect(parseNumberTR("abc")).toBeNull();
    expect(parseNumberTR("")).toBeNull();
  });
});

describe("splitTableLines", () => {
  it("splits tab-separated rows", () => {
    expect(splitTableLines("A\t12\tx\nB\t13\ty")).toEqual([
      ["A", "12", "x"],
      ["B", "13", "y"],
    ]);
  });

  it("splits semicolon-separated rows", () => {
    expect(splitTableLines("A;12;x")).toEqual([["A", "12", "x"]]);
  });

  it("splits rows separated by 2+ spaces", () => {
    expect(splitTableLines("A  12  x")).toEqual([["A", "12", "x"]]);
  });

  it("keeps single-cell lines and drops empty lines", () => {
    expect(splitTableLines("Yalnız Satır\n\n\n")).toEqual([["Yalnız Satır"]]);
  });
});

describe("parseProductRows", () => {
  it("parses name / price / unit / description", () => {
    const rows = parseProductRows("CNC Kesim 3mm\t1.250,50\tadet\tLazer kesim");
    expect(rows).toEqual([
      {
        name: "CNC Kesim 3mm",
        price: 1250.5,
        unit: "adet",
        description: "Lazer kesim",
      },
    ]);
  });

  it("drops a header row", () => {
    const rows = parseProductRows(
      "Ürün Adı\tFiyat\tBirim\tAçıklama\nCNC Kesim\t1250,50\tadet\tLazer",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("CNC Kesim");
  });

  it("handles the shifted layout name / unit / price / description", () => {
    const rows = parseProductRows("CNC Kesim\tadet\t1.250,50\tLazer kesim");
    expect(rows[0]).toEqual({
      name: "CNC Kesim",
      price: 1250.5,
      unit: "adet",
      description: "Lazer kesim",
    });
  });

  it("leaves price null when missing", () => {
    const rows = parseProductRows("CNC Kesim");
    expect(rows[0]).toEqual({
      name: "CNC Kesim",
      price: null,
      unit: "",
      description: "",
    });
  });

  it("drops blank lines and empty-cell rows", () => {
    expect(parseProductRows("CNC Kesim\t1250\n\n\t\t\t")).toEqual([
      { name: "CNC Kesim", price: 1250, unit: "", description: "" },
    ]);
  });
});

describe("parseCustomerRows", () => {
  it("parses name / address / phone", () => {
    const rows = parseCustomerRows(
      "Yıldız Mobilya\tİkitelli OSB, Başakşehir\t0555 123 45 67",
    );
    expect(rows).toEqual([
      {
        name: "Yıldız Mobilya",
        deliveryAddress: "İkitelli OSB, Başakşehir",
        contactNumber: "0555 123 45 67",
      },
    ]);
  });

  it("drops a header row", () => {
    const rows = parseCustomerRows(
      "Firma Adı\tAdres\tTelefon\nAnadolu Metal\tOSB, Konya\t0532 111 22 33",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Anadolu Metal");
  });

  it("puts a 2-column phone into the contact field", () => {
    const rows = parseCustomerRows("Yıldız Mobilya\t0555 123 45 67");
    expect(rows[0]).toEqual({
      name: "Yıldız Mobilya",
      deliveryAddress: "",
      contactNumber: "0555 123 45 67",
    });
  });

  it("puts a 2-column address into the address field", () => {
    const rows = parseCustomerRows("Yıldız Mobilya\tİkitelli OSB");
    expect(rows[0]).toEqual({
      name: "Yıldız Mobilya",
      deliveryAddress: "İkitelli OSB",
      contactNumber: "",
    });
  });
});

describe("parseProductRows - 5-column format (Kod|Malzeme|Miktar|Birim|Fiyat)", () => {
  it("parses 5-column product rows from screenshot format", () => {
    const text =
      "A.101.01.01.01\t1080 gr/m25'li Siyah Renk\t1000\tcm\t199,00\n" +
      "A.101.01.02.01\t1200 gr/m25'li Beyaz\t500\tmt\t120,00";
    const rows = parseProductRows(text);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      name: "A.101.01.01.01 - 1080 gr/m25'li Siyah Renk",
      price: 199,
      unit: "cm",
      description: "Miktar: 1000",
    });
    expect(rows[1]).toEqual({
      name: "A.101.01.02.01 - 1200 gr/m25'li Beyaz",
      price: 120,
      unit: "mt",
      description: "Miktar: 500",
    });
  });

  it("skips header row with kod/malzeme", () => {
    const text =
      "Kod\tMalzeme\tMiktar\tBirim\tFiyat\n" +
      "B.201.01.01\tSac Plaka 3mm\t100\tadet\t450,00";
    const rows = parseProductRows(text);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toContain("B.201.01.01");
    expect(rows[0].price).toBe(450);
  });
});
