## Goal

Update the `send-to-polisher` edge function so that `polisher_inbox` rows are inserted into the **duzza-blog** Supabase project (cross-project), while the campaign status update continues to happen in **this** project.

## Changes

### 1. `supabase/functions/send-to-polisher/index.ts`

Use **two** Supabase clients:

- **Local client** (this project) — uses existing `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`. Only used to update `campaigns.status = 'done'`.
- **Polisher client** (duzza-blog project) — uses new `POLISHER_SUPABASE_URL` + `POLISHER_SUPABASE_SERVICE_KEY`. Used to insert into `polisher_inbox`.

Add a guard: if either polisher env var is missing, return a clear 500 error explaining the secrets aren't configured yet (so the user gets a useful message until they paste the duzza-blog credentials in).

Everything else (CORS, request shape, response shape `{ success, inbox_id }`, status default `ready_for_polishing`) stays identical.

### 2. Request secrets

After the code change, prompt the user to add the two new secrets:
- `POLISHER_SUPABASE_URL`
- `POLISHER_SUPABASE_SERVICE_KEY`

(Done via `add_secret` once we're in build mode, after the user confirms they have the duzza-blog values.)

### 3. No changes to

- `supabase/config.toml` — `verify_jwt = false` stays as-is
- This project's `polisher_inbox` table — left in place; just no longer written to by this function (can be cleaned up later if desired)
- Stage 3 UI / `sendToPolisher` invocation logic — unchanged
- `campaigns` table schema — unchanged

## Technical sketch

```ts
const localUrl = Deno.env.get("SUPABASE_URL")!;
const localKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const polisherUrl = Deno.env.get("POLISHER_SUPABASE_URL");
const polisherKey = Deno.env.get("POLISHER_SUPABASE_SERVICE_KEY");

if (!polisherUrl || !polisherKey) {
  return new Response(JSON.stringify({
    success: false,
    error: "Polisher project credentials not configured. Set POLISHER_SUPABASE_URL and POLISHER_SUPABASE_SERVICE_KEY.",
  }), { status: 500, headers: {...corsHeaders, "Content-Type": "application/json"} });
}

const local = createClient(localUrl, localKey);
const polisher = createClient(polisherUrl, polisherKey);

if (campaign_id) {
  await local.from("campaigns").update({ status: "done" }).eq("id", campaign_id);
}

const { data, error } = await polisher
  .from("polisher_inbox")
  .insert({ campaign_id, title, article, extraction: extraction ?? {}, status: status ?? "ready_for_polishing" })
  .select("id")
  .single();
```

## After approval

1. Apply the edit to `supabase/functions/send-to-polisher/index.ts` (auto-deploys).
2. Ask you to confirm when you have the duzza-blog URL + service role key, then add them via the secrets tool.
3. Quick test via curl once secrets are in place.