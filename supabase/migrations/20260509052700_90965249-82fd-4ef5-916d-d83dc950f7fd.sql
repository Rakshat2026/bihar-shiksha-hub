-- Security fix: remove staff self-insert/update
DROP POLICY IF EXISTS "Staff insert own record" ON public.staff;
DROP POLICY IF EXISTS "Staff update own record" ON public.staff;

-- Add admin role (must be committed before being used)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';