import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { QuoteDocument } from "@/components/quote/QuoteDocument";
import { api } from "@/convex/_generated/api";
import { formatDate, formatMoney, quoteTotals } from "@/lib/quote-format";
import { exportQuoteJpeg, exportQuotePdf } from "@/lib/quote-export";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft,
  Download,
  Edit3,
  FileDown,
  Loader2,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function QuoteView({
  quoteId,
  onBack,
  onEdit,
}: {
  quoteId: Id<"quotes">;
  onBack: () => void;
  onEdit?: (id: Id<"quotes">, kind: "siparis" | "teklif") => void;
}) {
  const quote = useQuery(api.quotes.get, { id: quoteId });
  const settings = useQuery(api.settings.get);
  const removeQuote = useMutation(api.quotes.remove);
  const [isExporting, setIsExporting] = useState<"jpeg" | "pdf" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  if (quote === undefined || settings === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (quote === null) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">Teklif bulunamadı.</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          <ArrowLeft className="mr-2 size-4" />
          Tekliflere dön
        </Button>
      </div>
    );
  }

  const company = settings ?? {
    companyName: "Firmanız",
    companyAddress: undefined as string | undefined,
    companyPhone: undefined as string | undefined,
    logoUrl: null as string | null,
  };

  const isOrder = (quote.kind ?? "teklif") === "siparis";
  const totals = quoteTotals(quote.items, quote.vatRate);
  const filename = `${isOrder ? "siparis" : "teklif"}-${String(
    quote.quoteNo,
  ).padStart(3, "0")}`;

  const handleExport = async (format: "jpeg" | "pdf") => {
    if (!previewRef.current) return;
    setIsExporting(format);
    try {
      if (format === "jpeg") {
        await exportQuoteJpeg(previewRef.current, filename);
      } else {
        await exportQuotePdf(previewRef.current, filename);
      }
      toast.success(format === "jpeg" ? "JPEG indirildi" : "PDF indirildi");
    } catch (err) {
      console.error(err);
      toast.error("Dışa aktarma başarısız oldu");
    } finally {
      setIsExporting(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeQuote({ id: quoteId });
      toast.success(isOrder ? "Sipariş silindi" : "Teklif silindi");
      onBack();
    } catch (err) {
      console.error(err);
      toast.error("Teklif silinemedi");
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {isOrder ? "Sipariş" : "Teklif"}{" "}
              #{String(quote.quoteNo).padStart(3, "0")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {quote.customerName} · {formatDate(quote.orderDate)} ·{" "}
              {isOrder
                ? `${quote.items.length} ürün kalemi`
                : formatMoney(totals.total, quote.currency)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onEdit && (
            <Button
              variant="default"
              onClick={() => onEdit(quoteId, isOrder ? "siparis" : "teklif")}
            >
              <Edit3 className="mr-2 size-4" />
              Düzenle
            </Button>
          )}
          <Button
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 size-4" />
                Sil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isOrder ? "Siparişi" : "Teklifi"} silmek istiyor musunuz?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  #{String(quote.quoteNo).padStart(3, "0")} numaralı{" "}
                  {isOrder ? "sipariş" : "teklif"} kalıcı olarak silinecek. Bu
                  işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Evet, Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Document preview */}
      <div className="rounded-xl border border-border/80 bg-slate-200/60 p-4 shadow-inner">
        <div className="max-h-[80vh] overflow-auto">
          <div className="mx-auto w-fit shadow-xl shadow-slate-900/10">
            <div ref={previewRef}>
              <QuoteDocument
                quote={quote}
                company={{
                  companyName: company.companyName || "Firmanız",
                  companyAddress: company.companyAddress,
                  companyPhone: company.companyPhone,
                  logoUrl: company.logoUrl,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
