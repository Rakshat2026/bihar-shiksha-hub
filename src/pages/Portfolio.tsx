import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth, type StudentRecord } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GraduationCap, Calendar, Trophy, BookOpen, User, History, LogIn, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Attendance { id: string; date: string; status: string; notes: string | null; }
interface Result { id: string; term: string; subject: string; marks: number; max_marks: number; grade: string | null; created_at: string; }
interface Homework { id: string; title: string; subject: string; description: string | null; due_date: string | null; created_at: string; }

const Portfolio = () => {
  const { t } = useI18n();
  const { user, student, isStudent, isParent, loading } = useAuth();
  const [linkedStudents, setLinkedStudents] = useState<StudentRecord[]>([]);
  const [activeStudent, setActiveStudent] = useState<StudentRecord | null>(null);
  const [linkUid, setLinkUid] = useState("");
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (isStudent && student) setActiveStudent(student);
  }, [isStudent, student]);

  useEffect(() => {
    if (!isParent || !user) return;
    (async () => {
      const { data } = await supabase
        .from("parent_links")
        .select("student:students(*)")
        .eq("parent_user_id", user.id);
      const list = ((data ?? []) as { student: StudentRecord }[]).map((r) => r.student).filter(Boolean);
      setLinkedStudents(list);
      if (list.length && !activeStudent) setActiveStudent(list[0]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParent, user]);

  const linkChild = async () => {
    if (!user || !linkUid.trim()) return;
    setLinking(true);
    try {
      const { data: stu, error } = await supabase
        .from("students").select("*").eq("student_uid", linkUid.trim().toUpperCase()).maybeSingle();
      if (error) throw error;
      if (!stu) { toast.error("Student ID not found"); return; }
      const { error: linkErr } = await supabase
        .from("parent_links")
        .insert({ parent_user_id: user.id, student_id: stu.id });
      if (linkErr) throw linkErr;
      toast.success("Child linked!");
      setLinkedStudents((p) => [...p, stu as StudentRecord]);
      setActiveStudent(stu as StudentRecord);
      setLinkUid("");
    } catch (err) {
      console.error(err);
      toast.error("Could not link. Check the ID and try again.");
    } finally { setLinking(false); }
  };

  if (loading) return <div className="container py-20 text-center"><Loader2 className="h-6 w-6 animate-spin inline" /></div>;

  if (!user) {
    return (
      <div className="container px-4 py-20 text-center">
        <LogIn className="h-12 w-12 mx-auto text-primary mb-3" />
        <h1 className="text-2xl font-bold font-display mb-2">{t("portfolioHeading")}</h1>
        <p className="text-muted-foreground mb-6">Please log in as a Student or Parent.</p>
        <Button asChild><Link to="/">Back to Home</Link></Button>
      </div>
    );
  }

  if (isParent && linkedStudents.length === 0) {
    return (
      <div className="container px-4 py-12 max-w-md">
        <Card className="shadow-soft">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-bold font-display text-primary">{t("linkChild")}</h2>
            <p className="text-sm text-muted-foreground">{t("noStudentLinked")}</p>
            <div className="space-y-2">
              <Label>{t("studentUid")}</Label>
              <Input value={linkUid} onChange={(e) => setLinkUid(e.target.value)} placeholder={t("enterStudentUid")} />
            </div>
            <Button className="w-full" onClick={linkChild} disabled={linking}>
              {linking ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {t("link")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeStudent) {
    return (
      <div className="container px-4 py-20 text-center">
        <p className="text-muted-foreground">{t("noStudentLinked")}</p>
      </div>
    );
  }

  return <PortfolioView student={activeStudent} linkedStudents={isParent ? linkedStudents : []} onSwitch={setActiveStudent} />;
};

function PortfolioView({ student, linkedStudents, onSwitch }: {
  student: StudentRecord;
  linkedStudents: StudentRecord[];
  onSwitch: (s: StudentRecord) => void;
}) {
  const { t } = useI18n();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);

  useEffect(() => {
    (async () => {
      const [aRes, rRes, hRes] = await Promise.all([
        supabase.from("attendance").select("*").eq("student_id", student.id).order("date", { ascending: false }).limit(60),
        supabase.from("results").select("*").eq("student_id", student.id).order("created_at", { ascending: false }),
        supabase.from("homework").select("*").eq("class", student.class).eq("section", student.section)
          .order("created_at", { ascending: false }).limit(30),
      ]);
      setAttendance((aRes.data ?? []) as Attendance[]);
      setResults((rRes.data ?? []) as Result[]);
      setHomework((hRes.data ?? []) as Homework[]);
    })();
  }, [student.id, student.class, student.section]);

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const attendancePct = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;

  return (
    <div className="animate-fade-in">
      <section className="gradient-hero text-primary-foreground py-10">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center text-2xl font-bold font-display">
                {student.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-display">{student.name}</h1>
                <div className="text-sm opacity-90 mt-1">
                  <span className="font-mono bg-white/15 px-2 py-0.5 rounded">{student.student_uid}</span>
                  <span className="ml-3">{t("className")} {student.class} • {t("section")} {student.section}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {linkedStudents.length > 1 && (
                <select className="rounded-md bg-white/15 text-white text-sm px-3 py-2 border border-white/30"
                  value={student.id} onChange={(e) => {
                    const s = linkedStudents.find((x) => x.id === e.target.value);
                    if (s) onSwitch(s);
                  }}>
                  {linkedStudents.map((s) => <option key={s.id} value={s.id} className="text-foreground">{s.name}</option>)}
                </select>
              )}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="hero" className="animate-pulse-ring"><History className="h-4 w-4" /> {t("studentConnect")}</Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                  <SheetHeader><SheetTitle>{t("studentConnect")}</SheetTitle></SheetHeader>
                  <ConnectTimeline attendance={attendance} results={results} homework={homework} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 py-8">
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <StatCard icon={Calendar} label={t("tabAttendance")} value={`${attendancePct}%`} sub={`${presentCount}/${attendance.length}`} />
          <StatCard icon={Trophy} label={t("tabResults")} value={String(results.length)} sub="records" />
          <StatCard icon={BookOpen} label={t("tabHomework")} value={String(homework.length)} sub="assignments" />
        </div>

        <Tabs defaultValue="attendance">
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger value="attendance">{t("tabAttendance")}</TabsTrigger>
            <TabsTrigger value="results">{t("tabResults")}</TabsTrigger>
            <TabsTrigger value="homework">{t("tabHomework")}</TabsTrigger>
            <TabsTrigger value="profile">{t("tabProfile")}</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <Card><CardContent className="p-4">
              {attendance.length === 0 ? <p className="text-sm text-muted-foreground">No attendance records yet.</p> : (
                <ul className="divide-y divide-border">
                  {attendance.map((a) => (
                    <li key={a.id} className="py-2 flex justify-between items-center text-sm">
                      <span>{new Date(a.date).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        a.status === "present" ? "bg-tertiary/15 text-tertiary" :
                        a.status === "late" ? "bg-secondary/15 text-secondary" :
                        "bg-destructive/15 text-destructive"
                      }`}>{a.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="results">
            <Card><CardContent className="p-4">
              {results.length === 0 ? <p className="text-sm text-muted-foreground">No results yet.</p> : (
                <ul className="divide-y divide-border">
                  {results.map((r) => (
                    <li key={r.id} className="py-2 flex justify-between text-sm">
                      <div><div className="font-medium">{r.subject}</div><div className="text-xs text-muted-foreground">{r.term}</div></div>
                      <div className="text-right"><div className="font-bold text-primary">{r.marks}/{r.max_marks}</div>{r.grade && <div className="text-xs">{r.grade}</div>}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="homework">
            <Card><CardContent className="p-4">
              {homework.length === 0 ? <p className="text-sm text-muted-foreground">No homework yet.</p> : (
                <ul className="divide-y divide-border">
                  {homework.map((h) => (
                    <li key={h.id} className="py-3">
                      <div className="flex justify-between gap-3">
                        <div className="font-medium">{h.title}</div>
                        {h.due_date && <span className="text-xs text-secondary font-medium shrink-0">Due {new Date(h.due_date).toLocaleDateString()}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{h.subject}</div>
                      {h.description && <div className="text-sm mt-1 text-muted-foreground">{h.description}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card><CardContent className="p-4 space-y-2 text-sm">
              <Field label={t("studentUid")} value={student.student_uid} />
              <Field label={t("fieldName")} value={student.name} />
              <Field label={t("className")} value={student.class} />
              <Field label={t("section")} value={student.section} />
              <Field label={t("rollNo")} value={student.roll_no || "—"} />
              <Field label={t("fieldMobile")} value={student.mobile_number || "—"} />
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof GraduationCap; label: string; value: string; sub?: string }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl gradient-emerald text-white flex items-center justify-center"><Icon className="h-5 w-5" /></div>
        <div><div className="text-2xl font-bold font-display text-primary leading-tight">{value}</div><div className="text-xs text-muted-foreground">{label} {sub && `• ${sub}`}</div></div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-border pb-1.5"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}

function ConnectTimeline({ attendance, results, homework }: { attendance: Attendance[]; results: Result[]; homework: Homework[] }) {
  type Ev = { date: string; type: string; title: string; detail: string };
  const events: Ev[] = [
    ...attendance.map((a) => ({ date: a.date, type: "Attendance", title: a.status.toUpperCase(), detail: a.notes || "" })),
    ...results.map((r) => ({ date: r.created_at?.slice(0, 10) ?? "", type: "Result", title: `${r.subject} (${r.term})`, detail: `${r.marks}/${r.max_marks}` })),
    ...homework.map((h) => ({ date: h.created_at?.slice(0, 10) ?? "", type: "Homework", title: h.title, detail: h.subject })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  if (events.length === 0) return <p className="text-sm text-muted-foreground mt-4">No history yet.</p>;
  return (
    <ol className="mt-4 space-y-3">
      {events.map((e, i) => (
        <li key={i} className="border-l-2 border-secondary pl-3">
          <div className="text-xs text-muted-foreground">{e.date} • {e.type}</div>
          <div className="font-medium">{e.title}</div>
          {e.detail && <div className="text-sm text-muted-foreground">{e.detail}</div>}
        </li>
      ))}
    </ol>
  );
}

export default Portfolio;
