import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Download,
  FileImage,
  Factory,
  Lock,
  Package,
  PlusCircle,
  ShieldCheck,
  Tags,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: "easeOut" as const },
};

function BrandMark({ size = "md" }: { size?: "md" | "lg" }) {
  const cls = size === "lg" ? "size-10 rounded-xl" : "size-8 rounded-lg";
  const icon = size === "lg" ? "size-5" : "size-4";
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-primary text-primary-foreground shadow-sm ${cls}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={icon}
      >
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
      </svg>
    </span>
  );
}

/** Stylized preview of a quote document used in the hero. */
function MockQuote() {
  const rows = [
    { n: "CNC Kesim — 3 mm Sac", d: "Ral 7016 toz boya", q: "120", p: "85,00" },
    { n: "Kaynak İşçiliği", d: "MIG / MAG", q: "40", p: "120,00" },
    { n: "Barkod Etiket", d: "Kendinden yapışkanlı", q: "250", p: "2,50" },
  ];
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* glow */}
      <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 32, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
        className="relative rounded-2xl border border-border/80 bg-white p-6 shadow-2xl shadow-slate-900/10"
      >
        {/* doc header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-white">
              AM
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Anadolu Metal</p>
              <p className="text-[11px] text-slate-400">
                Organize Sanayi Bölgesi, Konya
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
              Sipariş Teklifi
            </p>
            <p className="mt-1 text-[11px] text-slate-500">Teklif No: #012</p>
          </div>
        </div>
        <div className="mt-4 h-1 rounded-full bg-indigo-600" />

        {/* customer */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            ["Firma", "Yıldız Mobilya A.Ş."],
            ["Teslimat", "İkitelli OSB, İstanbul"],
            ["İletişim", "0555 123 45 67"],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                {k}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-700">
                {v}
              </p>
            </div>
          ))}
        </div>

        {/* items */}
        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
          <div className="grid grid-cols-[1.4fr_1fr_auto_auto] gap-2 bg-slate-50 px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Ürün</span>
            <span>Açıklama</span>
            <span className="text-right">Miktar</span>
            <span className="text-right">Tutar</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={i}
              className={`grid grid-cols-[1.4fr_1fr_auto_auto] items-center gap-2 px-3 py-2.5 text-[11px] ${
                i % 2 === 1 ? "bg-slate-50/60" : ""
              }`}
            >
              <span className="font-semibold text-slate-900">{r.n}</span>
              <span className="text-slate-500">{r.d}</span>
              <span className="text-right text-slate-600">{r.q}</span>
              <span className="text-right font-semibold text-slate-900">
                {r.p} ₺
              </span>
            </div>
          ))}
        </div>

        {/* options + totals */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2">
            {["İskonto", "Sistem", "Barkod"].map((o) => (
              <span
                key={o}
                className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700"
              >
                <Check className="size-3" />
                {o}
              </span>
            ))}
          </div>
          <div className="rounded-lg bg-slate-800 px-4 py-2 text-right">
            <p className="text-[9px] uppercase tracking-wider text-slate-300">
              Genel Toplam
            </p>
            <p className="text-sm font-bold text-white">48.625,00 ₺</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const goToAuth = (path = "/dashboard") =>
    navigate(`/auth?returnTo=${encodeURIComponent(path)}`);

  const features = [
    {
      icon: Package,
      title: "Ürün Kataloğu",
      desc: "Ürünleri, birim fiyatlarını ve açıklamalarını tek yerden yönetin. Teklif oluştururken katalogdan tek tıkla seçin.",
    },
    {
      icon: Building2,
      title: "Müşteri Bilgileri",
      desc: "Firma adı, teslimat adresi ve iletişim numarası her teklifte düzenli şekilde yer alır.",
    },
    {
      icon: BadgeCheck,
      title: "İskonto · Sistem · Barkod",
      desc: "Müşteriye uygulanacak iskonto, sistem ve barkod etiket seçeneklerini teklif üzerinde Var/Yok olarak işaretleyin.",
    },
    {
      icon: Wallet,
      title: "Para Birimi + KDV",
      desc: "₺, $, € veya £ seçin; KDV oranını belirleyin. Firma logonuz teklifin başında otomatik görünsün.",
    },
    {
      icon: Download,
      title: "JPEG & PDF Çıktı",
      desc: "Hazır teklifi canlı önizleyin, kaydetmeden JPEG veya PDF olarak indirip WhatsApp ve e-posta ile paylaşın.",
    },
    {
      icon: Lock,
      title: "Basit Giriş",
      desc: "Tek kullanıcılı kullanım için kullanıcı adı ve şifre ile hızlı, güvenli erişim. Ekstra kurulum yok.",
    },
  ];

  const steps = [
    {
      n: "01",
      icon: PlusCircle,
      title: "Siparişi girin",
      desc: "Müşteri bilgilerini, sipariş tarihini ve ürünleri ekleyin. Fiyatlar ve açıklamalar satır satır.",
    },
    {
      n: "02",
      icon: Tags,
      title: "Seçenekleri işaretleyin",
      desc: "İskonto, sistem ve barkod etiket var mı yok mu — teklif üzerinde anında görünür.",
    },
    {
      n: "03",
      icon: FileImage,
      title: "İndirin ve paylaşın",
      desc: "Teklifi JPEG veya PDF olarak kaydedin, müşterinize saniyeler içinde iletin.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-base font-semibold tracking-tight">
              FabrikaTeklif
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#ozellikler" className="transition-colors hover:text-foreground">
              Özellikler
            </a>
            <a href="#nasil" className="transition-colors hover:text-foreground">
              Nasıl Çalışır
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToAuth()}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => goToAuth()}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              Teklif Oluştur
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-48 left-1/2 h-96 w-[52rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:pt-24">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm"
            >
              <Factory className="size-3.5 text-primary" />
              Üretime sipariş & teklif yönetimi
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl"
            >
              Siparişi girin,
              <br />
              teklifi{" "}
              <span className="text-primary">saniyeler içinde</span> paylaşın
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="mt-5 max-w-lg text-base leading-7 text-muted-foreground"
            >
              Müşteri bilgileri, ürünler ve fiyatlar; iskonto, sistem ve barkod
              etiket seçenekleriyle birlikte düzenli bir sipariş teklifine
              dönüşür. Firma logonuz, para biriminiz ve KDV'niz ile JPEG veya
              PDF olarak indirin.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <button
                type="button"
                onClick={() => goToAuth()}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
              >
                Ücretsiz Başla
                <ArrowRight className="size-4" />
              </button>
              <a
                href="#nasil"
                className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                Nasıl Çalışır?
              </a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <Check className="size-4 text-emerald-600" /> JPEG & PDF çıktı
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-4 text-emerald-600" /> Logo + para birimi + KDV
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="size-4 text-emerald-600" /> Mobil uyumlu
              </span>
            </motion.div>
          </div>

          <MockQuote />
        </div>
      </section>

      {/* Features */}
      <section id="ozellikler" className="border-t border-border/60 bg-card/50 py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Özellikler
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Fabrikaya özel, ihtiyacınıza göre
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Üretim siparişinizin her detayı — müşteriden fiyata, seçeneklerden
              çıktıya — tek akışta.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold tracking-tight">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="nasil" className="py-20">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Nasıl Çalışır
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Üç adımda hazır teklif
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="size-5" />
                  </div>
                  <span className="text-3xl font-bold tracking-tight text-border">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <motion.div
          {...fadeUp}
          className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl bg-slate-900 px-6 py-14 text-center text-white shadow-2xl shadow-slate-900/20 sm:px-12"
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Bugün ilk sipariş teklifinizi hazırlayın
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Firma bilgilerinizi ve ürünlerinizi ekleyin; dakikalar içinde
              müşterinize gönderebileceğiniz profesyonel teklifler oluşturun.
            </p>
            <button
              type="button"
              onClick={() => goToAuth()}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-semibold text-slate-900 shadow-lg transition-transform hover:scale-[1.02]"
            >
              Teklif Oluştur
              <ArrowRight className="size-4" />
            </button>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="size-4" />
              Kullanıcı adı & şifre ile güvenli erişim
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-sm font-semibold tracking-tight">
              FabrikaTeklif
            </span>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Üretim sipariş ve teklif yönetimi · Sadece sizin için tasarlandı
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#ozellikler" className="transition-colors hover:text-foreground">
              Özellikler
            </a>
            <button
              type="button"
              onClick={() => goToAuth()}
              className="font-medium text-primary hover:underline"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
