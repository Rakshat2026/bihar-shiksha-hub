
-- =========================================================================
-- ENUMS
-- =========================================================================
CREATE TYPE public.app_role AS ENUM ('student', 'parent', 'staff');
CREATE TYPE public.staff_sub_role AS ENUM ('teacher', 'hod', 'head');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late');
CREATE TYPE public.notice_audience AS ENUM ('public', 'staff');

-- =========================================================================
-- USER ROLES (separate table to avoid privilege escalation)
-- =========================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- =========================================================================
-- STAFF
-- =========================================================================
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  sub_role public.staff_sub_role NOT NULL DEFAULT 'teacher',
  assigned_class TEXT,
  assigned_section TEXT,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_staff_lead(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff
    WHERE user_id = _user_id AND sub_role IN ('head','hod')
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_staff_lead(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff_lead(UUID) TO authenticated;

CREATE POLICY "Staff view own record" ON public.staff
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Lead staff view all" ON public.staff
  FOR SELECT TO authenticated USING (public.is_staff_lead(auth.uid()));
CREATE POLICY "Staff insert own record" ON public.staff
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff update own record" ON public.staff
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Lead staff manage all" ON public.staff
  FOR ALL TO authenticated USING (public.is_staff_lead(auth.uid()))
  WITH CHECK (public.is_staff_lead(auth.uid()));

-- =========================================================================
-- STUDENTS
-- =========================================================================
CREATE SEQUENCE public.student_uid_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_student_uid()
RETURNS TEXT
LANGUAGE SQL VOLATILE SECURITY DEFINER SET search_path = public
AS $$
  SELECT 'GGA-' || EXTRACT(YEAR FROM now())::TEXT || '-' ||
         LPAD(nextval('public.student_uid_seq')::TEXT, 5, '0');
$$;
REVOKE EXECUTE ON FUNCTION public.generate_student_uid() FROM PUBLIC;

CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  student_uid TEXT NOT NULL UNIQUE DEFAULT public.generate_student_uid(),
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'A',
  roll_no TEXT,
  dob DATE,
  mobile_number TEXT,
  parent_mobile TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.staff_handles_student(_user_id UUID, _student_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff s
    JOIN public.students st ON st.class = s.assigned_class
                            AND st.section = s.assigned_section
    WHERE s.user_id = _user_id AND st.id = _student_id
  );
$$;
REVOKE EXECUTE ON FUNCTION public.staff_handles_student(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.staff_handles_student(UUID, UUID) TO authenticated;

CREATE POLICY "Student views self" ON public.students
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Lead staff view all students" ON public.students
  FOR SELECT TO authenticated USING (public.is_staff_lead(auth.uid()));
CREATE POLICY "Teacher views assigned students" ON public.students
  FOR SELECT TO authenticated USING (public.staff_handles_student(auth.uid(), id));
CREATE POLICY "Lead staff manage students" ON public.students
  FOR ALL TO authenticated USING (public.is_staff_lead(auth.uid()))
  WITH CHECK (public.is_staff_lead(auth.uid()));
CREATE POLICY "Teacher manages assigned students" ON public.students
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE user_id = auth.uid()
        AND assigned_class = students.class
        AND assigned_section = students.section
    )
  );
CREATE POLICY "Teacher updates assigned students" ON public.students
  FOR UPDATE TO authenticated USING (public.staff_handles_student(auth.uid(), id));

-- =========================================================================
-- PARENT LINKS
-- =========================================================================
CREATE TABLE public.parent_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  relation TEXT NOT NULL DEFAULT 'parent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (parent_user_id, student_id)
);
ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_parent_of(_user_id UUID, _student_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_links
    WHERE parent_user_id = _user_id AND student_id = _student_id
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_parent_of(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_parent_of(UUID, UUID) TO authenticated;

CREATE POLICY "Parent views own links" ON public.parent_links
  FOR SELECT TO authenticated USING (auth.uid() = parent_user_id);
CREATE POLICY "Parent creates own link" ON public.parent_links
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = parent_user_id);
CREATE POLICY "Parent removes own link" ON public.parent_links
  FOR DELETE TO authenticated USING (auth.uid() = parent_user_id);
CREATE POLICY "Lead staff manage links" ON public.parent_links
  FOR ALL TO authenticated USING (public.is_staff_lead(auth.uid()))
  WITH CHECK (public.is_staff_lead(auth.uid()));

-- Allow parents to read student rows they are linked to
CREATE POLICY "Parent views linked student" ON public.students
  FOR SELECT TO authenticated USING (public.is_parent_of(auth.uid(), id));

-- =========================================================================
-- ATTENDANCE
-- =========================================================================
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.attendance_status NOT NULL DEFAULT 'present',
  marked_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, date)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student views own attendance" ON public.attendance
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.students WHERE id = attendance.student_id AND user_id = auth.uid())
  );
CREATE POLICY "Parent views child attendance" ON public.attendance
  FOR SELECT TO authenticated USING (public.is_parent_of(auth.uid(), student_id));
CREATE POLICY "Staff views assigned attendance" ON public.attendance
  FOR SELECT TO authenticated USING (public.staff_handles_student(auth.uid(), student_id));
CREATE POLICY "Lead staff view all attendance" ON public.attendance
  FOR SELECT TO authenticated USING (public.is_staff_lead(auth.uid()));
CREATE POLICY "Staff marks attendance" ON public.attendance
  FOR INSERT TO authenticated WITH CHECK (
    public.staff_handles_student(auth.uid(), student_id) OR public.is_staff_lead(auth.uid())
  );
CREATE POLICY "Staff updates attendance" ON public.attendance
  FOR UPDATE TO authenticated USING (
    public.staff_handles_student(auth.uid(), student_id) OR public.is_staff_lead(auth.uid())
  );

-- =========================================================================
-- RESULTS
-- =========================================================================
CREATE TABLE public.results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  subject TEXT NOT NULL,
  marks NUMERIC(6,2) NOT NULL,
  max_marks NUMERIC(6,2) NOT NULL DEFAULT 100,
  grade TEXT,
  remarks TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, term, subject)
);
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student views own results" ON public.results
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.students WHERE id = results.student_id AND user_id = auth.uid())
  );
CREATE POLICY "Parent views child results" ON public.results
  FOR SELECT TO authenticated USING (public.is_parent_of(auth.uid(), student_id));
CREATE POLICY "Staff views assigned results" ON public.results
  FOR SELECT TO authenticated USING (public.staff_handles_student(auth.uid(), student_id));
CREATE POLICY "Lead staff view all results" ON public.results
  FOR SELECT TO authenticated USING (public.is_staff_lead(auth.uid()));
CREATE POLICY "Staff records results" ON public.results
  FOR INSERT TO authenticated WITH CHECK (
    public.staff_handles_student(auth.uid(), student_id) OR public.is_staff_lead(auth.uid())
  );
CREATE POLICY "Staff updates results" ON public.results
  FOR UPDATE TO authenticated USING (
    public.staff_handles_student(auth.uid(), student_id) OR public.is_staff_lead(auth.uid())
  );

-- =========================================================================
-- HOMEWORK
-- =========================================================================
CREATE TABLE public.homework (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class TEXT NOT NULL,
  section TEXT NOT NULL,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  posted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Student views own class homework" ON public.homework
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE user_id = auth.uid() AND class = homework.class AND section = homework.section
    )
  );
CREATE POLICY "Parent views linked child homework" ON public.homework
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.parent_links pl
      JOIN public.students st ON st.id = pl.student_id
      WHERE pl.parent_user_id = auth.uid()
        AND st.class = homework.class AND st.section = homework.section
    )
  );
CREATE POLICY "Staff views own class homework" ON public.homework
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE user_id = auth.uid()
        AND assigned_class = homework.class AND assigned_section = homework.section
    ) OR public.is_staff_lead(auth.uid())
  );
CREATE POLICY "Staff posts homework" ON public.homework
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE user_id = auth.uid()
        AND assigned_class = homework.class AND assigned_section = homework.section
    ) OR public.is_staff_lead(auth.uid())
  );
CREATE POLICY "Staff updates own homework" ON public.homework
  FOR UPDATE TO authenticated USING (
    posted_by = auth.uid() OR public.is_staff_lead(auth.uid())
  );
CREATE POLICY "Staff deletes own homework" ON public.homework
  FOR DELETE TO authenticated USING (
    posted_by = auth.uid() OR public.is_staff_lead(auth.uid())
  );

-- =========================================================================
-- COMPLAINTS (anonymous)
-- =========================================================================
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone submits complaint" ON public.complaints
  FOR INSERT TO anon, authenticated WITH CHECK (
    char_length(message) BETWEEN 1 AND 2000
    AND category IN ('academic','infrastructure','staff','transport','safety','other')
  );
CREATE POLICY "Lead staff read complaints" ON public.complaints
  FOR SELECT TO authenticated USING (public.is_staff_lead(auth.uid()));
CREATE POLICY "Lead staff update complaints" ON public.complaints
  FOR UPDATE TO authenticated USING (public.is_staff_lead(auth.uid()));

-- =========================================================================
-- NOTICES UPGRADE
-- =========================================================================
ALTER TABLE public.notices
  ADD COLUMN IF NOT EXISTS audience public.notice_audience NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS posted_by UUID REFERENCES auth.users(id);

DROP POLICY IF EXISTS "Notices are publicly readable" ON public.notices;

CREATE POLICY "Public notices readable by all" ON public.notices
  FOR SELECT TO anon, authenticated USING (audience = 'public');
CREATE POLICY "Staff read all notices" ON public.notices
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.staff WHERE user_id = auth.uid())
  );
CREATE POLICY "Lead staff post notices" ON public.notices
  FOR INSERT TO authenticated WITH CHECK (public.is_staff_lead(auth.uid()));
CREATE POLICY "Lead staff update notices" ON public.notices
  FOR UPDATE TO authenticated USING (public.is_staff_lead(auth.uid()));
CREATE POLICY "Lead staff delete notices" ON public.notices
  FOR DELETE TO authenticated USING (public.is_staff_lead(auth.uid()));

-- =========================================================================
-- TRIGGERS for updated_at
-- =========================================================================
CREATE TRIGGER trg_staff_updated BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- AUTO-CREATE user_role on first sign-in via trigger on profiles
-- (profiles already exist; we keep it as the canonical place)
-- =========================================================================
-- Note: roles are inserted from the app after user picks role.
