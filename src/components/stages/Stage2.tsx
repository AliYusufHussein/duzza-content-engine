import { CopyableOutput } from "@/components/CopyableOutput";

export function Stage2({ prompt, onBack, onNext }: { prompt: string; onBack: () => void; onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <span className="ce-stage-tag">Stage 2</span>
        <h1 className="font-display text-5xl mt-3">Blog <em className="italic text-[var(--accent)]">Prompt</em></h1>
        <p className="text-[var(--text-muted)] mt-2 max-w-3xl">
          Your complete, governance-injected blog article prompt. Copy it and paste into Claude, ChatGPT, Gemini, or any LLM to generate the article. Then return here with the finished article.
        </p>
      </div>
      <CopyableOutput label="Blog article prompt" text={prompt} />
      <div className="flex justify-between pt-2">
        <button className="ce-btn-ghost" onClick={onBack}>← Edit foundation</button>
        <button className="ce-btn-primary" onClick={onNext}>I have my article → Paste it here</button>
      </div>
    </div>
  );
}
