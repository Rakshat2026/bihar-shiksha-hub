
# Bihar Shiksha Hub — Full Overhaul Plan

## 1. Roles & Identity Model

Three login types — selected on the login dialog before credentials:

- **Student** — logs in with **mobile + OTP** (Twilio SMS), gets a unique **Student ID** (e.g. `GGA-2026-00042`) auto-issued on first profile save.
- **Parent** — logs in with **email + OTP** (Lovable auth email) and links to one or more student IDs.
- **Staff** — logs in with **email + password**, with a sub-role: `teacher`, `hod`, or `head`. Class/section is assigned per teacher.

All three flows protected by **Cloudflare Turnstile** CAPTCHA.
**Google login** available on every tab as a one-tap alternative; first-time Google users are prompted to choose role + complete profile.

### Database changes (one migration)

Schema-only — no seed data, since teachers will populate everything.

- `app_role` enum: `student | parent | staff`
- `staff_sub_role` enum: `teacher | hod | head`
- `user_roles` table — `(user_id, role)`, RLS, security-definer `has_role()` helper
- `students` table — `student_uid` (unique, auto-generated), `user_id`, `name`, `class`, `section`, `roll_no`, `dob`, `mobile_number`
- `staff` table — `user_id`, `name`, `email`, `sub_role`, `assigned_class`, `assigned_section`, `department`
- `parent_links` table — `parent_user_id`, `student_id`
- `attendance` — `student_id`, `date`, `status` (present/absent/late), `marked_by`
- `results` — `student_id`, `term`, `subject`, `marks`, `max_marks`, `grade`
- `homework` — `class`, `section`, `subject`, `title`, `description`, `due_date`, `posted_by`
- `complaints` — `message`, `category`, `created_at` (no user info, fully anonymous)
- Add `posted_by` + `audience` to `notices`; tighten RLS so only Head/HOD can insert
- RLS everywhere: students see own data, parents see linked students' data, staff see their assigned class/section, head/HOD see all

### Edge functions

- `auth-otp` (existing) — extend to support **`channel: "sms" | "email"`**; SMS branch calls Twilio gateway, email branch sends 6-digit code via Lovable auth email template
- `verify-turnstile` — server-side validates Turnstile token before issuing OTPs or accepting signups
- `student-uid` — DB trigger/function generates `GGA-{year}-{sequence}` on student row insert

### Secrets needed

- `TURNSTILE_SECRET_KEY` (server) + Turnstile site key (public, in `.env`)
- Twilio: connector — needs `From` number; user must connect via picker
- Google OAuth: managed by Lovable Cloud (no setup required)

## 2. Academic Year

Find/replace `2025-26` → `2026-27` and `2025-2026` → `2026-2027` across pages, hero CTA strip, admissions, and i18n strings (Hindi + English).

## 3. Student Portfolio & "Student Connect"

New `/portfolio` route, gated by login.

- **Student view**: header card with avatar, name, **Student UID**, class/section. Tabs: Attendance / Results / Homework / Profile.
- **"Student Connect" button** opens a full-history sheet with timeline of all records.
- **Parent view**: same layout with a switcher if multiple linked children.

## 4. Staff Dashboard (no backend code edits required to update data)

New `/staff` route, gated by Staff role.

- **Class roster**: lists students of teacher's assigned class/section
- **Mark Attendance**: date picker → grid of students with present/absent/late toggles → save
- **Enter Results**: term selector → subject grid → marks input
- **Post Homework**: title, subject, description, due date → posts to assigned class
- **Notice Board (Head/HOD only)**: post school-wide notices; teachers see read-only

All forms use existing shadcn components + Zod validation; data writes go directly to RLS-protected tables via Supabase client.

## 5. Reach Us / Complaint

- Rename `Contact` page heading + nav label to **"Reach Us / Complaint"**
- Remove name + mobile fields; keep only **category** dropdown + **message** textarea
- Submit anonymously to `complaints` table (insert allowed for everyone, select restricted to Head/HOD)
- Keep address/phone/map info block as-is

## 6. Homepage Redesign

- **New palette**: keep saffron accent, shift primary to a deeper teal/indigo blend; add soft warm gradient backgrounds, glass-morph cards
- **Fonts**: switch headings to **Poppins**, body to **Inter** (loaded via Google Fonts in `index.html`)
- **New sections**: animated stat counters (students, teachers, years), testimonial carousel (placeholder text), quick-links grid, faculty highlights, "Apply for 2026-27" pulse CTA
- All tokens added to `index.css` + `tailwind.config.ts` — no hard-coded colors

## 7. Notice Board Access Control

- Notices page no longer linked from public nav — moved under Staff dashboard
- RLS:
  - SELECT: any authenticated staff
  - INSERT/UPDATE/DELETE: only `head` or `hod` (checked via `has_role` + `staff.sub_role`)
- Public homepage shows only the 3 most recent **`audience='public'`** notices in a teaser strip

---

## Execution order

1. Migration: enums, role tables, student/staff/parent_links/attendance/results/homework/complaints, RLS, helpers, student UID generator
2. Add Turnstile + Twilio secrets, deploy `verify-turnstile` and updated `auth-otp` edge functions
3. Rebuild `LoginDialog` with role tabs + channel switching + Google + Turnstile
4. Auth context: load role + staff/student profile
5. New routes: `/portfolio`, `/staff`, refactor `/notices` behind staff
6. Rebuild `Contact` → `Reach Us / Complaint`
7. Redesign homepage + design tokens + fonts
8. Academic year string sweep
9. i18n updates (Hindi + English) for all new copy
10. Run security scan, fix findings

## Things I will NOT do (out of scope unless you ask)

- File uploads (avatars, certificates) — can add later with storage buckets
- Payment / fee tracking
- Push notifications / SMS reminders to parents
- Bulk import (CSV upload of students) — staff add students manually for now

## Secrets you'll be asked to add

- `TURNSTILE_SECRET_KEY` and `VITE_TURNSTILE_SITE_KEY` (from Cloudflare → Turnstile)
- Twilio connection (via the connector picker — I'll trigger it)

Approve and I'll execute the whole sequence.
