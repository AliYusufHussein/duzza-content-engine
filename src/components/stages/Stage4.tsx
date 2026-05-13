import { useEffect, useState } from "react";
import { Image as ImageIcon, RefreshCw, Save, Send, Trash2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Extraction } from "@/lib/campaign-types";
import { toast } from "sonner";

export type MediaItem = {
  slot: string;
  prompt: string;
  url: string;
  path?: string;
  selected?: boolean;
};

const SLOT_DEFS: { slot: string; label: string; build: (e: Extraction) => string }[] = [
  {
    slot: "hero",
    label: "Hero image",
    build: (e) =>
      `Hero image for an article titled "${e.headline || "Untitled"}". Concept: ${e.hook || e.tldr || ""}. Style: cinematic editorial photograph, soft natural light, shallow depth of field, modern, premium magazine quality. 16:9 composition.`,
  },
  {
    slot: "social",
    label: "Social card",
    build: (e) =>
      `Square social media share image. Topic: ${e.headline || ""}. Visual metaphor: ${e.framework_analogy || e.framework_name || ""}. Style: bold minimalist graphic design, strong focal subject, vibrant but tasteful colors, no text overlays. 1:1 composition.`,
  },
  {
    slot: "framework",
    label: "Framework illustration",
    build: (e) =>
      `Conceptual illustration representing the framework "${e.framework_name || ""}" — analogy: ${e.framework_analogy || ""}. Style: modern flat illustration, abstract geometric, brand-friendly palette, clean negative space.`,
  },
  {
    slot: "case_study",
    label: "Case study visual",
    build: (e) =>
      `Documentary-style photograph illustrating a case study in the ${e.case_study_industry || "business"} industry, outcome: ${e.case_study_outcome || ""}. Style: realistic photography, natural environment, human-centered, authentic.`,
  },
];

function defaultPrompts(extraction: Extraction) {
  return SLOT_DEFS.map((d) => ({ slot: d.slot, label: d.label, prompt: d.build(extraction) }));
}

export function Stage4({
  extraction,
  userId,
  campaignId,
  media,
  setMedia,
  onBack,
  onSave,
  onSendToPolisher,
  saving,
  sending,
}: {
  extraction: Extraction;
  userId: string;
  campaignId?: string;
  media: MediaItem[];
  setMedia: (m: MediaItem[]) => void;
  onBack: () => void;
  onSave: () => void;
  onSendToPolisher: () => void;
  saving: boolean;
  sending: boolean;
}) {
  const [prompts, setPrompts] = useState(() => defaultPrompts(extraction));
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPrompts(defaultPrompts(extraction));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extraction.headline, extraction.framework_name, extraction.case_study_industry]);

  const generate = async (slot: string, prompt: string) => {
    setBusy((b) => ({ ...b, [slot]: true }));
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt, user_id: userId, campaign_id: campaignId, slot },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Generation failed");
      const item: MediaItem = { slot, prompt, url: data.url, path: data.path, selected: true };
      // Append (allow multiple per slot)
      setMedia([...media, item]);
      toast.success(`${slot} image generated ✓`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate");
    } finally {
      setBusy((b) => ({ ...b, [slot]: false }));
    }
  };

  const toggleSelected = (idx: number) => {
    const next = media.map((m, i) => (i === idx ? { ...m, selected: !m.selected } : m));
    setMedia(next);
  };

  const remove = (idx: number) => {
    setMedia(media.filter((_, i) => i !== idx));
  };

  const selectedCount = media.filter((m) => m.selected).length;

  return (
    <div className="space-y-6">
      <div>
        <span className="ce-stage-tag">Stage 4 · Optional</span>
        <h1 className="font-display text-5xl mt-3">Media <em className="italic text-[var(--accent)]">Studio</em></h1>
        <p className="text-[var(--text-muted)] mt-2 max-w-3xl">
          Generate images for your campaign using the extracted content. Edit any prompt, regenerate as many times as you want, then pick which assets to send to Polisher.
        </p>
      </div>

      <div className="grid gap-4">
        {prompts.map((p) => (
          <div key={p.slot} className="ce-card">
            <div className="flex items-center justify-between mb-2">
              <div className="ce-card-title flex items-center gap-2"><ImageIcon size={14} /> {p.label}</div>
              <button
                className="ce-btn-secondary"
                onClick={() => generate(p.slot, p.prompt)}
                disabled={busy[p.slot] || !p.prompt.trim()}
              >
                {busy[p.slot] ? <span className="ce-spinner" /> : <RefreshCw size={14} />} Generate
              </button>
            </div>
            <textarea
              className="ce-input min-h-[80px] font-mono-ui text-[12px]"
              value={p.prompt}
              onChange={(e) =>
                setPrompts(prompts.map((x) => (x.slot === p.slot ? { ...x, prompt: e.target.value } : x)))
              }
            />
          </div>
        ))}
      </div>

      {media.length > 0 && (
        <div className="ce-card">
          <div className="ce-card-title mb-3">Generated media ({selectedCount} selected for Polisher)</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {media.map((m, i) => (
              <div
                key={`${m.path || m.url}-${i}`}
                className={`relative border rounded-md overflow-hidden bg-[var(--surface)] ${m.selected ? "border-[var(--accent)]" : "border-[var(--border)]"}`}
              >
                <img src={m.url} alt={m.slot} className="w-full aspect-square object-cover" />
                <div className="p-2 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-mono-ui uppercase tracking-wider text-[var(--text-faint)] truncate">{m.slot}</div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleSelected(i)}
                      className={`h-6 w-6 rounded flex items-center justify-center ${m.selected ? "bg-[var(--accent)] text-[#0d0d0d]" : "border border-[var(--border-hi)] text-[var(--text-muted)]"}`}
                      title={m.selected ? "Selected" : "Select for Polisher"}
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={() => remove(i)}
                      className="h-6 w-6 rounded border border-[var(--border-hi)] text-[var(--text-muted)] flex items-center justify-center"
                      title="Remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-between pt-2">
        <button className="ce-btn-ghost" onClick={onBack}>← Back to extraction</button>
        <div className="flex gap-2">
          <button className="ce-btn-secondary" onClick={onSave} disabled={saving || sending}>
            {saving ? <span className="ce-spinner" /> : <Save size={14} />} Save campaign
          </button>
          <button className="ce-btn-primary" onClick={onSendToPolisher} disabled={saving || sending}>
            {sending ? <span className="ce-spinner" /> : <Send size={14} />} Send to Polisher{selectedCount > 0 ? ` (+${selectedCount} media)` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
