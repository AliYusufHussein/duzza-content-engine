import { Check } from "lucide-react";

const stages = [
  { n: 1, label: "Foundation" },
  { n: 2, label: "Blog Prompt" },
  { n: 3, label: "Extraction" },
  { n: 4, label: "Platforms" },
  { n: 5, label: "Outputs" },
];

export function ProgressRail({ current, onJump }: { current: number; onJump?: (n: number) => void }) {
  return (
    <div className="sticky top-[57px] z-30 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center gap-2">
        {stages.map((s, i) => {
          const done = s.n < current;
          const active = s.n === current;
          return (
            <div key={s.n} className="flex items-center gap-2 flex-1 last:flex-none">
              <button
                onClick={() => onJump?.(s.n)}
                className={`flex items-center gap-2 group ${onJump ? "cursor-pointer" : "cursor-default"}`}
              >
                <span
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-mono-ui transition ${
                    active
                      ? "bg-[var(--accent)] text-[#0d0d0d] font-bold"
                      : done
                      ? "bg-[var(--border-hi)] text-[var(--text)]"
                      : "border border-[var(--border-hi)] text-[var(--text-faint)]"
                  }`}
                >
                  {done ? <Check size={14} /> : s.n}
                </span>
                <span className={`text-[11px] font-mono-ui uppercase tracking-wider ${active ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} hidden sm:inline`}>
                  {s.label}
                </span>
              </button>
              {i < stages.length - 1 && <div className="flex-1 h-px bg-[var(--border)]" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
