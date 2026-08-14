import { CustomersPanel } from "@/components/dashboard/CustomersPanel";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { ProductsPanel } from "@/components/dashboard/ProductsPanel";
import { QuoteForm } from "@/components/dashboard/QuoteForm";
import type { QuoteFormKind } from "@/components/dashboard/QuoteForm";
import { QuotesList } from "@/components/dashboard/QuotesList";
import { QuoteView } from "@/components/dashboard/QuoteView";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { useAuth } from "@/hooks/use-auth";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Archive,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

type Tab =
  | "ana"
  | "siparis"
  | "teklif"
  | "kayitlar"
  | "urunler"
  | "musteriler"
  | "ayarlar";

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "ana", label: "Ana Sayfa", icon: Home },
  { id: "siparis", label: "Sipariş Formu", icon: ClipboardList },
  { id: "teklif", label: "Teklif Formu", icon: FileText },
  { id: "kayitlar", label: "Kayıtlar", icon: Archive },
  { id: "urunler", label: "Ürünler", icon: Package },
  { id: "musteriler", label: "Müşteriler", icon: Users },
  { id: "ayarlar", label: "Ayarlar", icon: Settings },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("ana");
  const [selectedQuoteId, setSelectedQuoteId] = useState<Id<"quotes"> | null>(
    null,
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (selectedQuoteId) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6">
        <div className="mx-auto w-full max-w-4xl">
          <QuoteView
            quoteId={selectedQuoteId}
            onBack={() => setSelectedQuoteId(null)}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                </svg>
              </span>
              <span className="text-base font-semibold tracking-tight">
                FabrikaTeklif
              </span>
            </button>

            <div className="flex items-center gap-2 lg:hidden">
              <span className="text-sm text-muted-foreground">
                {user?.name ?? "Kullanıcı"}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Çıkış yap"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  tab === id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <span className="text-sm text-muted-foreground">
              {user?.name ?? "Kullanıcı"}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        {tab === "ana" && (
          <DashboardHome
            onOrder={() => setTab("siparis")}
            onQuote={() => setTab("teklif")}
            goToProducts={() => setTab("urunler")}
            goToCustomers={() => setTab("musteriler")}
          />
        )}
        {tab === "siparis" && (
          <QuoteForm
            kind="siparis"
            onSaved={(id) => setSelectedQuoteId(id)}
            goToProducts={() => setTab("urunler")}
            goToCustomers={() => setTab("musteriler")}
          />
        )}
        {tab === "teklif" && (
          <QuoteForm
            kind="teklif"
            onSaved={(id) => setSelectedQuoteId(id)}
            goToProducts={() => setTab("urunler")}
            goToCustomers={() => setTab("musteriler")}
          />
        )}
        {tab === "kayitlar" && (
          <QuotesList
            onOpen={(id) => setSelectedQuoteId(id)}
            goToNew={(kind: QuoteFormKind) => setTab(kind)}
          />
        )}
        {tab === "urunler" && <ProductsPanel />}
        {tab === "musteriler" && <CustomersPanel />}
        {tab === "ayarlar" && <SettingsPanel />}
      </div>
    </main>
  );
}
