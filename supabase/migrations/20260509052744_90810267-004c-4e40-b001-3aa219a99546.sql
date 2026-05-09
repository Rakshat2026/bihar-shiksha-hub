-- Helper: is_admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'::public.app_role
  ) OR EXISTS (
    SELECT 1 FROM public.staff WHERE user_id = _user_id AND sub_role = 'head'
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;

-- Extend enquiries
ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS parent_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS previous_school text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
ALTER TABLE public.enquiries ALTER COLUMN user_id DROP NOT NULL;

DROP POLICY IF EXISTS "Authenticated users can submit enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Users can view own enquiries" ON public.enquiries;

CREATE POLICY "Anyone can submit enquiry"
ON public.enquiries FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(name) BETWEEN 1 AND 200
  AND char_length(mobile_number) BETWEEN 7 AND 20
  AND class_applied IS NOT NULL
);
CREATE POLICY "Admin reads enquiries" ON public.enquiries FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin updates enquiries" ON public.enquiries FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()));

-- fees
CREATE TABLE IF NOT EXISTS public.fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  term text NOT NULL,
  amount numeric NOT NULL,
  paid boolean NOT NULL DEFAULT false,
  due_date date,
  paid_on date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages fees" ON public.fees FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Student views own fees" ON public.fees FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = fees.student_id AND s.user_id = auth.uid()));
CREATE POLICY "Parent views child fees" ON public.fees FOR SELECT TO authenticated
USING (public.is_parent_of(auth.uid(), student_id));
CREATE POLICY "Lead staff views fees" ON public.fees FOR SELECT TO authenticated
USING (public.is_staff_lead(auth.uid()));
CREATE TRIGGER fees_set_updated_at BEFORE UPDATE ON public.fees
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- timetable_slots
CREATE TABLE IF NOT EXISTS public.timetable_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class text NOT NULL,
  section text NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  period smallint NOT NULL,
  subject text NOT NULL,
  teacher_id uuid,
  start_time time,
  end_time time,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages timetable" ON public.timetable_slots FOR ALL TO authenticated
USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Student views own class timetable" ON public.timetable_slots FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.students s WHERE s.user_id = auth.uid() AND s.class = timetable_slots.class AND s.section = timetable_slots.section));
CREATE POLICY "Parent views child timetable" ON public.timetable_slots FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.parent_links pl JOIN public.students s ON s.id = pl.student_id
  WHERE pl.parent_user_id = auth.uid() AND s.class = timetable_slots.class AND s.section = timetable_slots.section));
CREATE POLICY "Staff views assigned timetable" ON public.timetable_slots FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.staff st WHERE st.user_id = auth.uid() AND st.assigned_class = timetable_slots.class AND st.assigned_section = timetable_slots.section));

-- teacher_remarks
CREATE TABLE IF NOT EXISTS public.teacher_remarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  term text NOT NULL,
  remark text NOT NULL,
  by_staff uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.teacher_remarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff writes remarks" ON public.teacher_remarks FOR INSERT TO authenticated
WITH CHECK (public.staff_handles_student(auth.uid(), student_id) OR public.is_staff_lead(auth.uid()));
CREATE POLICY "Staff views remarks" ON public.teacher_remarks FOR SELECT TO authenticated
USING (public.staff_handles_student(auth.uid(), student_id) OR public.is_staff_lead(auth.uid()));
CREATE POLICY "Student views own remarks" ON public.teacher_remarks FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = teacher_remarks.student_id AND s.user_id = auth.uid()));
CREATE POLICY "Parent views child remarks" ON public.teacher_remarks FOR SELECT TO authenticated
USING (public.is_parent_of(auth.uid(), student_id));