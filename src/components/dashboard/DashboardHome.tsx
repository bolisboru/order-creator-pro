import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  FileText,
  Package,
  Users,
} from "lucide-react";

export function DashboardHome({
  onOrder,
  onQuote,
  goToProducts,
  goToCustomers,
}: {
  onOrder: () => void;
  onQuote: () => void;
  goToProducts: () => void;
  goToCustomers: () => void;
}) {
  const quotes = useQuery(api.quotes.list, {});
  const products = useQuery(api.products.list);
  const customers = useQuery(api.customers.list);

  const teklifCount =
    quotes?.filter((q) => (q.kind ?? "teklif") === "teklif").length ?? 0;
  const siparisCount =
    quotes?.filter((q) => (q.kind ?? "teklif") === "siparis").length ?? 0;

  const stats = [
    { label: "Teklif", value: teklifCount, icon: FileText },
    { label: "Sipariş", value: siparisCount, icon: ClipboardList },
    { label: "Ürün", value: products?.length ?? 0, icon: Package },
    { label: "Müşteri", value: customers?.length ?? 0, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Hoş geldiniz</h2>
        <p className="text-sm text-muted-foreground">
          Bir sipariş formu veya teklif formu seçerek başlayın.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card
            key={label}
            className="border-border/70 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className="size-4 text-primary/70" />
            </div>
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          </Card>
        ))}
      </div>

      {/* Two entry cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="group relative overflow-hidden border-border/70 p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary/80" />
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="size-6" />
          </div>
          <h3 className="mt-4 text-lg font-bold tracking-tight">
            Sipariş Formu
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Üretime girecek siparişi hızlıca girin. Müşteri bilgileri, ürünler
            ve fiyatlar — ayrıntılı hesaplama yok, sadece kayıt.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary/70" />
              Kayıtlı müşteri ve ürünlerden hızlı seçim
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary/70" />
              Müşteriye özel fiyatlar otomatik gelir
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary/70" />
              JPEG / PDF çıktısı
            </li>
          </ul>
          <Button className="mt-6 w-full" onClick={onOrder}>
            Sipariş Formu Aç
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </Card>

        <Card className="group relative overflow-hidden border-border/70 p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-indigo-600" />
          <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600">
            <FileText className="size-6" />
          </div>
          <h3 className="mt-4 text-lg font-bold tracking-tight">
            Teklif Formu
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Müşteriye göndereceğiniz tam teklifi hazırlayın. İskonto, sistem,
            barkod etiket, KDV ve firma logosuyla JPEG / PDF olarak paylaşın.
          </p>
          <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary/70" />
              Tüm müşteri ve ürün detayları
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary/70" />
              İskonto · Sistem · Barkod seçenekleri
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="size-4 text-primary/70" />
              Ara toplam, KDV ve genel toplam
            </li>
          </ul>
          <Button className="mt-6 w-full" onClick={onQuote}>
            Teklif Formu Aç
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </Card>
      </div>

      {/* Quick setup links */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border/70 bg-card/60 px-5 py-4 text-sm">
        <span className="font-medium text-muted-foreground">
          Hızlı kurulum:
        </span>
        <button
          type="button"
          onClick={goToProducts}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Ürünleri ekle / toplu yükle
        </button>
        <button
          type="button"
          onClick={goToCustomers}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Müşterileri ekle
        </button>
      </div>
    </div>
  );
}
