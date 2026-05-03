import { useState } from "react";
import type { Brief } from "@/lib/campaign-types";
import { Sparkles } from "lucide-react";

const TONES = ["Authoritative", "Conversational", "Educational", "Data-driven", "Storytelling", "Contrarian"];
const FW = ["3-Pillar system", "Step-by-step", "Loop / cycle", "Matrix / scoring", "Before / after"];
const EXTRAS = [
  "3 headline options", "Meta description", "URL slug", "Checklist sign-off",
  "Social hooks (×5)", "Email subjects (×5)", "Pull quotes (×10)", "Alt text suggestions",
];

export function Stage1({
  brief, setBrief, onAutofill, onNext, autofilling,
}: {
  brief: Brief;
  setBrief: (b: Brief) => void;
  onAutofill: () => void;
  onNext: () => void;
  autofilling: boolean;
}) {
  const [filled, setFilled] = useState(false);
  const set = (k: keyof Brief, v: any) => setBrief({ ...brief, [k]: v });
  const toggleArr = (k: "extras", v: string) => {
    const cur = brief[k];
    set(k, cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
  };
  const handleAutofill = async () => {
    await onAutofill();
    setFilled(true);
    setTimeout(() => setFilled(false), 4000);
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="ce-stage-tag">Stage 1</span>
        <h1 className="font-display text-5xl mt-3">Blog <em className="italic text-[var(--accent)]">Foundation</em></h1>
        <p className="text-[var(--text-muted)] mt-2 max-w-2xl">
          Define the content brief. Enter your topic and use Auto-fill to populate fields, then review and adjust everything before proceeding.
        </p>
      </div>

      <div className="ce-card">
        <div className="ce-card-title">Start here</div>
        <label className="ce-label">Topic / article subject</label>
        <div className="flex gap-2">
          <input className="ce-input flex-1" placeholder="e.g. How to increase email open rates after iOS 15"
            value={brief.topic} onChange={(e) => set("topic", e.target.value)} />
          <button className="ce-btn-accent-outline whitespace-nowrap" disabled={!brief.topic || autofilling} onClick={handleAutofill}>
            {autofilling ? <span className="ce-spinner" /> : <Sparkles size={12} />} Auto-fill
          </button>
        </div>
        {autofilling && <div className="mt-3 text-[12px] font-mono-ui text-[var(--text-muted)] flex items-center gap-2"><span className="ce-spinner" /> Analyzing topic…</div>}
        {filled && !autofilling && <div className="mt-3 text-[12px] font-mono-ui text-[var(--accent)]">✓ Fields auto-filled — review and edit anything below.</div>}
      </div>

      <div className="ce-card">
        <div className="ce-card-title">Core content</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="ce-label">Target audience</label><input className="ce-input" placeholder="Who specifically is this for?" value={brief.audience} onChange={(e) => set("audience", e.target.value)} /></div>
          <div><label className="ce-label">Industry / niche</label><input className="ce-input" placeholder="e.g. B2B SaaS, ecommerce" value={brief.niche} onChange={(e) => set("niche", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="ce-label">Core problem being solved</label><input className="ce-input" value={brief.problem} onChange={(e) => set("problem", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="ce-label">Main solution / angle</label><input className="ce-input" placeholder="Your key insight, method, or framework name" value={brief.solution} onChange={(e) => set("solution", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="ce-label">Compelling hook statistic</label><input className="ce-input" value={brief.stat} onChange={(e) => set("stat", e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="ce-label">Authority signal</label><input className="ce-input" placeholder="e.g. Based on analysis of 500+ campaigns" value={brief.authority} onChange={(e) => set("authority", e.target.value)} /></div>
        </div>
      </div>

      <div className="ce-card">
        <div className="ce-card-title">Article structure</div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="ce-label">Word count target</label>
            <select className="ce-input" value={brief.wordcount} onChange={(e) => set("wordcount", e.target.value)}>
              <option>800–1,200</option><option>1,500–2,000</option><option>2,500–3,500</option><option>4,000+</option>
            </select>
          </div>
          <div>
            <label className="ce-label">Format</label>
            <select className="ce-input" value={brief.format} onChange={(e) => set("format", e.target.value)}>
              <option>how-to guide</option><option>listicle</option><option>case study breakdown</option>
              <option>opinion / thought leadership</option><option>data analysis</option><option>ultimate guide</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="ce-label">Tone</label>
          <div className="flex flex-wrap gap-2">{TONES.map((t) => (
            <button key={t} className={`ce-chip ${brief.tone === t ? "on" : ""}`} onClick={() => set("tone", t)}>{t}</button>
          ))}</div>
        </div>
        <div>
          <label className="ce-label">Named framework style</label>
          <div className="flex flex-wrap gap-2">{FW.map((t) => (
            <button key={t} className={`ce-chip ${brief.fwstyle === t ? "on" : ""}`} onClick={() => set("fwstyle", t)}>{t}</button>
          ))}</div>
        </div>
      </div>

      <div className="ce-card">
        <div className="ce-card-title">SEO parameters</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="ce-label">Primary keyword</label><input className="ce-input" value={brief.kw1} onChange={(e) => set("kw1", e.target.value)} /></div>
          <div><label className="ce-label">Secondary keywords (2–3)</label><input className="ce-input" value={brief.kw2} onChange={(e) => set("kw2", e.target.value)} /></div>
          <div><label className="ce-label">URL slug</label><input className="ce-input" value={brief.slug} onChange={(e) => set("slug", e.target.value)} /></div>
          <div><label className="ce-label">Meta description (150–160)</label><input className="ce-input" value={brief.meta} onChange={(e) => set("meta", e.target.value)} /></div>
        </div>
      </div>

      <div className="ce-card">
        <div className="ce-card-title">Visual placements</div>
        <div className="space-y-3">
          {[
            ["img1", "Section 1 — Problem image"],
            ["img2", "Section 2 — Framework diagram"],
            ["img3", "Section 3 — Pillars infographic"],
            ["img4", "Section 4 — Action screenshot"],
            ["img6", "Section 6 — Result visual"],
          ].map(([k, l]) => (
            <div key={k}><label className="ce-label">{l}</label>
              <input className="ce-input" value={(brief as any)[k]} onChange={(e) => set(k as any, e.target.value)} /></div>
          ))}
        </div>
      </div>

      <div className="ce-card">
        <div className="ce-card-title">Extras to generate</div>
        <div className="flex flex-wrap gap-2">
          {EXTRAS.map((e) => (
            <button key={e} className={`ce-chip ${brief.extras.includes(e) ? "on" : ""}`} onClick={() => toggleArr("extras", e)}>{e}</button>
          ))}
        </div>
      </div>

      <div className="ce-card">
        <div className="ce-card-title">Additional context</div>
        <textarea className="ce-input" rows={4}
          placeholder="Brand voice guidelines, things to avoid, existing article to improve, competitor angles, internal data…"
          value={brief.context} onChange={(e) => set("context", e.target.value)} />
      </div>

      <div className="flex justify-end pt-2">
        <button className="ce-btn-primary" onClick={onNext} disabled={!brief.topic}>Generate Blog Prompt →</button>
      </div>
    </div>
  );
}
