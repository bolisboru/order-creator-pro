import { NewQuoteForm } from "@/components/dashboard/NewQuoteForm";
import { ProductsPanel } from "@/components/dashboard/ProductsPanel";
import { QuotesList } from "@/components/dashboard/QuotesList";
import { QuoteView } from "@/components/dashboard/QuoteView";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { useAuth } from "@/hooks/use-auth";
import type { Id } from "@/convex/_generated/dataModel";
import {
  FileText,
  LogOut,
  Package,
  PlusCircle,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

type Tab = "yeni" | "teklifler" | "urunler" | "ayarlar";

const TABS: { id: Tab; label: string; icon: typeof PlusCircle }[] = [
  { id: "yeni", label: "Yeni Teklif", icon: PlusCircle },
  { id: "teklifler", label: "Teklifler", icon: FileText },
  { id: "urunler", label: "Ürünler", icon: Package },
  { id: "ayarlar", label: "Ayarlar", icon: Settings },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("yeni");
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
        {tab === "yeni" && (
          <NewQuoteForm
            onSaved={(id) => setSelectedQuoteId(id)}
            goToProducts={() => setTab("urunler")}
          />
        )}
        {tab === "teklifler" && (
          <QuotesList
            onOpen={(id) => setSelectedQuoteId(id)}
            goToNew={() => setTab("yeni")}
          />
        )}
        {tab === "urunler" && <ProductsPanel />}
        {tab === "ayarlar" && <SettingsPanel />}
      </div>
    </main>
  );
}
