ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS article TEXT;

CREATE TABLE IF NOT EXISTS public.polisher_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  title TEXT,
  article TEXT,
  extraction JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.polisher_inbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "polisher_inbox_all" ON public.polisher_inbox
  FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER polisher_inbox_touch_updated_at
  BEFORE UPDATE ON public.polisher_inbox
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();