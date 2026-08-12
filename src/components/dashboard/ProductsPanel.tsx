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
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { Loader2, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type ProductForm = {
  name: string;
  price: string;
  unit: string;
  description: string;
};

const emptyForm: ProductForm = { name: "", price: "", unit: "", description: "" };

export function ProductsPanel() {
  const products = useQuery(api.products.list);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (id: Id<"products">) => {
    const p = products?.find((x) => x._id === id);
    if (!p) return;
    setEditingId(id);
    setForm({
      name: p.name,
      price: String(p.price),
      unit: p.unit || "",
      description: p.description || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Ürün adı zorunludur");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: Math.max(0, parseFloat(form.price) || 0),
        unit: form.unit.trim() || undefined,
        description: form.description.trim() || undefined,
      };
      if (editingId) {
        await updateProduct({ id: editingId, ...payload });
        toast.success("Ürün güncellendi");
      } else {
        await createProduct(payload);
        toast.success("Ürün eklendi");
      }
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Ürün kaydedilemedi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: Id<"products">) => {
    try {
      await removeProduct({ id });
      toast.success("Ürün silindi");
    } catch (err) {
      console.error(err);
      toast.error("Ürün silinemedi");
    }
  };

  if (products === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Ürün Kataloğu</h2>
          <p className="text-sm text-muted-foreground">
            Tekliflerde kullanılacak ürünleri ve birim fiyatlarını yönetin
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" />
          Ürün Ekle
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package className="size-6" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">
            Katalog boş
          </h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Ürün adı, birim fiyat ve isteğe bağlı açıklama ile ürünlerinizi
            ekleyin. Teklif oluştururken katalogdan seçebilirsiniz.
          </p>
          <Button className="mt-6" onClick={openCreate}>
            <Plus className="mr-2 size-4" />
            İlk Ürünü Ekle
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Ürün</TableHead>
                <TableHead className="w-24">Birim Fiyat</TableHead>
                <TableHead className="w-24">Birim</TableHead>
                <TableHead className="hidden md:table-cell">Açıklama</TableHead>
                <TableHead className="w-24 text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>
                    <p className="font-medium">{p.name}</p>
                  </TableCell>
                  <TableCell className="font-medium">
                    {p.price.toLocaleString("tr-TR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.unit || "—"}
                  </TableCell>
                  <TableCell className="hidden max-w-xs truncate text-muted-foreground md:table-cell">
                    {p.description || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(p._id)}
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
                            <AlertDialogTitle>Ürünü sil?</AlertDialogTitle>
                            <AlertDialogDescription>
                              “{p.name}” kalıcı olarak silinecek. Daha önce
                              oluşturulan teklifler etkilenmez.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(p._id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Ürünü Düzenle" : "Ürün Ekle"}</DialogTitle>
            <DialogDescription>
              Teklif formunda katalogdan seçilecek ürün bilgisi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Ürün Adı *</Label>
              <Input
                id="productName"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="ör. CNC Kesim, 3 mm Sac"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productPrice">Birim Fiyat *</Label>
                <Input
                  id="productPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productUnit">Birim</Label>
                <Input
                  id="productUnit"
                  value={form.unit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unit: e.target.value }))
                  }
                  placeholder="ör. adet, m², kg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="productDescription">Açıklama</Label>
              <Input
                id="productDescription"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Ürüne ait varsayılan açıklama"
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
    </div>
  );
}
