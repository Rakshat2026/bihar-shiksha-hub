-- Tighten enquiries anon insert: bind user_id to caller (NULL for anon)
DROP POLICY IF EXISTS "Anyone can submit enquiry" ON public.enquiries;
CREATE POLICY "Anyone can submit enquiry"
  ON public.enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 200
    AND char_length(mobile_number) BETWEEN 7 AND 20
    AND class_applied IS NOT NULL
    AND (
      (auth.uid() IS NULL AND user_id IS NULL)
      OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
    )
  );

-- Add a simple DB-level rate limit on complaints to deter spam floods
CREATE OR REPLACE FUNCTION public.complaints_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT count(*) INTO recent_count
  FROM public.complaints
  WHERE created_at > now() - interval '1 minute';
  IF recent_count >= 20 THEN
    RAISE EXCEPTION 'Too many complaints submitted right now. Please try again shortly.'
      USING ERRCODE = '54000';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.complaints_rate_limit() FROM anon, authenticated, PUBLIC;

DROP TRIGGER IF EXISTS trg_complaints_rate_limit ON public.complaints;
CREATE TRIGGER trg_complaints_rate_limit
  BEFORE INSERT ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.complaints_rate_limit();