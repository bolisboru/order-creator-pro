import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2 } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signIn("password", {
        username: username.trim(),
        password,
        flow: mode,
      });
      navigate(redirect);
    } catch (err) {
      console.error("Password sign-in error:", err);
      setError(
        mode === "signIn"
          ? "Kullanıcı adı veya şifre hatalı."
          : "Kayıt oluşturulamadı. Kullanıcı adı daha önce alınmış olabilir.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      {/* ── Left panel: dark branding ── */}
      <div className="relative hidden w-[55%] flex-col justify-end overflow-hidden bg-slate-900 lg:flex">
        {/* Background image / gradient overlay */}
        <div className="absolute inset-0">
          {/* Industrial factory dark image via CSS gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #0a1628 0%, #0f2035 25%, #12253f 40%, #0e1d33 55%, #091422 75%, #060e19 100%)",
            }}
          />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          {/* Warm industrial light streaks */}
          <div className="absolute inset-0 opacity-[0.07]">
            <div
              className="absolute top-0 h-full w-full"
              style={{
                background:
                  "radial-gradient(ellipse 60% 40% at 30% 20%, rgba(180,140,80,0.4), transparent), radial-gradient(ellipse 40% 50% at 70% 60%, rgba(100,130,160,0.3), transparent)",
              }}
            />
          </div>
          {/* Factory silhouette elements */}
          <svg
            className="absolute bottom-0 left-0 w-full opacity-[0.06]"
            viewBox="0 0 1200 400"
            fill="none"
            preserveAspectRatio="xMidYMax slice"
          >
            <rect x="50" y="120" width="80" height="280" fill="white" />
            <rect x="150" y="80" width="60" height="320" fill="white" />
            <rect x="230" y="160" width="100" height="240" fill="white" />
            <rect x="350" y="60" width="40" height="340" fill="white" />
            <rect x="420" y="140" width="120" height="260" fill="white" />
            <rect x="560" y="100" width="50" height="300" fill="white" />
            <rect x="630" y="180" width="90" height="220" fill="white" />
            <rect x="750" y="70" width="45" height="330" fill="white" />
            <rect x="820" y="130" width="110" height="270" fill="white" />
            <rect x="950" y="90" width="55" height="310" fill="white" />
            <rect x="1030" y="150" width="80" height="250" fill="white" />
            <rect x="1130" y="110" width="40" height="290" fill="white" />
          </svg>
          {/* Dark gradient from bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-12 pb-16 pt-32">
          {/* Blue accent line */}
          <div className="mb-8 h-1 w-12 rounded-full bg-blue-500" />

          <h1 className="text-4xl font-black leading-tight tracking-tight text-white xl:text-5xl">
            ÜRETİM SİPARİŞ
            <br />
            <span className="text-white/90">&amp; TEKLİF SİSTEMİ</span>
          </h1>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-slate-400">
            Müşteri, ürün ve fiyat bilgilerini girin; iskonto, sistem ve barkod
            etiket seçeneklerini işaretleyin, saniyeler içinde PDF veya JPEG
            teklif oluşturun.
          </p>
        </div>
      </div>

      {/* ── Right panel: login form ── */}
      <div className="relative flex w-full flex-col items-center justify-center bg-white px-6 lg:w-[45%]">
        {/* Subtle dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #1e293b 0.8px, transparent 0.8px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 w-full max-w-sm">
          {/* Logo + title */}
          <div className="mb-10 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-600/25">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
                <path d="M9 9v1" />
                <path d="M9 13v1" />
                <path d="M9 17v1" />
              </svg>
            </div>
            <span className="text-lg font-bold uppercase tracking-wide text-slate-800">
              SİPARİŞ PANELİ
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Kullanıcı adı */}
            <div className="space-y-1.5">
              <Label
                htmlFor="username"
                className="text-[11px] font-semibold uppercase tracking-widest text-slate-400"
              >
                Kullanıcı Adı
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınız"
                className="h-11 border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                autoComplete="username"
                disabled={isLoading}
                required
              />
            </div>

            {/* Şifre */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-[11px] font-semibold uppercase tracking-widest text-slate-400"
              >
                Şifre
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "signUp" ? "En az 8 karakter" : "••••••••"
                }
                className="h-11 border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                autoComplete={
                  mode === "signIn" ? "current-password" : "new-password"
                }
                disabled={isLoading}
                required
                minLength={mode === "signUp" ? 8 : 1}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm font-medium text-red-500">{error}</p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="h-11 w-full bg-blue-600 text-sm font-semibold tracking-wide uppercase shadow-lg shadow-blue-600/25 hover:bg-blue-700"
              disabled={isLoading || !username.trim() || !password}
            >
              {isLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 size-4" />
              )}
              {mode === "signIn" ? "Giriş Yap" : "Hesap Oluştur"}
            </Button>
          </form>

          {/* Mode toggle */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signIn" ? "signUp" : "signIn");
                setError(null);
              }}
              className="text-sm text-slate-500 transition-colors hover:text-blue-600"
            >
              {mode === "signIn" ? (
                <>
                  Hesabınız yok mu?{" "}
                  <span className="font-semibold text-blue-600">
                    Kayıt Olun
                  </span>
                </>
              ) : (
                <>
                  Zaten hesabınız var mı?{" "}
                  <span className="font-semibold text-blue-600">
                    Giriş Yapın
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="mt-10 text-center text-[11px] text-slate-400">
            Tek kullanıcılı üretim sipariş & teklif yönetimi
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
