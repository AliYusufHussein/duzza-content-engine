import type { Extraction } from "@/lib/campaign-types";

export function Stage3({
  article, setArticle, onExtract, extracting, extraction, onBack, onNext,
}: {
  article: string; setArticle: (s: string) => void;
  onExtract: () => void; extracting: boolean;
  extraction: Extraction | null;
  onBack: () => void; onNext: () => void;
}) {
  const labels: Record<string, string> = {
    headline: "Headline", hook: "Hook", tldr: "TL;DR",
    framework_name: "Framework", framework_analogy: "Analogy",
    pillar_1: "Pillar 1", pillar_2: "Pillar 2", pillar_3: "Pillar 3",
    action_step_1: "Action 1", action_step_2: "Action 2", action_step_3: "Action 3",
    case_study_industry: "Case industry", case_study_outcome: "Case outcome",
    faq_1: "FAQ 1", faq_2: "FAQ 2", cta: "CTA",
    primary_keyword: "Primary keyword", authority_signal: "Authority", hook_stat: "Hook stat",
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="ce-stage-tag">Stage 3</span>
        <h1 className="font-display text-5xl mt-3">Article <em className="italic text-[var(--accent)]">Extraction</em></h1>
        <p className="text-[var(--text-muted)] mt-2 max-w-3xl">
          Paste your finished article below. The extraction engine will read it and pull out every element needed to power the platform prompts.
        </p>
      </div>

      <div className="ce-card">
        <div className="ce-card-title">Paste your article</div>
        <textarea
          className="ce-input min-h-[300px] font-mono-ui text-[13px]"
          placeholder="Paste full article. Will extract: Headline · Hook · TL;DR · Framework + analogy · 3 pillars · Action steps · Case study · FAQs · CTA · Statistics."
          value={article}
          onChange={(e) => setArticle(e.target.value)}
        />
        {extracting && <div className="mt-3 text-[12px] font-mono-ui text-[var(--text-muted)] flex items-center gap-2"><span className="ce-spinner" /> Extracting key elements from your article…</div>}
      </div>

      {extraction && Object.keys(extraction).length > 0 && (
        <div className="ce-card">
          <div className="ce-card-title">Extracted elements</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(extraction).filter(([k]) => labels[k]).map(([k, v]) => (
              <div key={k} className="border border-[var(--border)] rounded-md p-3 bg-[var(--surface)]">
                <div className="text-[10px] font-mono-ui uppercase tracking-wider text-[var(--text-faint)] mb-1">{labels[k]}</div>
                <div className="text-[13px] text-[var(--text)] line-clamp-3">{v || <span className="text-[var(--text-faint)]">—</span>}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button className="ce-btn-ghost" onClick={onBack}>← Back to prompt</button>
        <div className="flex gap-2">
          <button className="ce-btn-secondary" onClick={onExtract} disabled={!article.trim() || extracting}>
            {extracting ? <span className="ce-spinner" /> : null} Extract → Build Platform Prompts
          </button>
          {extraction && Object.keys(extraction).length > 0 && (
            <button className="ce-btn-primary" onClick={onNext}>Continue →</button>
          )}
        </div>
      </div>
    </div>
  );
}
