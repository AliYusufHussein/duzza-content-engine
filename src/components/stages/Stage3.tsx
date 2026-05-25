import type { Extraction } from "@/lib/campaign-types";
import { Save, Send, Sparkles, Plus, Download } from "lucide-react";

export function Stage3({
  article, setArticle, onExtract, extracting, extraction,
  onBack, onSave, onSendToPolisher, onGenerateMedia, saving, sending, sent, onNewCampaign,
}: {
  article: string; setArticle: (s: string) => void;
  onExtract: () => void; extracting: boolean;
  extraction: Extraction | null;
  onBack: () => void;
  onSave: () => void;
  onSendToPolisher: () => void;
  onGenerateMedia: () => void;
  saving: boolean;
  sending: boolean;
  sent: boolean;
  onNewCampaign: () => void;
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

  const hasExtraction = extraction && Object.keys(extraction).length > 0;

  return (
    <div className="space-y-6">
      <div>
        <span className="ce-stage-tag">Stage 3</span>
        <h1 className="font-display text-5xl mt-3">Article <em className="italic text-[var(--accent)]">Extraction</em></h1>
        <p className="text-[var(--text-muted)] mt-2 max-w-3xl">
          Paste your finished article below. The extraction engine will pull out every element — then save the campaign or send it straight to the Polisher.
        </p>
      </div>

      {sent && (
        <div className="ce-card border-[var(--accent)]">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[13px] font-semibold text-[var(--accent)]">Sent to Polisher ✓</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Your campaign has been delivered. Start fresh whenever you are ready.</div>
            </div>
            <button className="ce-btn-primary" onClick={onNewCampaign}>
              <Plus size={14} /> New campaign
            </button>
          </div>
        </div>
      )}

      <div className="ce-card">
        <div className="ce-card-title">Paste your article</div>
        <textarea
          className="ce-input min-h-[300px] font-mono-ui text-[13px]"
          placeholder="Paste full article. Will extract: Headline · Hook · TL;DR · Framework + analogy · 3 pillars · Action steps · Case study · FAQs · CTA · Statistics."
          value={article}
          onChange={(e) => setArticle(e.target.value)}
        />
        {extracting && <div className="mt-3 text-[12px] font-mono-ui text-[var(--text-muted)] flex items-center gap-2"><span className="ce-spinner" /> Extracting key elements from your article…</div>}
        <div className="mt-3">
          <button className="ce-btn-secondary" onClick={onExtract} disabled={!article.trim() || extracting}>
            {extracting ? <span className="ce-spinner" /> : null} Extract key elements
          </button>
        </div>
      </div>

      {hasExtraction && (
        <div className="ce-card">
          <div className="ce-card-title">Extracted elements</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(extraction!).filter(([k]) => labels[k]).map(([k, v]) => (
              <div key={k} className="border border-[var(--border)] rounded-md p-3 bg-[var(--surface)]">
                <div className="text-[10px] font-mono-ui uppercase tracking-wider text-[var(--text-faint)] mb-1">{labels[k]}</div>
                <div className="text-[13px] text-[var(--text)] line-clamp-3">{v || <span className="text-[var(--text-faint)]">—</span>}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-between pt-2">
        <button className="ce-btn-ghost" onClick={onBack}>← Back to prompt</button>
        <div className="flex flex-wrap gap-2">
          <button className="ce-btn-secondary" onClick={onSave} disabled={saving || sending}>
            {saving ? <span className="ce-spinner" /> : <Save size={14} />} Save campaign
          </button>
          <button
            className="ce-btn-secondary"
            onClick={onGenerateMedia}
            disabled={!hasExtraction || saving || sending}
            title={hasExtraction ? "Optional: generate images for this campaign" : "Run extraction first"}
          >
            <Sparkles size={14} /> Generate media
          </button>
          <button className="ce-btn-primary" onClick={onSendToPolisher} disabled={!article.trim() || saving || sending}>
            {sending ? <span className="ce-spinner" /> : <Send size={14} />} Send to Polisher
          </button>
        </div>
      </div>
    </div>
  );
}
