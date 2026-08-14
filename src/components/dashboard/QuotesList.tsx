import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { formatDate, formatMoney, quoteTotals } from "@/lib/quote-format";
import { useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { ClipboardList, Eye, FileText, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import type { QuoteFormKind } from "./QuoteForm";

type Filter = "all" | QuoteFormKind;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "teklif", label: "Teklifler" },
  { id: "siparis", label: "Siparişler" },
];

export function QuotesList({
  onOpen,
  goToNew,
}: {
  onOpen: (id: Id<"quotes">) => void;
  goToNew: (kind: QuoteFormKind) => void;
}) {
  const quotes = useQuery(api.quotes.list, {});
  const [filter, setFilter] = useState<Filter>("all");

  if (quotes === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filtered =
    filter === "all"
      ? quotes
      : quotes.filter((q) => (q.kind ?? "teklif") === filter);

  if (quotes.length === 0) {
    const isOrder = filter === "siparis";
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card/60 px-6 py-20 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {isOrder ? (
            <ClipboardList className="size-6" />
          ) : (
            <FileText className="size-6" />
          )}
        </div>
        <h3 className="text-lg font-semibold tracking-tight">
          {filter === "all"
            ? "Henüz kayıt yok"
            : isOrder
              ? "Henüz sipariş yok"
              : "Henüz teklif yok"}
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {isOrder
            ? "Üretime girecek siparişleri buradan takip edersiniz."
            : "Müşteriye göndereceğiniz teklifleri buradan takip edersiniz."}
        </p>
        <Button className="mt-6" onClick={() => goToNew(isOrder ? "siparis" : "teklif")}>
          <Plus className="mr-2 size-4" />
          {isOrder ? "İlk Siparişi Oluştur" : "İlk Teklifi Oluştur"}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Kayıtlar</h2>
          <p className="text-sm text-muted-foreground">
            Teklifler ve üretim siparişleri
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-card p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20">No</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead className="hidden md:table-cell">Tür</TableHead>
              <TableHead className="hidden md:table-cell">Tarih</TableHead>
              <TableHead className="text-right">Tutar</TableHead>
              <TableHead className="w-16 text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((quote) => {
              const isOrder = (quote.kind ?? "teklif") === "siparis";
              const totals = quoteTotals(quote.items, quote.vatRate);
              return (
                <TableRow
                  key={quote._id}
                  className="cursor-pointer"
                  onClick={() => onOpen(quote._id)}
                >
                  <TableCell className="font-medium">
                    #{String(quote.quoteNo).padStart(3, "0")}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{quote.customerName}</p>
                    <p className="text-xs text-muted-foreground md:hidden">
                      {formatDate(quote.orderDate)}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={isOrder ? "secondary" : "default"}
                      className="text-[11px]"
                    >
                      {isOrder ? "Sipariş" : "Teklif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {formatDate(quote.orderDate)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {isOrder
                      ? "—"
                      : formatMoney(totals.total, quote.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpen(quote._id);
                      }}
                      aria-label="Görüntüle"
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
