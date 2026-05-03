import { useAuth } from "@/lib/auth";
import { Settings, LogOut, FolderOpen } from "lucide-react";

export function Header({
  saveStatus,
  onOpenSettings,
  onOpenLibrary,
}: {
  saveStatus?: "idle" | "saving" | "saved";
  onOpenSettings: () => void;
  onOpenLibrary: () => void;
}) {
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">
            <span className="font-sans font-medium">Content </span>
            <em className="font-display italic text-[var(--accent)]">Pipeline</em>
          </span>
          <span className="ce-pill-beta">BETA</span>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="text-[11px] font-mono-ui text-[var(--text-muted)] flex items-center gap-1.5">
              <span className="ce-spinner" /> Saving…
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-[11px] font-mono-ui text-[var(--text-muted)]">Saved ✓</span>
          )}
          <button onClick={onOpenLibrary} className="ce-btn-ghost !py-1.5 !px-3" title="My campaigns">
            <FolderOpen size={14} /> <span className="hidden sm:inline">Campaigns</span>
          </button>
          <button onClick={onOpenSettings} className="ce-btn-ghost !py-1.5 !px-2" title="Settings">
            <Settings size={14} />
          </button>
          <span className="text-[11px] font-mono-ui text-[var(--text-muted)] hidden md:inline max-w-[180px] truncate">
            {user?.email}
          </span>
          <button onClick={signOut} className="ce-btn-ghost !py-1.5 !px-2" title="Sign out">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
