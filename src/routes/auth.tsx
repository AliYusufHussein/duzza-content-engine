import { useState } from "react";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) {
    navigate({ to: "/" });
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (e: any) {
      setErr(e.message || "Something went wrong");
    } finally { setBusy(false); }
  };

  const google = async () => {
    setErr("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setErr(error.message);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex flex-1 items-center justify-center bg-[var(--surface)] border-r border-[var(--border)] p-12">
        <div className="max-w-md">
          <div className="text-3xl mb-6">
            <span className="font-sans">Content </span>
            <em className="font-display italic text-[var(--accent)]">Pipeline</em>
          </div>
          <h2 className="font-display text-5xl leading-tight mb-4">
            One brief. One article. <em className="italic text-[var(--accent)]">Every platform.</em>
          </h2>
          <p className="text-[var(--text-muted)] text-sm">
            Transform a single content brief into a complete multi-platform content ecosystem — in one session.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="ce-card w-full max-w-sm">
          <div className="ce-card-title">{mode === "signup" ? "Create account" : "Sign in"}</div>
          <form onSubmit={submit} className="space-y-3">
            <div><label className="ce-label">Email</label>
              <input type="email" required className="ce-input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><label className="ce-label">Password</label>
              <input type="password" required minLength={6} className="ce-input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            {err && <div className="text-[12px] font-mono-ui text-[var(--warn)]">{err}</div>}
            <button className="ce-btn-primary w-full" disabled={busy}>
              {busy && <span className="ce-spinner" />} {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>
          <div className="my-4 flex items-center gap-2 text-[10px] font-mono-ui text-[var(--text-faint)]">
            <div className="flex-1 h-px bg-[var(--border)]" /> OR <div className="flex-1 h-px bg-[var(--border)]" />
          </div>
          <button onClick={google} className="ce-btn-secondary w-full">Continue with Google</button>
          <button className="mt-4 w-full text-center text-[12px] font-mono-ui text-[var(--text-muted)] hover:text-[var(--accent)]"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
            {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
}
