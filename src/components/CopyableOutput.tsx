import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyableOutput({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-mono-ui uppercase tracking-wider text-[var(--text-muted)]">{label}</span>
        <button onClick={copy} className="ce-btn-accent-outline">
          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy prompt</>}
        </button>
      </div>
      <pre className="ce-output">{text}</pre>
    </div>
  );
}
