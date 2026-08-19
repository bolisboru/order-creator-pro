import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { formatDate } from "@/lib/quote-format";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Status = "bekliyor" | "gonderildi" | "kismi_sevk" | "iptal";

const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; bg: string; icon: typeof Clock }
> = {
  bekliyor: {
    label: "Bekliyor",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: Clock,
  },
  gonderildi: {
    label: "Gönderildi",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle2,
  },
  kismi_sevk: {
    label: "Kısmi Sevk",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: PackageCheck,
  },
  iptal: {
    label: "İptal",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
  },
};

const ALL_STATUSES: { value: Status; label: string }[] = [
  { value: "bekliyor", label: "Bekliyor" },
  { value: "gonderildi", label: "Gönderildi" },
  { value: "kismi_sevk", label: "Kısmi Sevk" },
  { value: "iptal", label: "İptal" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "Tümü" },
  ...ALL_STATUSES,
];

function StatusBadge({ status }: { status: Status | undefined }) {
  const cfg = STATUS_CONFIG[status ?? "bekliyor"] ?? STATUS_CONFIG.bekliyor;
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cfg.bg,
        cfg.color,
      )}
    >
      <Icon className="size-3" />
      {cfg.label}
    </span>
  );
}

export function SiparisTakip({
  onOpen,
}: {
  onOpen: (id: Id<"quotes">) => void;
}) {
  const quotes = useQuery(api.quotes.list, {});
  const updateStatus = useMutation(api.quotes.updateStatus);
  const [filter, setFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const siparisler = (quotes ?? []).filter(
    (q) => (q.kind ?? "teklif") === "siparis",
  );

  const filtered =
    filter === "all"
      ? siparisler
      : siparisler.filter((q) => (q.status ?? "bekliyor") === filter);

  // Counts for summary
  const counts = {
    all: siparisler.length,
    bekliyor: siparisler.filter((q) => (q.status ?? "bekliyor") === "bekliyor").length,
    gonderildi: siparisler.filter((q) => q.status === "gonderildi").length,
    kismi_sevk: siparisler.filter((q) => q.status === "kismi_sevk").length,
    iptal: siparisler.filter((q) => q.status === "iptal").length,
  } as const;

  const handleStatusChange = async (id: string, newStatus: Status) => {
    setUpdatingId(id);
    try {
      await updateStatus({ id: id as Id<"quotes">, status: newStatus });
      toast.success("Durum güncellendi");
    } catch (err) {
      console.error(err);
      toast.error("Durum güncellenemedi");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Sipariş Takibi</h2>
        <p className="text-sm text-muted-foreground">
          Tüm siparişlerinizi görüntüleyin ve durumunu değiştirin.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {FILTER_OPTIONS.map(({ value, label }) => {
          const count =
            value === "all"
              ? counts.all
              : counts[value as keyof typeof counts] ?? 0;
          const isActive = filter === value;
          const cfg =
            value === "all"
              ? null
              : STATUS_CONFIG[value as Status];
          return (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                isActive
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border/70 bg-card hover:bg-muted/50",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
                {cfg && <cfg.icon className={cn("size-3.5", cfg.color)} />}
              </div>
              <p
                className={cn(
                  "mt-1 text-xl font-bold",
                  isActive ? "text-primary" : "text-foreground",
                )}
              >
                {count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Durum filtresi" />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} sipariş
        </span>
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <Card className="border-border/70 shadow-sm">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              {siparisler.length === 0
                ? "Henüz sipariş yok."
                : "Bu durumda sipariş bulunamadı."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => {
            const status = (q.status ?? "bekliyor") as Status;
            const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.bekliyor;
            const isUpdating = updatingId === q._id;
            return (
              <Card
                key={q._id}
                className="group border-border/70 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-foreground">
                        #{String(q.quoteNo).padStart(3, "0")}
                      </span>
                      <StatusBadge status={status} />
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">
                      {q.customerName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(q.orderDate)} · {q.items.length} ürün kalemi
                      {q.deliveryAddress && ` · ${q.deliveryAddress}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Quick status change */}
                    <Select
                      value={status}
                      onValueChange={(v) =>
                        handleStatusChange(q._id, v as Status)
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="h-8 w-36 text-xs">
                        {isUpdating ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => onOpen(q._id)}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
