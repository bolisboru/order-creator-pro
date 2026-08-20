import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();
  useEffect(() => {
    // Redirect to auth page after a brief moment
    const timer = setTimeout(() => navigate("/", { replace: true }), 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Yönlendiriliyor…</p>
      </div>
    </div>
  );
}
