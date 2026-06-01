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

    // LOCAL CLIENT — update this project's campaigns table.
    const localUrl = Deno.env.get("SUPABASE_URL")!;
    const localKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const local = createClient(localUrl, localKey);

    if (campaign_id) {
      await local.from("campaigns").update({ status: "done" }).eq("id", campaign_id);
    }

    const fetchPromise = fetch(
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

    // Fire and forget — don't await, return immediately
    if (typeof (globalThis as any).EdgeRuntime !== "undefined") {
      (globalThis as any).EdgeRuntime.waitUntil(fetchPromise);
    }

    return new Response(
      JSON.stringify({ success: true, inbox_id: null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
