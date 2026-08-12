import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Lock, UserRound } from "lucide-react";
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

function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ${className ?? ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
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
  );
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* soft background accents */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mx-auto mb-8 flex items-center gap-3 text-left"
          >
            <BrandMark className="size-10" />
            <span className="text-lg font-semibold tracking-tight text-foreground">
              FabrikaTeklif
            </span>
          </button>

          <Card className="border-border/70 shadow-xl shadow-slate-900/5">
            <CardHeader className="text-center">
              <CardTitle className="text-xl tracking-tight">
                {mode === "signIn" ? "Tekrar hoş geldiniz" : "Hesap oluşturun"}
              </CardTitle>
              <CardDescription className="text-sm">
                {mode === "signIn"
                  ? "Kullanıcı adınız ve şifrenizle giriş yapın"
                  : "İlk girişinizde kullanıcı adı ve şifrenizi belirleyin"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* mode toggle */}
              <div className="mb-6 grid grid-cols-2 rounded-lg bg-muted p-1 text-sm font-medium">
                {(["signIn", "signUp"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setError(null);
                    }}
                    className={`rounded-md px-3 py-1.5 transition-all ${
                      mode === m
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "signIn" ? "Giriş Yap" : "Kayıt Ol"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Kullanıcı adı</Label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ör. fabrika2026"
                      className="pl-9"
                      autoComplete="username"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Şifre</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "signUp" ? "En az 8 karakter" : "••••••••"}
                      className="pl-9"
                      autoComplete={
                        mode === "signIn" ? "current-password" : "new-password"
                      }
                      disabled={isLoading}
                      required
                      minLength={mode === "signUp" ? 8 : 1}
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading || !username.trim() || !password}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {mode === "signIn" ? "Giriş yapılıyor..." : "Hesap oluşturuluyor..."}
                    </>
                  ) : (
                    <>
                      {mode === "signIn" ? "Giriş Yap" : "Hesap Oluştur"}
                      <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
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
