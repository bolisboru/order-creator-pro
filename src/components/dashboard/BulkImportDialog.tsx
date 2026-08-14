import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Table2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

/**
 * Paste-a-table import dialog. The caller provides a parser that converts
 * pasted text into preview rows (cells) and an importer that persists them.
 */
export function BulkImportDialog({
  open,
  onOpenChange,
  title,
  description,
  placeholder,
  columns,
  parseText,
  onImport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  placeholder: string;
  columns: string[];
  parseText: (text: string) => string[][];
  onImport: (rows: string[][]) => Promise<number>;
}) {
  const [text, setText] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const rows = useMemo(() => parseText(text), [text, parseText]);

  const handleImport = async () => {
    if (rows.length === 0) {
      toast.error("Algılanan satır yok — tabloyu kontrol edin");
      return;
    }
    setIsImporting(true);
    try {
      const count = await onImport(rows);
      toast.success(`${count} kayıt eklendi`);
      setText("");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Aktarım başarısız oldu");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={8}
            className="font-mono text-xs"
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Table2 className="size-3.5" />
            <span>
              {rows.length === 0
                ? "Henüz satır algılanmadı"
                : `${rows.length} satır algılandı — aşağıdan önizleyin, sonra “Aktar” deyin.`}
            </span>
          </div>

          {rows.length > 0 && (
            <div className="max-h-56 overflow-auto rounded-lg border border-border/70">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                  <tr>
                    {columns.map((c) => (
                      <th
                        key={c}
                        className="px-3 py-2 font-semibold text-muted-foreground"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 50).map((cells, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 1 ? "bg-muted/30" : "bg-card"}
                    >
                      {columns.map((_, ci) => (
                        <td
                          key={ci}
                          className="px-3 py-1.5 text-foreground/90"
                        >
                          {cells[ci] || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Vazgeç
          </Button>
          <Button onClick={handleImport} disabled={isImporting || rows.length === 0}>
            {isImporting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Aktar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
