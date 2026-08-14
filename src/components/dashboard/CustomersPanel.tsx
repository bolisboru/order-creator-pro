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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { BulkImportDialog } from "@/components/dashboard/BulkImportDialog";
import { api } from "@/convex/_generated/api";
import { parseCustomerRows } from "@/lib/parse-table";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import {
  BadgeDollarSign,
  ClipboardPaste,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type CustomerForm = {
  name: string;
  deliveryAddress: string;
  contactNumber: string;
};

const emptyForm: CustomerForm = {
  name: "",
  deliveryAddress: "",
  contactNumber: "",
};

export function CustomersPanel() {
  const customers = useQuery(api.customers.list);
  const createCustomer = useMutation(api.customers.create);
  const updateCustomer = useMutation(api.customers.update);
  const removeCustomer = useMutation(api.customers.remove);
  const bulkCreate = useMutation(api.customers.bulkCreate);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"customers"> | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [pricesFor, setPricesFor] = useState<Id<"customers"> | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (id: Id<"customers">) => {
    const c = customers?.find((x) => x._id === id);
    if (!c) return;
    setEditingId(id);
    setForm({
      name: c.name,
      deliveryAddress: c.deliveryAddress || "",
      contactNumber: c.contactNumber || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Firma adı zorunludur");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        deliveryAddress: form.deliveryAddress.trim() || undefined,
        contactNumber: form.contactNumber.trim() || undefined,
      };
      if (editingId) {
        await updateCustomer({ id: editingId, ...payload });
        toast.success("Müşteri güncellendi");
      } else {
        await createCustomer(payload);
        toast.success("Müşteri eklendi");
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Müşteri kaydedilemedi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: Id<"customers">) => {
    try {
      await removeCustomer({ id });
      toast.success("Müşteri silindi");
    } catch (err) {
      console.error(err);
      toast.error("Müşteri silinemedi");
    }
  };

  const parseImport = (text: string) =>
    parseCustomerRows(text).map((r) => [
      r.name,
      r.deliveryAddress,
      r.contactNumber,
    ]);

  const runImport = async (rows: string[][]) => {
    const data = rows.map((cells) => ({
      name: cells[0] || "",
      deliveryAddress: cells[1] || undefined,
      contactNumber: cells[2] || undefined,
    }));
    return await bulkCreate({ customers: data });
  };

  if (customers === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Müşteriler</h2>
          <p className="text-sm text-muted-foreground">
            Firma bilgileri ve müşteriye özel ürün fiyatları
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <ClipboardPaste className="mr-2 size-4" />
            Toplu Ekle
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            Müşteri Ekle
          </Button>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Users className="size-6" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">
            Henüz müşteri yok
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Müşterilerinizi tek tek ekleyin ya da Excel/Google Sheets
            tablonuzu kopyalayıp “Toplu Ekle” ile yapıştırın.
          </p>
          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <ClipboardPaste className="mr-2 size-4" />
              Tablo Yapıştır
            </Button>
            <Button onClick={openCreate}>
              <Plus className="mr-2 size-4" />
              İlk Müşteriyi Ekle
            </Button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Firma</TableHead>
                <TableHead className="hidden md:table-cell">
                  Teslimat Adresi
                </TableHead>
                <TableHead className="hidden sm:table-cell">İletişim</TableHead>
                <TableHead className="w-40 text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c._id}>
                  <TableCell>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground md:hidden">
                      {c.contactNumber || c.deliveryAddress || ""}
                    </p>
                  </TableCell>
                  <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                    {c.deliveryAddress || "—"}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {c.contactNumber || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => setPricesFor(c._id)}
                        title="Müşteriye özel fiyatlar"
                      >
                        <BadgeDollarSign className="mr-1.5 size-4" />
                        Fiyatlar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(c._id)}
                        aria-label="Düzenle"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            aria-label="Sil"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Müşteriyi sil?</AlertDialogTitle>
                            <AlertDialogDescription>
                              “{c.name}” ve bu müşteriye tanımlı özel fiyatlar
                              kalıcı olarak silinecek. Daha önce oluşturulan
                              teklifler etkilenmez.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(c._id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Evet, Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Müşteriyi Düzenle" : "Müşteri Ekle"}
            </DialogTitle>
            <DialogDescription>
              Sipariş ve teklif formlarında seçilecek müşteri bilgisi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Firma Adı *</Label>
              <Input
                id="customerName"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="ör. Yıldız Mobilya A.Ş."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Teslimat Adresi</Label>
              <Textarea
                id="customerAddress"
                value={form.deliveryAddress}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deliveryAddress: e.target.value }))
                }
                placeholder="Teslimat yapılacak adres"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">İletişim Numarası</Label>
              <Input
                id="customerPhone"
                value={form.contactNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactNumber: e.target.value }))
                }
                placeholder="ör. 0555 123 45 67"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Vazgeç
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !form.name.trim()}>
              {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {editingId ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk import */}
      <BulkImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Müşterileri Toplu Ekle"
        description="Excel / Google Sheets'ten kopyaladığınız tabloyu yapıştırın. Sütunlar: Firma Adı | Teslimat Adresi | Telefon (sekme, noktalı virgül veya 2+ boşlukla ayrılmış)."
        placeholder={"Yıldız Mobilya A.Ş.\tİkitelli OSB, Başakşehir\t0555 123 45 67\nAnadolu Metal San.\tOrganize San. Bölgesi, Konya\t0532 111 22 33"}
        columns={["Firma Adı", "Teslimat Adresi", "Telefon"]}
        parseText={parseImport}
        onImport={runImport}
      />

      {pricesFor && (
        <CustomerPricesDialog
          customerId={pricesFor}
          customerName={
            customers.find((c) => c._id === pricesFor)?.name ?? ""
          }
          onClose={() => setPricesFor(null)}
        />
      )}
    </div>
  );
}

/**
 * Per-customer product prices. Empty input = use the product's default price
 * (removes the special price); a number saves a special price for this
 * customer only.
 */
function CustomerPricesDialog({
  customerId,
  customerName,
  onClose,
}: {
  customerId: Id<"customers">;
  customerName: string;
  onClose: () => void;
}) {
  const products = useQuery(api.products.list);
  const prices = useQuery(api.customers.prices.list);
  const setPrice = useMutation(api.customers.prices.set);
  const removePrice = useMutation(api.customers.prices.remove);

  const existing = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of prices ?? []) {
      if (p.customerId === customerId) map.set(p.productId, p.price);
    }
    return map;
  }, [prices, customerId]);

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (prices === undefined) return;
    const next: Record<string, string> = {};
    for (const p of products ?? []) {
      const v = existing.get(p._id);
      if (v !== undefined) next[p._id] = String(v);
    }
    setInputs(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prices, products, customerId]);

  const handleSave = async () => {
    if (products === undefined || prices === undefined) return;
    setIsSaving(true);
    try {
      for (const p of products) {
        const raw = (inputs[p._id] ?? "").trim();
        if (raw === "") {
          const existingId = prices.find(
            (x) => x.customerId === customerId && x.productId === p._id,
          )?._id;
          if (existingId) await removePrice({ id: existingId });
          continue;
        }
        const value = Math.max(0, parseFloat(raw) || 0);
        await setPrice({ customerId, productId: p._id, price: value });
      }
      toast.success("Özel fiyatlar kaydedildi");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Özel fiyatlar kaydedilemedi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Özel Fiyatlar — {customerName}</DialogTitle>
          <DialogDescription>
            Boş bırakılan ürünlerde ürünün varsayılan fiyatı kullanılır.
            Formda bu müşteriyi seçtiğinizde özel fiyat otomatik gelir.
          </DialogDescription>
        </DialogHeader>

        {products === undefined || prices === undefined ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <p className="rounded-md bg-muted px-3 py-2.5 text-sm text-muted-foreground">
            Önce ürün kataloğuna ürün ekleyin.
          </p>
        ) : (
          <div className="max-h-80 space-y-2 overflow-auto pr-1">
            {products.map((p) => {
              const special = existing.get(p._id);
              return (
                <div
                  key={p._id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-background/60 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Varsayılan:{" "}
                      {p.price.toLocaleString("tr-TR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      ₺
                      {special !== undefined && (
                        <span className="ml-2 text-primary">
                          · bu müşteriye özel tanımlı
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs[p._id] ?? ""}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [p._id]: e.target.value,
                        }))
                      }
                      placeholder="Özel fiyat"
                      className="w-32"
                    />
                    <span className="text-xs text-muted-foreground">₺</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || products === undefined || prices === undefined}
          >
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
