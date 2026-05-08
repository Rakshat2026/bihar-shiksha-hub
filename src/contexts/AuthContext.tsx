import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "student" | "parent" | "staff";
export type StaffSubRole = "teacher" | "hod" | "head";

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  mobile_number: string;
  role: "student" | "parent";
}

export interface StaffRecord {
  id: string;
  user_id: string;
  name: string;
  email: string;
  sub_role: StaffSubRole;
  assigned_class: string | null;
  assigned_section: string | null;
  department: string | null;
}

export interface StudentRecord {
  id: string;
  user_id: string | null;
  student_uid: string;
  name: string;
  class: string;
  section: string;
  roll_no: string | null;
  mobile_number: string | null;
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  staff: StaffRecord | null;
  student: StudentRecord | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAll: () => Promise<void>;
  isStaff: boolean;
  isStudent: boolean;
  isParent: boolean;
  isLeadStaff: boolean;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [staff, setStaff] = useState<StaffRecord | null>(null);
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async (uid: string) => {
    const [profRes, rolesRes, staffRes, studentRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("staff").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("students").select("*").eq("user_id", uid).maybeSingle(),
    ]);
    setProfile((profRes.data as Profile | null) ?? null);
    setRoles(((rolesRes.data ?? []) as { role: AppRole }[]).map((r) => r.role));
    setStaff((staffRes.data as StaffRecord | null) ?? null);
    setStudent((studentRes.data as StudentRecord | null) ?? null);
  }, []);

  const refreshAll = useCallback(async () => {
    if (user?.id) await loadAll(user.id);
  }, [user?.id, loadAll]);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => loadAll(sess.user.id), 0);
      } else {
        setProfile(null);
        setRoles([]);
        setStaff(null);
        setStudent(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) loadAll(sess.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadAll]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
    setStaff(null);
    setStudent(null);
  };

  const isStaff = roles.includes("staff");
  const isStudent = roles.includes("student");
  const isParent = roles.includes("parent");
  const isLeadStaff = !!staff && (staff.sub_role === "head" || staff.sub_role === "hod");

  return (
    <AuthContext.Provider
      value={{
        user, session, profile, roles, staff, student, loading,
        signOut, refreshAll,
        isStaff, isStudent, isParent, isLeadStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
