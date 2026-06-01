import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const polisherUrl = Deno.env.get("POLISHER_SUPABASE_URL");
    const polisherKey = Deno.env.get("POLISHER_SUPABASE_SERVICE_KEY");

    if (!polisherUrl || !polisherKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Polisher project credentials not configured. Set POLISHER_SUPABASE_URL and POLISHER_SUPABASE_SERVICE_KEY.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { campaign_id, article, extraction, title, status } = await req.json();

    // LOCAL CLIENT — update this project's campaigns table.
    const localUrl = Deno.env.get("SUPABASE_URL")!;
    const localKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const local = createClient(localUrl, localKey);

    if (campaign_id) {
      await local.from("campaigns").update({ status: "done" }).eq("id", campaign_id);
    }

    // POLISHER CLIENT — insert into the Polisher project's inbox.
    const polisher = createClient(polisherUrl, polisherKey);

    const { data, error } = await polisher
      .from("polisher_inbox")
      .insert({
        campaign_id,
        title,
        article,
        extraction: extraction ?? {},
        status: status ?? "ready_for_polishing",
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    return new Response(
      JSON.stringify({ success: true, inbox_id: data?.id ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
