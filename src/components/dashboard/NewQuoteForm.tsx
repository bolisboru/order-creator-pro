import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { QuoteDocument } from "@/components/quote/QuoteDocument";
import { api } from "@/convex/_generated/api";
import { CURRENCIES, todayISO } from "@/lib/quote-format";
import { exportQuoteJpeg, exportQuotePdf } from "@/lib/quote-export";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Download,
  FileDown,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Row = {
  key: string;
  productId?: string;
  name: string;
  quantity: string;
  price: string;
  description: string;
};

let rowCounter = 0;
function newRow(): Row {
  rowCounter += 1;
  return {
    key: `row-${rowCounter}`,
    name: "",
    quantity: "1",
    price: "",
    description: "",
  };
}

const DEFAULT_CURRENCY = "₺";
const DEFAULT_VAT = 20;

export function NewQuoteForm({
  onSaved,
  goToProducts,
}: {
  onSaved: (id: Id<"quotes">) => void;
  goToProducts: () => void;
}) {
  const products = useQuery(api.products.list);
  const settings = useQuery(api.settings.get);
  const quotes = useQuery(api.quotes.list);
  const createQuote = useMutation(api.quotes.create);

  const [customerName, setCustomerName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [orderDate, setOrderDate] = useState(todayISO());
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [hasSystem, setHasSystem] = useState(false);
  const [hasBarcode, setHasBarcode] = useState(false);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [vatRate, setVatRate] = useState(String(DEFAULT_VAT));
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState<"jpeg" | "pdf" | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  // Sync currency/VAT once settings arrive
  const syncedSettings = useRef(false);
  useEffect(() => {
    if (settings && !syncedSettings.current) {
      syncedSettings.current = true;
      setCurrency(settings.currency || DEFAULT_CURRENCY);
      setVatRate(String(settings.vatRate ?? DEFAULT_VAT));
    }
  }, [settings]);

  const nextQuoteNo = useMemo(() => {
    if (!quotes) return 1;
    return quotes.reduce((max, q) => Math.max(max, q.quoteNo), 0) + 1;
  }, [quotes]);

  const parsedItems = useMemo(
    () =>
      rows
        .filter((r) => r.name.trim())
        .map((r) => ({
          name: r.name.trim(),
          quantity: Math.max(0, parseFloat(r.quantity) || 0),
          price: Math.max(0, parseFloat(r.price) || 0),
          description: r.description.trim() || undefined,
        })),
    [rows],
  );

  const previewQuote = useMemo(
    () => ({
      quoteNo: nextQuoteNo,
      customerName: customerName.trim() || "—",
      deliveryAddress: deliveryAddress.trim() || "—",
      contactNumber: contactNumber.trim() || "—",
      orderDate: orderDate || todayISO(),
      items: parsedItems,
      hasDiscount,
      hasSystem,
      hasBarcode,
      currency,
      vatRate: parseFloat(vatRate) || 0,
    }),
    [
      nextQuoteNo,
      customerName,
      deliveryAddress,
      contactNumber,
      orderDate,
      parsedItems,
      hasDiscount,
      hasSystem,
      hasBarcode,
      currency,
      vatRate,
    ],
  );

  const previewCompany = {
    companyName: settings?.companyName || "Firmanız",
    companyAddress: settings?.companyAddress,
    companyPhone: settings?.companyPhone,
    logoUrl: settings?.logoUrl,
  };

  const updateRow = (key: string, patch: Partial<Row>) => {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  };

  const selectProduct = (key: string, productId: string) => {
    const product = products?.find((p) => p._id === productId);
    if (!product) return;
    updateRow(key, {
      productId,
      name: product.name,
      price: String(product.price),
      description: product.description || "",
      quantity: "1",
    });
  };

  const handleSave = async () => {
    if (!customerName.trim()) {
      toast.error("Firma adı zorunludur");
      return;
    }
    if (parsedItems.length === 0) {
      toast.error("Teklife en az bir ürün ekleyin");
      return;
    }
    setIsSaving(true);
    try {
      const result = await createQuote({
        customerName: customerName.trim(),
        deliveryAddress: deliveryAddress.trim(),
        contactNumber: contactNumber.trim(),
        orderDate: orderDate || todayISO(),
        items: parsedItems,
        hasDiscount,
        hasSystem,
        hasBarcode,
        currency,
        vatRate: parseFloat(vatRate) || 0,
      });
      toast.success(`Teklif #${String(result.quoteNo).padStart(3, "0")} kaydedildi`);
      onSaved(result.id);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Teklif kaydedilemedi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format: "jpeg" | "pdf") => {
    if (!previewRef.current) return;
    setIsExporting(format);
    try {
      const base = `teklif-${String(nextQuoteNo).padStart(3, "0")}`;
      if (format === "jpeg") {
        await exportQuoteJpeg(previewRef.current, base);
      } else {
        await exportQuotePdf(previewRef.current, base);
      }
      toast.success(format === "jpeg" ? "JPEG indirildi" : "PDF indirildi");
    } catch (err) {
      console.error(err);
      toast.error("Dışa aktarma başarısız oldu");
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(420px,480px)] lg:items-start">
      {/* Form */}
      <div className="space-y-6">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Müşteri Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Firma Adı *</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="ör. Yıldız Mobilya A.Ş."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">İletişim Numarası</Label>
                <Input
                  id="contactNumber"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="ör. 0555 123 45 67"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Teslimat Adresi</Label>
                <Textarea
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Teslimat yapılacak adres"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderDate">Sipariş Tarihi</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Ürünler</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRows((prev) => [...prev, newRow()])}
            >
              <Plus className="mr-1.5 size-4" />
              Satır Ekle
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {products && products.length === 0 && (
              <p className="rounded-md bg-muted px-3 py-2.5 text-sm text-muted-foreground">
                Henüz ürün kataloğunuz yok.{" "}
                <button
                  type="button"
                  onClick={goToProducts}
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  Önce ürün ekleyin
                </button>{" "}
                ya da satırlara ürün adını elle yazın.
              </p>
            )}

            {rows.map((row, index) => (
              <div
                key={row.key}
                className="rounded-lg border border-border/70 bg-background/60 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Ürün {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setRows((prev) =>
                        prev.length > 1
                          ? prev.filter((r) => r.key !== row.key)
                          : prev,
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-12 sm:col-span-12">
                    <Select
                      value={row.productId ?? ""}
                      onValueChange={(v) => selectProduct(row.key, v)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Katalogdan ürün seçin (opsiyonel)" />
                      </SelectTrigger>
                      <SelectContent>
                        {(products ?? []).map((p) => (
                          <SelectItem key={p._id} value={p._id}>
                            {p.name} — {p.price.toLocaleString("tr-TR")} {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-12 sm:col-span-5">
                    <Input
                      value={row.name}
                      onChange={(e) => updateRow(row.key, { name: e.target.value })}
                      placeholder="Ürün adı *"
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-5">
                    <Input
                      value={row.description}
                      onChange={(e) =>
                        updateRow(row.key, { description: e.target.value })
                      }
                      placeholder="Açıklama (ör. ölçü, renk, kaplama)"
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-1">
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={row.quantity}
                      onChange={(e) =>
                        updateRow(row.key, { quantity: e.target.value })
                      }
                      title="Miktar"
                      aria-label="Miktar"
                    />
                  </div>
                  <div className="col-span-8 sm:col-span-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.price}
                      onChange={(e) =>
                        updateRow(row.key, { price: e.target.value })
                      }
                      placeholder="0,00"
                      title="Birim fiyat"
                      aria-label="Birim fiyat"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Teklif Seçenekleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/60 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">İskonto</p>
                  <p className="text-xs text-muted-foreground">
                    {hasDiscount ? "Var" : "Yok"}
                  </p>
                </div>
                <Switch
                  checked={hasDiscount}
                  onCheckedChange={setHasDiscount}
                  aria-label="İskonto"
                />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/60 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Sistem</p>
                  <p className="text-xs text-muted-foreground">
                    {hasSystem ? "Var" : "Yok"}
                  </p>
                </div>
                <Switch
                  checked={hasSystem}
                  onCheckedChange={setHasSystem}
                  aria-label="Sistem"
                />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/60 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Barkod Etiket</p>
                  <p className="text-xs text-muted-foreground">
                    {hasBarcode ? "Var" : "Yok"}
                  </p>
                </div>
                <Switch
                  checked={hasBarcode}
                  onCheckedChange={setHasBarcode}
                  aria-label="Barkod etiket"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Para Birimi</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vatRate">KDV Oranı (%)</Label>
                <Input
                  id="vatRate"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="lg"
            onClick={handleSave}
            disabled={isSaving || !customerName.trim() || parsedItems.length === 0}
          >
            {isSaving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Teklifi Kaydet
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => handleExport("jpeg")}
            disabled={isExporting !== null}
          >
            {isExporting === "jpeg" ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            JPEG İndir
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => handleExport("pdf")}
            disabled={isExporting !== null}
          >
            {isExporting === "pdf" ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 size-4" />
            )}
            PDF İndir
          </Button>
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Canlı önizleme — kaydetmeden indirebilirsiniz
          </p>
        </div>
        <div className="max-h-[85vh] overflow-auto rounded-xl border border-border/80 bg-slate-200/60 p-4 shadow-inner">
          <div className="mx-auto w-fit shadow-xl shadow-slate-900/10">
            <div ref={previewRef}>
              <QuoteDocument quote={previewQuote} company={previewCompany} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
