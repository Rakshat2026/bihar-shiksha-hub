
DROP POLICY IF EXISTS "Staff insert own record" ON public.staff;
CREATE POLICY "Staff insert own record" ON public.staff
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND sub_role = 'teacher');

DROP POLICY IF EXISTS "Staff update own record" ON public.staff;
CREATE POLICY "Staff update own record" ON public.staff
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND sub_role = 'teacher');

DROP POLICY IF EXISTS "Parent creates own link" ON public.parent_links;
