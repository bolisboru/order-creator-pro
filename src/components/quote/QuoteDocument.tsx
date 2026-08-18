import { formatDate, formatMoney, quoteTotals } from "@/lib/quote-format";

export type QuoteDocItem = {
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  description?: string;
};

export type QuoteDocData = {
  kind?: "teklif" | "siparis";
  quoteNo: number;
  customerName: string;
  deliveryAddress: string;
  contactNumber: string;
  orderDate: string;
  items: QuoteDocItem[];
  hasDiscount: boolean;
  hasSystem: boolean;
  hasBarcode: boolean;
  currency: string;
  vatRate: number;
};

export type QuoteDocCompany = {
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  logoUrl?: string | null;
};

/**
 * The order quote (sipariş teklifi) rendered as a fixed A4-width document.
 * This exact node is captured to JPEG/PDF, so it uses explicit colors only.
 */
export function QuoteDocument({
  quote,
  company,
}: {
  quote: QuoteDocData;
  company: QuoteDocCompany;
}) {
  const { subtotal, vat, total } = quoteTotals(quote.items, quote.vatRate);
  const initials = (company.companyName || "FT")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const option = (label: string, value: boolean) => (
    <div className="flex items-center gap-2">
      <span className="flex size-5 items-center justify-center rounded-full bg-slate-800">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3"
        >
          {value ? (
            <path d="M20 6 9 17l-5-5" />
          ) : (
            <path d="M18 6 6 18M6 6l12 12" />
          )}
        </svg>
      </span>
      <span className="text-[13px] font-medium text-slate-800">
        {label}
        <span className="ml-1.5 text-slate-500">
          {value ? "Var" : "Yok"}
        </span>
      </span>
    </div>
  );

  return (
    <div
      className="w-[794px] bg-white text-slate-900"
      style={{ fontFamily:
        "ui-sans-serif, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
    >
      <div className="px-12 py-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-8">
          <div className="flex items-center gap-4">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt=""
                className="size-16 rounded-lg border border-slate-200 object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-lg bg-slate-800 text-xl font-bold text-white">
                {initials || "FT"}
              </div>
            )}
            <div>
              <p className="text-xl font-bold tracking-tight text-slate-900">
                {company.companyName || "Firmanız"}
              </p>
              {company.companyAddress && (
                <p className="mt-0.5 max-w-xs text-xs leading-5 text-slate-500">
                  {company.companyAddress}
                </p>
              )}
              {company.companyPhone && (
                <p className="mt-0.5 text-xs text-slate-500">
                  {company.companyPhone}
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold uppercase tracking-[0.18em] text-indigo-600">
              {quote.kind === "siparis" ? "Sipariş Formu" : "Sipariş Teklifi"}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Teklif No: #{String(quote.quoteNo).padStart(3, "0")}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              Tarih: {formatDate(quote.orderDate)}
            </p>
          </div>
        </div>

        <div className="mt-6 h-1 rounded-full bg-indigo-600" />

        {/* Customer info */}
        <div className="mt-7 grid grid-cols-3 gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Firma
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {quote.customerName}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Teslimat Adresi
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-700">
              {quote.deliveryAddress}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              İletişim
            </p>
            <p className="mt-1 text-sm text-slate-700">{quote.contactNumber}</p>
          </div>
        </div>

        {/* Items table */}
        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-4 py-2.5 font-semibold">#</th>
                <th className="px-4 py-2.5 font-semibold">Ürün</th>
                <th className="px-4 py-2.5 font-semibold">Açıklama</th>
                <th className="px-4 py-2.5 text-right font-semibold">Miktar</th>
                <th className="px-4 py-2.5 font-center font-semibold">Birim</th>
                <th className="px-4 py-2.5 text-right font-semibold">Birim Fiyat</th>
                <th className="px-4 py-2.5 text-right font-semibold">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 1 ? "bg-slate-50/60" : "bg-white"}
                >
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-[13px] leading-5 text-slate-500">
                    {item.description || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-700">
                    {item.quantity.toLocaleString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-slate-500">
                    {item.unit || "adet"}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-slate-700">
                    {formatMoney(item.price, quote.currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                    {formatMoney(item.price * item.quantity, quote.currency)}
                  </td>
                </tr>
              ))}
              {quote.items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-sm text-slate-400"
                  >
                    Henüz ürün eklenmedi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Options */}
        <div className="mt-6 flex items-center gap-8 rounded-lg border border-slate-200 bg-slate-50/60 px-5 py-3.5">
          {option("İskonto", quote.hasDiscount)}
          {option("Sistem", quote.hasSystem)}
          {option("Barkod Etiket", quote.hasBarcode)}
        </div>

        {quote.kind !== "siparis" && (
          <>
            {/* Totals */}
            <div className="mt-7 flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Ara Toplam</span>
                  <span>{formatMoney(subtotal, quote.currency)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>KDV (%{quote.vatRate.toLocaleString("tr-TR")})</span>
                  <span>{formatMoney(vat, quote.currency)}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-800 px-4 py-2.5 text-white">
                  <span className="text-sm font-semibold">Genel Toplam</span>
                  <span className="text-base font-bold">
                    {formatMoney(total, quote.currency)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-10 flex items-end justify-between gap-8 border-t border-slate-200 pt-6">
          <div className="text-xs leading-5 text-slate-500">
            {company.companyName && (
              <p className="font-semibold text-slate-700">
                {company.companyName}
              </p>
            )}
            {company.companyAddress && <p>{company.companyAddress}</p>}
            {company.companyPhone && <p>{company.companyPhone}</p>}
          </div>
          {quote.kind !== "siparis" && (
            <div className="w-56 text-center">
              <div className="mb-10 border-b border-slate-300" />
              <p className="text-xs font-medium text-slate-500">
                Onay / Kaşe / İmza
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
