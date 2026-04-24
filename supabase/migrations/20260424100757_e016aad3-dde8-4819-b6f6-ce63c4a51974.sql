-- Profiles table linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('student', 'parent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Enquiries table
CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  role TEXT NOT NULL,
  class_applied TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enquiries"
  ON public.enquiries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can submit enquiries"
  ON public.enquiries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_enquiries_user_id ON public.enquiries(user_id);
CREATE INDEX idx_enquiries_created_at ON public.enquiries(created_at DESC);

-- Notices table (publicly readable)
CREATE TABLE public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  notice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notices are publicly readable"
  ON public.notices FOR SELECT
  USING (true);

CREATE INDEX idx_notices_date ON public.notices(notice_date DESC);

-- Updated-at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed sample notices
INSERT INTO public.notices (title, description, notice_date) VALUES
  ('वार्षिक परीक्षा कार्यक्रम / Annual Exam Schedule', 'कक्षा 1 से 8 तक की वार्षिक परीक्षा 15 मार्च से प्रारंभ होगी। समय सारिणी विद्यालय कार्यालय से प्राप्त करें। / Annual examinations for classes 1-8 will commence from March 15. Please collect the schedule from the school office.', CURRENT_DATE),
  ('प्रवेश प्रारंभ / Admissions Open 2025-26', 'सत्र 2025-26 के लिए कक्षा 1 से 8 तक प्रवेश प्रारंभ हैं। फॉर्म कार्यालय से प्राप्त करें या ऑनलाइन भरें। / Admissions are open for classes 1-8 for the academic year 2025-26. Collect the form from office or apply online.', CURRENT_DATE - INTERVAL '3 days'),
  ('गणतंत्र दिवस समारोह / Republic Day Celebration', '26 जनवरी को विद्यालय प्रांगण में गणतंत्र दिवस मनाया जाएगा। सभी विद्यार्थी प्रातः 8 बजे उपस्थित हों। / Republic Day will be celebrated at the school premises on January 26. All students must be present by 8:00 AM.', CURRENT_DATE - INTERVAL '7 days'),
  ('अभिभावक-शिक्षक बैठक / Parent-Teacher Meeting', 'अगली अभिभावक-शिक्षक बैठक शनिवार को आयोजित की जाएगी। सभी अभिभावकों से उपस्थिति का अनुरोध है। / The next PTM will be held on Saturday. All parents are requested to attend.', CURRENT_DATE - INTERVAL '14 days');