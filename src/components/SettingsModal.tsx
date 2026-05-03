import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { testGeminiKey } from "@/lib/gemini";
import { X, Eye, EyeOff } from "lucide-react";

export function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [key, setKey] = useState("");
  const [model, setModel] = useState("gemini-2.0-flash");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<null | "ok" | "bad">(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    supabase.from("profiles").select("gemini_api_key, preferred_model").eq("id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) { setKey(data.gemini_api_key || ""); setModel(data.preferred_model || "gemini-2.0-flash"); }
      });
  }, [open, user]);

  if (!open) return null;

  const test = async () => {
    setBusy(true); setStatus(null);
    const ok = await testGeminiKey(key, model);
    setStatus(ok ? "ok" : "bad");
    setBusy(false);
  };

  const save = async () => {
    if (!user) return;
    setBusy(true);
    await supabase.from("profiles").upsert({ id: user.id, gemini_api_key: key, preferred_model: model });
    setBusy(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="ce-card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">Settings</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]"><X size={18} /></button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="ce-label">Gemini API Key</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={key}
                onChange={(e) => { setKey(e.target.value); setStatus(null); }}
                placeholder="AIza..."
                className="ce-input pr-10"
              />
              <button onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] p-1">
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="mt-2 text-[11px] font-mono-ui text-[var(--text-muted)]">
              Your key is stored securely in your account. Get a free key at <a className="text-[var(--accent)]" href="https://aistudio.google.com" target="_blank" rel="noreferrer">aistudio.google.com</a>
            </p>
          </div>

          <div>
            <label className="ce-label">Model</label>
            <select className="ce-input" value={model} onChange={(e) => setModel(e.target.value)}>
              <option value="gemini-2.0-flash">gemini-2.0-flash (Fast, recommended)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash (Balanced)</option>
              <option value="gemini-2.5-pro">gemini-2.5-pro (Higher quality)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button className="ce-btn-secondary" disabled={busy || !key} onClick={test}>
              {busy ? <span className="ce-spinner" /> : null} Test connection
            </button>
            {status === "ok" && <span className="text-[11px] font-mono-ui text-[var(--accent)]">✓ Connected</span>}
            {status === "bad" && <span className="text-[11px] font-mono-ui text-[var(--warn)]">✗ Invalid key</span>}
          </div>

          <button onClick={save} disabled={busy} className="ce-btn-primary w-full">Save</button>
        </div>
      </div>
    </div>
  );
}

export async function getApiKey(userId: string): Promise<{ key: string; model: string } | null> {
  const { data } = await supabase.from("profiles").select("gemini_api_key, preferred_model").eq("id", userId).maybeSingle();
  if (!data?.gemini_api_key) return null;
  return { key: data.gemini_api_key, model: data.preferred_model || "gemini-2.0-flash" };
}
