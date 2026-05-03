import { useState } from "react";
import type { Brief, Extraction } from "@/lib/campaign-types";
import { PLATFORMS } from "@/lib/campaign-types";
import { buildBlogPrompt, buildPlatformPrompt } from "@/lib/prompts";
import { CopyableOutput } from "@/components/CopyableOutput";
import { Download, Copy, Save } from "lucide-react";

export function Stage5({
  brief, extraction, selected, onBack, onSave, saving,
}: {
  brief: Brief; extraction: Extraction;
  selected: string[];
  onBack: (stage: number) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const tabs = [
    { key: "__blog", label: "Blog Article", prompt: buildBlogPrompt(brief) },
    ...selected.map((k) => {
      const p = PLATFORMS.find((x) => x.key === k)!;
      return { key: k, label: p.name, prompt: buildPlatformPrompt(k, brief.platformSubs[k] || p.subs[0], brief, extraction) };
    }),
  ];
  const [active, setActive] = useState(tabs[0].key);
  const cur = tabs.find((t) => t.key === active)!;
  const hasExtraction = extraction && Object.values(extraction).some((v) => (v || "").toString().length > 0);

  const downloadMd = () => {
    const blob = new Blob([cur.prompt], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${cur.label.toLowerCase().replace(/\s+/g, "-")}-prompt.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const copyAll = async () => {
    const all = tabs.map((t) => `# ${t.label}\n\n${t.prompt}`).join("\n\n---\n\n");
    await navigator.clipboard.writeText(all);
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="ce-stage-tag">Stage 5</span>
        <h1 className="font-display text-5xl mt-3">Platform <em className="italic text-[var(--accent)]">Prompts</em></h1>
        <p className="text-[var(--text-muted)] mt-2 max-w-3xl">
          Every prompt below is fully structured, extraction-fed, and governance-injected. Copy each and paste into any LLM.
        </p>
      </div>

      <div className={`text-[12px] font-mono-ui px-3 py-2 rounded-md border ${hasExtraction ? "border-[var(--accent-border)] bg-[var(--accent-bg)] text-[var(--accent)]" : "border-[rgba(240,200,96,0.3)] bg-[var(--gold-bg)] text-[var(--gold)]"}`}>
        {hasExtraction
          ? `✓ All prompts fed by real article content. Framework: "${extraction.framework_name || "—"}" · Case study: ${extraction.case_study_industry || "—"} → ${extraction.case_study_outcome || "—"}`
          : "⚠ Prompts using brief data only — paste your article in Stage 3 for extraction-fed prompts."}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-mono-ui text-[12px] transition ${
              active === t.key ? "bg-[var(--accent)] text-[#0d0d0d] font-bold" : "border border-[var(--border-hi)] text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <CopyableOutput label={`${cur.label} prompt`} text={cur.prompt} />

      <div className="flex flex-wrap gap-2">
        <button className="ce-btn-secondary" onClick={downloadMd}><Download size={14} /> Download .md</button>
        <button className="ce-btn-secondary" onClick={copyAll}><Copy size={14} /> Copy all</button>
        <button className="ce-btn-primary ml-auto" onClick={onSave} disabled={saving}>
          {saving ? <span className="ce-spinner" /> : <Save size={14} />} Save campaign
        </button>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button className="ce-btn-ghost" onClick={() => onBack(4)}>← Edit platforms</button>
        <button className="ce-btn-ghost" onClick={() => onBack(3)}>← Edit article</button>
        <button className="ce-btn-ghost" onClick={() => onBack(1)}>← Edit foundation</button>
      </div>
    </div>
  );
}
