import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/AppHeader";
import { ProgressRail } from "@/components/ProgressRail";
import { Stage1 } from "@/components/stages/Stage1";
import { Stage2 } from "@/components/stages/Stage2";
import { Stage3 } from "@/components/stages/Stage3";
import { Stage4, type MediaItem } from "@/components/stages/Stage4";
import { SettingsModal, getApiKey } from "@/components/SettingsModal";
import { CampaignLibrary } from "@/components/CampaignLibrary";
import { defaultBrief, type Brief, type Extraction } from "@/lib/campaign-types";
import { buildBlogPrompt, buildExtractionPrompt } from "@/lib/prompts";
import { callGeminiJSON } from "@/lib/gemini";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ContentEngine Pro — One brief, every platform" },
      { name: "description", content: "Transform a single content brief into a complete multi-platform content ecosystem." },
    ],
  }),
  component: AppPage,
});

function AppPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [stage, setStage] = useState(1);
  const [brief, setBrief] = useState<Brief>(defaultBrief());
  const [article, setArticle] = useState("");
  const [extraction, setExtraction] = useState<Extraction>({});
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [campaignId, setCampaignId] = useState<string | undefined>(undefined);
  const [autofilling, setAutofilling] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showSettings, setShowSettings] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [needKey, setNeedKey] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRun = useRef(true);
  useEffect(() => {
    if (!user) return;
    if (firstRun.current) { firstRun.current = false; return; }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async () => {
      const payload = {
        user_id: user.id,
        title: brief.topic || "Untitled",
        brief: brief as any,
        article_paste: article,
        article: article,
        extraction: extraction as any,
        outputs: {} as any,
        platforms_selected: [],
        media: media as any,
        status: "draft",
      };
      if (campaignId) {
        await supabase.from("campaigns").update(payload).eq("id", campaignId);
      } else {
        const { data } = await supabase.from("campaigns").insert(payload).select("id").single();
        if (data) setCampaignId(data.id);
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1500);
    }, 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brief, article, extraction, media]);

  const ensureKey = async (): Promise<{ key: string; model: string } | null> => {
    if (!user) return null;
    const r = await getApiKey(user.id);
    if (!r) { setNeedKey(true); setShowSettings(true); return null; }
    return r;
  };

  const onAutofill = async () => {
    const cred = await ensureKey();
    if (!cred) return;
    setAutofilling(true);
    try {
      const prompt = `You are a content strategy assistant. Given this topic: "${brief.topic}"

Return ONLY a JSON object (no markdown, no preamble) with these exact keys:
{"audience":"","niche":"","problem":"","solution":"","stat":"","authority":"","kw1":"","kw2":"","slug":"","meta":"","format":"how-to guide","tone":"Authoritative","img1":"","img2":"","img3":"","img4":"","img6":""}`;
      const j = await callGeminiJSON(cred.key, cred.model, prompt, 1200);
      setBrief({ ...brief, ...j });
    } catch (e: any) { alert(e.message); }
    finally { setAutofilling(false); }
  };

  const onExtract = async () => {
    const cred = await ensureKey();
    if (!cred) return;
    setExtracting(true);
    try {
      const j = await callGeminiJSON(cred.key, cred.model, buildExtractionPrompt(article), 2500);
      setExtraction(j);
    } catch (e: any) { alert(e.message); }
    finally { setExtracting(false); }
  };

  const loadCampaign = async (id: string) => {
    const { data } = await supabase.from("campaigns").select("*").eq("id", id).single();
    if (!data) return;
    setCampaignId(data.id);
    setBrief({ ...defaultBrief(), ...(data.brief as any) });
    setArticle((data as any).article || data.article_paste || "");
    setExtraction((data.extraction as any) || {});
    setStage(data.article_paste ? 3 : 1);
  };

  const persistCampaign = async (status: "done" | "draft" = "done") => {
    if (!user) return null;
    const payload = {
      user_id: user.id,
      title: brief.topic || "Untitled",
      brief: brief as any,
      article_paste: article,
      article: article,
      extraction: extraction as any,
      outputs: {} as any,
      platforms_selected: [],
      status,
    };
    if (campaignId) {
      await supabase.from("campaigns").update(payload).eq("id", campaignId);
      return campaignId;
    }
    const { data } = await supabase.from("campaigns").insert(payload).select("id").single();
    if (data) setCampaignId(data.id);
    return data?.id ?? null;
  };

  const saveCampaign = async () => {
    setSaving(true);
    try {
      await persistCampaign("done");
      toast.success("Campaign saved ✓");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1800);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const sendToPolisher = async () => {
    setSending(true);
    try {
      const id = await persistCampaign("done");
      const { error } = await supabase.functions.invoke("send-to-polisher", {
        body: {
          campaign_id: id,
          article,
          extraction,
          title: brief.topic || "Untitled",
          status: "ready_for_polishing",
        },
      });
      if (error) throw error;
      toast.success("Sent to Polisher ✓");
    } catch (e: any) {
      toast.error(e.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--text-muted)] font-mono-ui text-sm"><span className="ce-spinner mr-2" /> Loading…</div>;
  }

  return (
    <div className="min-h-screen">
      <Header
        saveStatus={saveStatus}
        onOpenSettings={() => setShowSettings(true)}
        onOpenLibrary={() => setShowLibrary(true)}
      />
      <ProgressRail current={stage} onJump={(n) => { if (n <= stage || (n === 2 && brief.topic) || (n === 3 && brief.topic)) setStage(n); }} />

      <main className="mx-auto max-w-4xl px-6 py-10">
        {needKey && (
          <div className="mb-6 border border-[var(--accent-border)] bg-[var(--accent-bg)] rounded-md p-3 text-[12px] font-mono-ui text-[var(--accent)]">
            Add your Gemini API key in Settings to use Auto-fill and Extraction.
          </div>
        )}

        {stage === 1 && (
          <Stage1 brief={brief} setBrief={setBrief} onAutofill={onAutofill} onNext={() => setStage(2)} autofilling={autofilling} />
        )}
        {stage === 2 && (
          <Stage2 prompt={buildBlogPrompt(brief)} onBack={() => setStage(1)} onNext={() => setStage(3)} />
        )}
        {stage === 3 && (
          <Stage3
            article={article} setArticle={setArticle}
            onExtract={onExtract} extracting={extracting} extraction={extraction}
            onBack={() => setStage(2)}
            onSave={saveCampaign}
            onSendToPolisher={sendToPolisher}
            saving={saving} sending={sending}
          />
        )}
      </main>

      <SettingsModal open={showSettings} onClose={() => { setShowSettings(false); setNeedKey(false); }} />
      <CampaignLibrary open={showLibrary} onClose={() => setShowLibrary(false)} onLoad={loadCampaign} currentId={campaignId} />
    </div>
  );
}
