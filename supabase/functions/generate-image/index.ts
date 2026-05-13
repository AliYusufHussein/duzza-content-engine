import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, user_id, campaign_id, slot, model } = await req.json();
    if (!prompt) throw new Error("Missing prompt");
    if (!user_id) throw new Error("Missing user_id");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const useModel = model || "google/gemini-3.1-flash-image-preview";

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: useModel,
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      if (aiRes.status === 429) throw new Error("Rate limit — try again shortly");
      if (aiRes.status === 402) throw new Error("Lovable AI credits exhausted — top up in workspace settings");
      throw new Error(`AI error ${aiRes.status}: ${t.slice(0, 200)}`);
    }

    const data = await aiRes.json();
    const dataUrl: string | undefined = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!dataUrl || !dataUrl.startsWith("data:image/")) throw new Error("No image returned");

    // Decode base64
    const [meta, b64] = dataUrl.split(",");
    const mime = (meta.match(/data:(image\/[a-zA-Z]+)/)?.[1]) || "image/png";
    const ext = mime.split("/")[1] || "png";
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

    // Upload to storage with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const path = `${user_id}/${campaign_id || "loose"}/${slot || "image"}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("campaign-media")
      .upload(path, bin, { contentType: mime, upsert: false });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from("campaign-media").getPublicUrl(path);

    return new Response(
      JSON.stringify({ success: true, url: pub.publicUrl, path, prompt, slot }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e instanceof Error ? e.message : e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
