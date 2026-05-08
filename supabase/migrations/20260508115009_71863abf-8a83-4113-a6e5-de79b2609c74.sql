
ALTER TABLE public.enquiries
  ADD CONSTRAINT enquiries_role_check
  CHECK (role IN ('student', 'parent'));

REVOKE EXECUTE ON FUNCTION public.cleanup_expired_otps() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
