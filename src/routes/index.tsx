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
  const [sent, setSent] = useState(false);
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

  const stripMetadata = (raw: string): string => {
    const patterns = [
      /word count:/i, /checklist sign-off/i, /headline options/i, /meta description:/i,
      /url slug:/i, /social hooks/i, /completion report/i, /cta confirmed/i, /message angle/i,
    ];
    return raw
      .split("\n")
      .filter((line) => !patterns.some((p) => p.test(line)))
      .join("\n");
  };

  const onExtract = async () => {
    const cred = await ensureKey();
    if (!cred) return;
    setExtracting(true);
    try {
      const cleaned = stripMetadata(article);
      const j = await callGeminiJSON(cred.key, cred.model, buildExtractionPrompt(cleaned, brief.fwstyle), 2500);
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
    setMedia(Array.isArray((data as any).media) ? (data as any).media : []);
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
      media: media as any,
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

  const startNewCampaign = () => {
    setStage(1);
    setBrief(defaultBrief());
    setArticle("");
    setExtraction({});
    setMedia([]);
    setCampaignId(undefined);
    setSent(false);
    setSaveStatus("idle");
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

  const buildFrameworkElements = (fw: string, e: any) => {
    const get = (k: string) => (typeof e?.[k] === "string" ? e[k] : "") || "";
    switch (fw) {
      case "Step-by-step": {
        const steps = [1, 2, 3, 4, 5].map((i) => ({
          title: get(`step_${i}_title`),
          description: get(`step_${i}_desc`),
          mistake: get(`step_${i}_mistake`),
        })).filter((s) => s.title || s.description);
        return { steps, tools_section: get("tools_section") };
      }
      case "Loop / cycle": {
        const phases = [1, 2, 3, 4].map((i) => ({
          name: get(`phase_${i}_name`),
          output: get(`phase_${i}_output`),
        })).filter((p) => p.name || p.output);
        return { loop_name: get("loop_name"), trigger: get("trigger"), phases };
      }
      case "Matrix / scoring": {
        const criteria = [1, 2, 3, 4].map((i) => get(`criterion_${i}`)).filter(Boolean);
        return {
          matrix_name: get("matrix_name"),
          criteria,
          scoring_mechanism: get("scoring_mechanism"),
          result_tiers: get("result_tiers"),
        };
      }
      case "Before / after":
        return {
          before_state: get("before_state"),
          turning_point: get("turning_point"),
          after_state: get("after_state"),
          measurable_proof: get("measurable_proof"),
          replication_steps: get("replication_steps"),
        };
      case "3-Pillar system":
      default: {
        const pillars = [1, 2, 3].map((i) => ({
          name: get(`pillar_${i}`),
          action: get(`action_step_${i}`),
        })).filter((p) => p.name || p.action);
        return {
          pillars,
          case_study: { industry: get("case_study_industry"), outcome: get("case_study_outcome") },
          faqs: [get("faq_1"), get("faq_2")].filter(Boolean),
        };
      }
    }
  };

  const sendToPolisher = async () => {
    setSending(true);
    try {
      const id = await persistCampaign("done");
      const selectedMedia = media.filter((m) => m.selected).map((m) => ({ slot: m.slot, url: m.url, prompt: m.prompt }));
      const ex: any = extraction || {};
      const get = (k: string) => (typeof ex[k] === "string" ? ex[k] : "") || "";
      const firstMediaUrl = selectedMedia[0]?.url || null;
      const { error } = await supabase.functions.invoke("send-to-polisher", {
        body: {
          campaign_id: id,
          article,
          extraction,
          title: get("headline") || brief.topic || "Untitled",
          status: "ready_for_polishing",
          media: selectedMedia,
          // New enriched fields
          channel: brief.channel || "",
          tone_profile: brief.toneProfile || null,
          content_goal: brief.content_goal || "",
          framework: brief.fwstyle,
          hook: get("hook"),
          framework_name: get("framework_name") || brief.fwstyle,
          elements: buildFrameworkElements(brief.fwstyle, ex),
          cta: get("cta"),
          keyword: get("primary_keyword") || brief.kw1,
          hook_stat: get("hook_stat") || brief.stat,
          content: article,
          image_url: firstMediaUrl,
        },
      });
      if (error) throw error;
      setSent(true);
      toast.success(`Sent to Polisher ✓${selectedMedia.length ? ` (with ${selectedMedia.length} media)` : ""}`);
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
      <ProgressRail current={stage} onJump={(n) => {
        if (n <= stage) return setStage(n);
        if (n === 2 && brief.topic) return setStage(2);
        if (n === 3 && brief.topic) return setStage(3);
        if (n === 4 && Object.keys(extraction).length > 0) return setStage(4);
      }} />

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
            onGenerateMedia={() => setStage(4)}
            saving={saving} sending={sending}
            sent={sent}
            onNewCampaign={startNewCampaign}
          />
        )}
        {stage === 4 && (
          <Stage4
            extraction={extraction}
            userId={user.id}
            campaignId={campaignId}
            media={media}
            setMedia={setMedia}
            onBack={() => setStage(3)}
            onSave={saveCampaign}
            onSendToPolisher={sendToPolisher}
            saving={saving} sending={sending}
            sent={sent}
            onNewCampaign={startNewCampaign}
          />
        )}
      </main>

      <SettingsModal open={showSettings} onClose={() => { setShowSettings(false); setNeedKey(false); }} />
      <CampaignLibrary open={showLibrary} onClose={() => setShowLibrary(false)} onLoad={loadCampaign} currentId={campaignId} />
    </div>
  );
}
