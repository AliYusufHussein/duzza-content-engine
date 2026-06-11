import type { Extraction } from "@/lib/campaign-types";
import { Save, Send, Sparkles, Plus, Download } from "lucide-react";

const ALL_LABELS: Record<string, string> = {
  // shared
  headline: "Headline", hook: "Hook", tldr: "TL;DR", cta: "CTA", primary_keyword: "Primary keyword", hook_stat: "Hook stat",
  // 3-pillar
  framework_name: "Framework", framework_analogy: "Analogy",
  pillar_1: "Pillar 1", pillar_2: "Pillar 2", pillar_3: "Pillar 3",
  action_step_1: "Action 1", action_step_2: "Action 2", action_step_3: "Action 3",
  case_study_industry: "Case industry", case_study_outcome: "Case outcome",
  faq_1: "FAQ 1", faq_2: "FAQ 2", authority_signal: "Authority",
  // step-by-step
  step_1_title: "Step 1 title", step_1_desc: "Step 1 detail", step_1_mistake: "Step 1 mistake",
  step_2_title: "Step 2 title", step_2_desc: "Step 2 detail", step_2_mistake: "Step 2 mistake",
  step_3_title: "Step 3 title", step_3_desc: "Step 3 detail", step_3_mistake: "Step 3 mistake",
  step_4_title: "Step 4 title", step_4_desc: "Step 4 detail", step_4_mistake: "Step 4 mistake",
  step_5_title: "Step 5 title", step_5_desc: "Step 5 detail", step_5_mistake: "Step 5 mistake",
  tools_section: "Tools & Resources",
  // loop
  loop_name: "Loop name", trigger: "Trigger",
  phase_1_name: "Phase 1", phase_1_output: "Phase 1 output",
  phase_2_name: "Phase 2", phase_2_output: "Phase 2 output",
  phase_3_name: "Phase 3", phase_3_output: "Phase 3 output",
  phase_4_name: "Phase 4", phase_4_output: "Phase 4 output",
  // matrix
  matrix_name: "Matrix name",
  criterion_1: "Criterion 1", criterion_2: "Criterion 2", criterion_3: "Criterion 3", criterion_4: "Criterion 4",
  scoring_mechanism: "Scoring mechanism", result_tiers: "Result tiers",
  // before/after
  before_state: "Before state", turning_point: "Turning point",
  after_state: "After state", measurable_proof: "Measurable proof", replication_steps: "Replication steps",
};

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
  const hasExtraction = extraction && Object.keys(extraction).length > 0;

  const handleDownload = () => {
    if (!extraction) return;
    const lines = Object.entries(extraction)
      .filter(([k]) => ALL_LABELS[k])
      .map(([k, v]) => `${ALL_LABELS[k]}: ${typeof v === "string" ? v : JSON.stringify(v)}`);
    const blob = new Blob([lines.join("\n\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extraction.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          placeholder="Paste full article. Metadata lines (Word count, Checklist sign-off, Headline Options, Meta Description, URL Slug, Social Hooks, Completion Report, CTA confirmed, Message angle) will be stripped automatically."
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
          <div className="flex items-center justify-between mb-3">
            <div className="ce-card-title">Extracted elements</div>
            <button className="ce-btn-accent-outline" onClick={handleDownload}>
              <Download size={12} /> Download
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(extraction!).filter(([k]) => ALL_LABELS[k]).map(([k, v]) => (
              <div key={k} className="border border-[var(--border)] rounded-md p-3 bg-[var(--surface)]">
                <div className="text-[10px] font-mono-ui uppercase tracking-wider text-[var(--text-faint)] mb-1">{ALL_LABELS[k]}</div>
                <div className="text-[13px] text-[var(--text)] line-clamp-3">{(typeof v === "string" ? v : JSON.stringify(v)) || <span className="text-[var(--text-faint)]">—</span>}</div>
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
