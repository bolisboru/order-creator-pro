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
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { CURRENCIES } from "@/lib/quote-format";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function SettingsPanel() {
  const settings = useQuery(api.settings.get);
  const upsert = useMutation(api.settings.upsert);
  const generateUploadUrl = useMutation(api.settings.generateUploadUrl);
  const clearLogo = useMutation(api.settings.clearLogo);

  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [currency, setCurrency] = useState("₺");
  const [vatRate, setVatRate] = useState("20");
  const [logoStorageId, setLogoStorageId] = useState<Id<"_storage"> | undefined>(
    undefined,
  );
  const [localLogoUrl, setLocalLogoUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadedRef = useRef(false);
  useEffect(() => {
    if (settings && !loadedRef.current) {
      loadedRef.current = true;
      setCompanyName(settings.companyName || "");
      setCompanyAddress(settings.companyAddress || "");
      setCompanyPhone(settings.companyPhone || "");
      setCurrency(settings.currency || "₺");
      setVatRate(String(settings.vatRate ?? 20));
      setLogoStorageId(settings.logoStorageId);
      setLocalLogoUrl(null);
    }
  }, [settings]);

  const previewUrl = localLogoUrl ?? settings?.logoUrl ?? null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir resim dosyası seçin");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo dosyası en fazla 2 MB olabilir");
      return;
    }
    setLocalLogoUrl(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      const url = await generateUploadUrl();
      const result = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!result.ok) throw new Error("Yükleme başarısız");
      const { storageId } = (await result.json()) as { storageId: string };
      setLogoStorageId(storageId as Id<"_storage">);
      toast.success("Logo yüklendi — kaydetmeyi unutmayın");
    } catch (err) {
      console.error(err);
      setLocalLogoUrl(null);
      toast.error("Logo yüklenemedi");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    setLogoStorageId(undefined);
    setLocalLogoUrl(null);
    try {
      await clearLogo();
      toast.success("Logo kaldırıldı — kaydetmeyi unutmayın");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!companyName.trim()) {
      toast.error("Firma adı zorunludur");
      return;
    }
    setIsSaving(true);
    try {
      await upsert({
        companyName: companyName.trim(),
        companyAddress: companyAddress.trim() || undefined,
        companyPhone: companyPhone.trim() || undefined,
        logoStorageId,
        currency,
        vatRate: Math.max(0, Math.min(100, parseFloat(vatRate) || 0)),
      });
      toast.success("Ayarlar kaydedildi");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Ayarlar kaydedilemedi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Ayarlar</h2>
        <p className="text-sm text-muted-foreground">
          Firma bilgileri, logo ve teklif varsayılanları
        </p>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Firma Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex size-20 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Firma logosu"
                  className="size-full object-contain"
                />
              ) : (
                <ImagePlus className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <ImagePlus className="mr-2 size-4" />
                  )}
                  {previewUrl ? "Logoyu Değiştir" : "Logo Yükle"}
                </Button>
                {previewUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={handleRemoveLogo}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Kaldır
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                PNG veya JPG, en fazla 2 MB. Teklifin üst kısmında görünür.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Firma Adı *</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="ör. Anadolu Metal San. ve Tic. A.Ş."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Firma Adresi</Label>
            <Textarea
              id="companyAddress"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              placeholder="Fabrika adresi"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyPhone">Telefon</Label>
            <Input
              id="companyPhone"
              value={companyPhone}
              onChange={(e) => setCompanyPhone(e.target.value)}
              placeholder="ör. 0212 000 00 00"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Teklif Varsayılanları</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
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
        </CardContent>
      </Card>

      <Button size="lg" onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          <Loader2 className="mr-2 size-4 animate-spin" />
        ) : (
          <Save className="mr-2 size-4" />
        )}
        Ayarları Kaydet
      </Button>
    </div>
  );
}
