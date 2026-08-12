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
import { Eye, FileText, Loader2, Plus } from "lucide-react";

export function QuotesList({
  onOpen,
  goToNew,
}: {
  onOpen: (id: Id<"quotes">) => void;
  goToNew: () => void;
}) {
  const quotes = useQuery(api.quotes.list);

  if (quotes === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card/60 px-6 py-20 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText className="size-6" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight">
          Henüz teklif yok
        </h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Üretime sipariş girin, müşteri bilgilerini ekleyin ve ilk sipariş
          teklifinizi oluşturun.
        </p>
        <Button className="mt-6" onClick={goToNew}>
          <Plus className="mr-2 size-4" />
          İlk Teklifi Oluştur
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-20">No</TableHead>
            <TableHead>Müşteri</TableHead>
            <TableHead className="hidden md:table-cell">Tarih</TableHead>
            <TableHead className="hidden md:table-cell">Seçenekler</TableHead>
            <TableHead className="text-right">Tutar</TableHead>
            <TableHead className="w-16 text-right">İşlem</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => {
            const totals = quoteTotals(quote.items, quote.vatRate);
            const options = [
              quote.hasDiscount ? "İskonto" : null,
              quote.hasSystem ? "Sistem" : null,
              quote.hasBarcode ? "Barkod" : null,
            ].filter(Boolean);
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
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {formatDate(quote.orderDate)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {options.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      options.map((o) => (
                        <Badge key={o} variant="secondary" className="text-[11px]">
                          {o}
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatMoney(totals.total, quote.currency)}
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
                    aria-label="Teklifi görüntüle"
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
  );
}
