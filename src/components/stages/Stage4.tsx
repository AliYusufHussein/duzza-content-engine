import type { Brief } from "@/lib/campaign-types";
import { PLATFORMS } from "@/lib/campaign-types";
import { Check } from "lucide-react";

const CTA_OPTS = ["Link to blog", "Email signup", "Engage prompt", "DM for resource", "Follow for more"];

export function Stage4({
  brief, setBrief, selected, setSelected, onBack, onNext,
}: {
  brief: Brief; setBrief: (b: Brief) => void;
  selected: string[]; setSelected: (s: string[]) => void;
  onBack: () => void; onNext: () => void;
}) {
  const toggle = (k: string) => setSelected(selected.includes(k) ? selected.filter((x) => x !== k) : [...selected, k]);
  const setSub = (key: string, sub: string) => setBrief({ ...brief, platformSubs: { ...brief.platformSubs, [key]: sub } });
  const set = (k: keyof Brief, v: any) => setBrief({ ...brief, [k]: v });
  const toggleCta = (v: string) => {
    const arr = brief.cta_chips.includes(v) ? brief.cta_chips.filter((x) => x !== v) : [...brief.cta_chips, v];
    set("cta_chips", arr);
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="ce-stage-tag">Stage 4</span>
        <h1 className="font-display text-5xl mt-3">Platform <em className="italic text-[var(--accent)]">Framework</em></h1>
        <p className="text-[var(--text-muted)] mt-2 max-w-3xl">
          Select which platforms to repurpose to and configure your distribution strategy.
        </p>
      </div>

      <div className="ce-card">
        <div className="ce-card-title">Select platforms</div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
          {PLATFORMS.map((p) => {
            const on = selected.includes(p.key);
            return (
              <div key={p.key}
                className={`relative rounded-md p-3 cursor-pointer transition border ${on ? "border-[var(--accent)] bg-[var(--accent-bg)]" : "border-[var(--border-hi)] bg-[var(--surface)] hover:border-[var(--text-muted)]"}`}
                onClick={() => toggle(p.key)}
              >
                <div className={`absolute top-2 right-2 h-4 w-4 rounded border flex items-center justify-center ${on ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--border-hi)]"}`}>
                  {on && <Check size={10} color="#0d0d0d" />}
                </div>
                <div className="font-medium text-sm pr-6">{p.name}</div>
                <div className="text-[11px] font-mono-ui text-[var(--text-muted)] mt-1">{p.desc}</div>
                {on && (
                  <div className="mt-3 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {p.subs.map((s) => (
                      <button key={s} className={`ce-chip !py-1 !px-2 !text-[10px] ${brief.platformSubs[p.key] === s ? "on" : ""}`} onClick={() => setSub(p.key, s)}>{s}</button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ce-card">
        <div className="ce-card-title">Distribution strategy</div>
        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="ce-label">Content sequencing</label>
            <select className="ce-input" value={brief.sequencing} onChange={(e) => set("sequencing", e.target.value)}>
              <option>Blog first → social follow-up</option>
              <option>Social tease → blog reveal</option>
              <option>Simultaneous launch</option>
            </select>
          </div>
          <div>
            <label className="ce-label">Primary goal</label>
            <select className="ce-input" value={brief.goal} onChange={(e) => set("goal", e.target.value)}>
              <option>Drive blog traffic</option><option>Build email list</option>
              <option>Platform engagement</option><option>Generate leads</option><option>Brand authority</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="ce-label">Tone across platforms</label>
          <div className="flex gap-2">
            {["Consistent tone", "Adapt per platform"].map((t) => (
              <button key={t} className={`ce-chip ${brief.toneAcross === t ? "on" : ""}`} onClick={() => set("toneAcross", t)}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="ce-label">CTA across all platforms</label>
          <div className="flex flex-wrap gap-2">
            {CTA_OPTS.map((c) => (
              <button key={c} className={`ce-chip ${brief.cta_chips.includes(c) ? "on" : ""}`} onClick={() => toggleCta(c)}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button className="ce-btn-ghost" onClick={onBack}>← Back</button>
        <button className="ce-btn-primary" onClick={onNext} disabled={selected.length === 0}>Generate All Platform Prompts →</button>
      </div>
    </div>
  );
}
