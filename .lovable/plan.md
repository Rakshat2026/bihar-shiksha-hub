## Bihar Shiksha Hub — Premium ERP Transformation

This is a large redesign + restructure. Below is the plan for one big pass. Please confirm a few choices before I start (questions at the end).

---

### 1. Information architecture (new routes)

```
Public site
  /                    Home (redesigned, premium)
  /about, /academics, /facilities, /gallery, /notices  (restyled)
  /admissions          Admission enquiry (no login)
  /contact             Reach Us / Complaint (kept)

Portals (separate entry points, separate UIs)
  /staff/login         Staff Login (no signup, forgot password)
  /staff               Staff dashboard (role-aware: teacher / hod / head / admin)
  /connect/login       Student Connect login (no signup, forgot password)
  /connect             Student/Parent dashboard
  /admin               Admin console (head role only)
```

The current `/portfolio` becomes `/connect`. The mixed student/parent signup in `LoginDialog` is removed.

---

### 2. Admission Enquiry (no accounts)

- Public form at `/admissions`, no auth required.
- Fields: student name, parent/guardian name, mobile, email, address, class applying for, previous school, message.
- Stored in `enquiries` table (extend with the new columns).
- RLS: anonymous INSERT allowed (rate-limited via Turnstile token check); only lead staff / admin can SELECT.
- Success confirmation card after submit.

### 3. Staff Login Portal

- Dedicated `/staff/login` page (no "create account", no tabs).
- Email + password (staff `email` already exists).
- Forgot password → `supabase.auth.resetPasswordForEmail` → `/staff/reset-password`.
- **Removes the self-insert `staff` policy entirely** (fixes the open privilege-escalation finding). Staff records only created by admin/head.
- Staff dashboard sections: My Class roster, Attendance, Homework, Results, Notices (HOD/Head only for posting).

### 4. Student Connect Portal

- `/connect/login`: Student UID + password OR Parent email + password.
- **No self-signup.** Admin issues credentials.
- Forgot password via OTP (email for parents; mobile OTP via existing `auth-otp` edge function for students).
- Dashboard tabs: Attendance, Homework, Notices, Results, Analytics (recharts), Teacher Remarks, Fee Status, Timetable.
- Fee + timetable are new tables (fees, timetable_slots).

### 5. Admin Console (`/admin`, head role only)

- Create/disable staff accounts (calls an edge function using service role to create auth user + staff row + user_role).
- Create/disable student & parent accounts (same pattern, generates UID + temp password).
- Review admission enquiries (list, mark contacted).
- Manage notices.

### 6. Auth model changes

- Add `app_role = 'admin'` enum value (head implicitly admin, or a dedicated admin role).
- New edge function `admin-provision` (service role) for creating staff / student / parent users — only callable by head.
- Drop self-insert/update on `staff` (security finding fix).
- Disable public signup paths in UI; keep `supabase.auth.signUp` server-side only via edge function.

### 7. Visual redesign

New token palette in `index.css` + `tailwind.config.ts`:

```text
--background : warm ivory       (40 30% 98%)
--foreground : slate charcoal   (220 25% 14%)
--primary    : deep navy        (220 60% 18%)
--secondary  : muted gold       (42 65% 52%)
--tertiary   : elegant emerald  (165 45% 35%)
--accent     : soft teal tint   (180 30% 94%)
```

- Fonts: **Fraunces** (display) + **Inter** (body) + **Noto Sans Devanagari** (Hindi).
- Replace saffron gradients with subtle navy→teal and ivory→gold washes.
- Add `framer-motion` for page transitions, fade-up sections, animated counters, hover lifts.
- Glass cards used sparingly on hero.
- Mobile-first responsive grid; sticky translucent navbar with shrink-on-scroll.

### 8. Component cleanup

- Replace `LoginDialog` with two pages: `StaffLoginPage`, `ConnectLoginPage`.
- New `PortalLayout` with sidebar (`shadcn/ui sidebar`) for `/staff`, `/connect`, `/admin`.
- Public `Layout` keeps top navbar + footer, gets restyled.
- Add `ProtectedRoute` wrapper that checks role + redirects to the correct login.

---

### Technical section

- DB migrations:
  1. Drop `Staff insert own record` + `Staff update own record` policies (security fix).
  2. Add `app_role = 'admin'` enum value and an admin RLS helper.
  3. Extend `enquiries` with `parent_name`, `email`, `address`, `previous_school`, `status`; allow anon INSERT + admin SELECT/UPDATE.
  4. New tables: `fees(student_id, term, amount, paid, due_date)`, `timetable_slots(class, section, day, period, subject, teacher_id)`, `teacher_remarks(student_id, term, remark, by)`.
  5. Realtime publication for `notices`, `homework`.
- Edge function `admin-provision` (service role): create auth user, insert into `staff`/`students`/`profiles`, assign `user_roles`. JWT-verified, head-only.
- `framer-motion` added; `recharts` already present (used in Portfolio).
- `react-hook-form` + `zod` for all forms.
- All new routes lazy-loaded with `React.lazy` for performance.

---

### Out of scope for this pass (flag for later)

- Twilio SMS / paid OTP — keep current free email OTP + mock mobile OTP.
- Online fee payments — fees are read-only status display.
- Push notifications.

---

### Quick confirmations needed

1. **Admin role** — should the existing `head` sub_role act as admin, or do you want a separate dedicated `admin` account?
2. **Student Connect login identifier** — Student UID (`GGA-2026-0001`) + password, or mobile + OTP only?
3. **Should I keep Hindi/English bilingual support across the new portals?** (adds work but consistent.)
4. **Forgot-password delivery for students** — email OTP only (free, reliable) or mobile OTP via the existing mock flow?

Reply with answers (or "your call on all") and I'll execute the full pass.
