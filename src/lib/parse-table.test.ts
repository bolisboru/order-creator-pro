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
