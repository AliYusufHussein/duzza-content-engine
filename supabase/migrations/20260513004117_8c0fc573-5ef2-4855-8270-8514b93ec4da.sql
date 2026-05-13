
-- Add media column to campaigns
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS media JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Create public bucket for generated campaign media
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-media', 'campaign-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for campaign-media
CREATE POLICY "campaign_media_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-media');

-- Authenticated users can upload to their own folder (user_id prefix)
CREATE POLICY "campaign_media_user_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'campaign-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "campaign_media_user_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'campaign-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "campaign_media_user_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'campaign-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Service role inserts (for edge function uploads) — service role bypasses RLS so no extra policy needed.
