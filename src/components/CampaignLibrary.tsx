import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { X, Trash2, Upload } from "lucide-react";

type Row = {
  id: string; title: string; status: string; platforms_selected: string[];
  updated_at: string;
};

export function CampaignLibrary({
  open, onClose, onLoad, currentId,
}: {
  open: boolean; onClose: () => void;
  onLoad: (id: string) => void;
  currentId?: string;
}) {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    supabase.from("campaigns").select("id,title,status,platforms_selected,updated_at")
      .eq("user_id", user.id).order("updated_at", { ascending: false })
      .then(({ data }) => { setRows(data || []); setLoading(false); });
  }, [open, user]);

  if (!open) return null;

  const del = async (id: string) => {
    await supabase.from("campaigns").delete().eq("id", id);
    setRows((r) => r.filter((x) => x.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 overflow-y-auto" onClick={onClose}>
      <div className="ce-card w-full max-w-2xl mt-12" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl">My campaigns</h2>
          <button onClick={onClose} className="text-[var(--text-muted)]"><X size={18} /></button>
        </div>

        {loading ? <div className="text-[var(--text-muted)] text-sm flex items-center gap-2"><span className="ce-spinner" /> Loading…</div>
          : rows.length === 0 ? (
            <div className="text-center py-10 text-[var(--text-muted)] text-sm font-mono-ui">
              No campaigns yet. Start your first content brief above.
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {rows.map((r) => (
                <div key={r.id} className="border border-[var(--border)] rounded-md p-3 flex items-center justify-between hover:border-[var(--border-hi)] transition">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{r.title || "Untitled"}</span>
                      {r.id === currentId && <span className="ce-pill-beta !bg-[var(--accent-bg)] !text-[var(--accent)]">CURRENT</span>}
                      <span className={`text-[10px] font-mono-ui px-1.5 py-0.5 rounded ${r.status === "complete" ? "bg-[var(--accent-bg)] text-[var(--accent)]" : "bg-[var(--surface)] text-[var(--text-muted)]"}`}>
                        {r.status}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono-ui text-[var(--text-muted)] mt-1">
                      {r.platforms_selected.join(" · ") || "No platforms yet"} · {new Date(r.updated_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button onClick={() => { onLoad(r.id); onClose(); }} className="ce-btn-accent-outline" title="Load"><Upload size={12} /> Load</button>
                    <button onClick={() => del(r.id)} className="ce-btn-ghost !p-2" title="Delete"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
