-- Lock down polisher_inbox: the app now POSTs to an external webhook instead of writing here.
-- Replace the permissive ALL policy with owner-scoped policies via campaigns join.
DROP POLICY IF EXISTS polisher_inbox_all ON public.polisher_inbox;

CREATE POLICY polisher_inbox_select_own
ON public.polisher_inbox
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = polisher_inbox.campaign_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY polisher_inbox_insert_own
ON public.polisher_inbox
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = polisher_inbox.campaign_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY polisher_inbox_update_own
ON public.polisher_inbox
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = polisher_inbox.campaign_id
      AND c.user_id = auth.uid()
  )
);

CREATE POLICY polisher_inbox_delete_own
ON public.polisher_inbox
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = polisher_inbox.campaign_id
      AND c.user_id = auth.uid()
  )
);
