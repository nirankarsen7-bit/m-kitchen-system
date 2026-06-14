CREATE TABLE public.mk_shared_state (
  id text PRIMARY KEY DEFAULT 'main',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT mk_shared_state_singleton CHECK (id = 'main')
);

GRANT SELECT, INSERT, UPDATE ON public.mk_shared_state TO anon;
GRANT SELECT, INSERT, UPDATE ON public.mk_shared_state TO authenticated;
GRANT ALL ON public.mk_shared_state TO service_role;

ALTER TABLE public.mk_shared_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read restaurant shared state"
ON public.mk_shared_state
FOR SELECT
TO anon, authenticated
USING (id = 'main');

CREATE POLICY "Anyone can create restaurant shared state"
ON public.mk_shared_state
FOR INSERT
TO anon, authenticated
WITH CHECK (id = 'main');

CREATE POLICY "Anyone can update restaurant shared state"
ON public.mk_shared_state
FOR UPDATE
TO anon, authenticated
USING (id = 'main')
WITH CHECK (id = 'main');

CREATE OR REPLACE FUNCTION public.update_mk_shared_state_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_mk_shared_state_updated_at
BEFORE UPDATE ON public.mk_shared_state
FOR EACH ROW
EXECUTE FUNCTION public.update_mk_shared_state_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.mk_shared_state;