import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { campaign_id, article, extraction, title, media } = await req.json();

    // Local project client — used only to update this project's campaigns table.
    const localUrl = Deno.env.get("SUPABASE_URL")!;
    const localKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const local = createClient(localUrl, localKey);

    if (campaign_id) {
      await local.from("campaigns").update({ status: "done" }).eq("id", campaign_id);
    }

    const res = await fetch(
      "https://hckpfuipklzyzhkmicuz.supabase.co/functions/v1/receive-from-generator",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: "duzza_polisher_secret_2026",
          campaign_id,
          title,
          article,
          extraction,
          media: Array.isArray(media) ? media : [],
        }),
      },
    );

    const text = await res.text();
    let parsed: any = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }

    if (!res.ok || (parsed && parsed.error)) {
      const message = (parsed && (parsed.error || parsed.message)) || text || `HTTP ${res.status}`;
      throw new Error(message);
    }

    return new Response(
      JSON.stringify({ success: true, inbox_id: parsed?.inbox_id ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
