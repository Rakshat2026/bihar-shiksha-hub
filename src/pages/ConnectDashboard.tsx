import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, type StudentRecord } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Loader2, LogOut, GraduationCap, Calendar, BookOpen, Trophy, Wallet, MessageSquare } from "lucide-react";

interface Result { id: string; term: string; subject: string; marks: number; max_marks: number; grade: string | null; }
interface Att { id: string; date: string; status: string; }
interface HW { id: string; title: string; subject: string; due_date: string | null; description: string | null; }
interface Fee { id: string; term: string; amount: number; paid: boolean; due_date: string | null; }
interface Remark { id: string; term: string; remark: string; created_at: string; }

const ConnectDashboard = () => {
  const { user, student, isStudent, isParent, loading, signOut } = useAuth();
  const [linked, setLinked] = useState<StudentRecord[]>([]);
  const [active, setActive] = useState<StudentRecord | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [att, setAtt] = useState<Att[]>([]);
  const [hw, setHw] = useState<HW[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [remarks, setRemarks] = useState<Remark[]>([]);

  useEffect(() => { if (isStudent && student) setActive(student); }, [isStudent, student]);

  useEffect(() => {
    if (!isParent || !user) return;
    (async () => {
      const { data } = await supabase.from("parent_links").select("student:students(*)").eq("parent_user_id", user.id);
      const list = ((data ?? []) as { student: StudentRecord }[]).map((r) => r.student).filter(Boolean);
      setLinked(list);
      if (list.length && !active) setActive(list[0]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParent, user]);

  useEffect(() => {
    if (!active) return;
    (async () => {
      const [r, a, h, f, rm] = await Promise.all([
        supabase.from("results").select("*").eq("student_id", active.id).order("created_at", { ascending: false }),
        supabase.from("attendance").select("*").eq("student_id", active.id).order("date", { ascending: false }).limit(60),
        supabase.from("homework").select("*").eq("class", active.class).eq("section", active.section).order("created_at", { ascending: false }).limit(20),
        supabase.from("fees").select("*").eq("student_id", active.id).order("due_date", { ascending: true }),
        supabase.from("teacher_remarks").select("*").eq("student_id", active.id).order("created_at", { ascending: false }),
      ]);
      setResults((r.data ?? []) as Result[]);
      setAtt((a.data ?? []) as Att[]);
      setHw((h.data ?? []) as HW[]);
      setFees((f.data ?? []) as Fee[]);
      setRemarks((rm.data ?? []) as Remark[]);
    })();
  }, [active]);

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!user || (!isStudent && !isParent)) return <Navigate to="/connect/login" replace />;

  const present = att.filter((a) => a.status === "present").length;
  const attendancePct = att.length ? Math.round((present / att.length) * 100) : 0;
  const avgPct = results.length ? Math.round(results.reduce((s, r) => s + (r.marks / r.max_marks) * 100, 0) / results.length) : 0;
  const dueFees = fees.filter((f) => !f.paid).reduce((s, f) => s + Number(f.amount), 0);

  const subjectChart = Object.values(
    results.reduce<Record<string, { subject: string; pct: number; n: number }>>((acc, r) => {
      const k = r.subject;
      acc[k] ??= { subject: k, pct: 0, n: 0 };
      acc[k].pct += (r.marks / r.max_marks) * 100;
      acc[k].n += 1;
      return acc;
    }, {})
  ).map((s) => ({ subject: s.subject, score: Math.round(s.pct / s.n) }));

  const trend = [...results].reverse().slice(-8).map((r) => ({ name: `${r.subject} (${r.term})`, score: Math.round((r.marks / r.max_marks) * 100) }));

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="gradient-royal text-primary-foreground">
        <div className="container px-4 py-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-primary-foreground/70">Student Connect</p>
            <h1 className="text-xl font-bold">{active?.name ?? "Dashboard"}</h1>
            {active && <p className="text-xs text-primary-foreground/85">{active.class} · Sec {active.section} · {active.student_uid}</p>}
          </div>
          <div className="flex gap-2">
            {isParent && linked.length > 1 && (
              <select className="rounded-md bg-primary-foreground/10 border border-primary-foreground/30 px-2 py-1 text-sm"
                value={active?.id ?? ""} onChange={(e) => setActive(linked.find((s) => s.id === e.target.value) ?? null)}>
                {linked.map((s) => <option key={s.id} value={s.id} className="text-foreground">{s.name}</option>)}
              </select>
            )}
            <Button onClick={signOut} variant="outline" size="sm" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Calendar, label: "Attendance", value: `${attendancePct}%`, hint: `${present}/${att.length} days` },
            { icon: Trophy, label: "Average score", value: `${avgPct}%`, hint: `${results.length} results` },
            { icon: BookOpen, label: "Active homework", value: hw.length, hint: "Last 20" },
            { icon: Wallet, label: "Fees due", value: `₹${dueFees.toLocaleString("en-IN")}`, hint: `${fees.filter(f => !f.paid).length} pending` },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="border-0 shadow-card hover-lift">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg gradient-emerald text-tertiary-foreground grid place-items-center">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                  </div>
                  <p className="text-3xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.hint}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-0 shadow-card">
            <CardHeader><CardTitle className="text-base">Subject performance</CardTitle></CardHeader>
            <CardContent style={{ height: 260 }}>
              {subjectChart.length === 0 ? <Empty msg="No results yet" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          <Card className="border-0 shadow-card">
            <CardHeader><CardTitle className="text-base">Recent trend</CardTitle></CardHeader>
            <CardContent style={{ height: 260 }}>
              {trend.length === 0 ? <Empty msg="No data" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--secondary))" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-card">
          <CardContent className="p-0">
            <Tabs defaultValue="hw" className="w-full">
              <TabsList className="rounded-none border-b w-full justify-start bg-transparent">
                <TabsTrigger value="hw">Homework</TabsTrigger>
                <TabsTrigger value="att">Attendance</TabsTrigger>
                <TabsTrigger value="res">Results</TabsTrigger>
                <TabsTrigger value="fee">Fees</TabsTrigger>
                <TabsTrigger value="rem">Remarks</TabsTrigger>
              </TabsList>
              <div className="p-5">
                <TabsContent value="hw">{hw.length === 0 ? <Empty msg="No homework" /> : (
                  <ul className="space-y-2">
                    {hw.map((h) => (
                      <li key={h.id} className="p-3 rounded-md border bg-card">
                        <div className="flex justify-between"><span className="font-medium">{h.title}</span><span className="text-xs text-muted-foreground">{h.subject}</span></div>
                        {h.description && <p className="text-sm text-muted-foreground mt-1">{h.description}</p>}
                        {h.due_date && <p className="text-xs text-secondary mt-1">Due {new Date(h.due_date).toLocaleDateString()}</p>}
                      </li>
                    ))}
                  </ul>
                )}</TabsContent>
                <TabsContent value="att">{att.length === 0 ? <Empty msg="No attendance records" /> : (
                  <div className="grid sm:grid-cols-2 gap-2 max-h-80 overflow-auto">
                    {att.map((a) => (
                      <div key={a.id} className="flex justify-between text-sm border rounded px-3 py-2">
                        <span>{new Date(a.date).toLocaleDateString()}</span>
                        <span className={a.status === "present" ? "text-tertiary font-semibold" : "text-destructive"}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                )}</TabsContent>
                <TabsContent value="res">{results.length === 0 ? <Empty msg="No results yet" /> : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground border-b">
                      <tr><th className="py-2">Term</th><th>Subject</th><th>Marks</th><th>Grade</th></tr>
                    </thead>
                    <tbody>{results.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="py-2">{r.term}</td><td>{r.subject}</td>
                        <td>{r.marks}/{r.max_marks}</td><td>{r.grade ?? "—"}</td>
                      </tr>))}
                    </tbody>
                  </table>
                )}</TabsContent>
                <TabsContent value="fee">{fees.length === 0 ? <Empty msg="No fee records" /> : (
                  <ul className="space-y-2">
                    {fees.map((f) => (
                      <li key={f.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{f.term}</p>
                          {f.due_date && <p className="text-xs text-muted-foreground">Due {new Date(f.due_date).toLocaleDateString()}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{Number(f.amount).toLocaleString("en-IN")}</p>
                          <p className={`text-xs ${f.paid ? "text-tertiary" : "text-destructive"}`}>{f.paid ? "Paid" : "Pending"}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}</TabsContent>
                <TabsContent value="rem">{remarks.length === 0 ? <Empty msg="No remarks yet" /> : (
                  <ul className="space-y-2">
                    {remarks.map((r) => (
                      <li key={r.id} className="p-3 border rounded-md">
                        <div className="flex justify-between text-xs text-muted-foreground"><span>{r.term}</span><span>{new Date(r.created_at).toLocaleDateString()}</span></div>
                        <p className="text-sm mt-1">{r.remark}</p>
                      </li>
                    ))}
                  </ul>
                )}</TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const Empty = ({ msg }: { msg: string }) => (
  <div className="text-sm text-muted-foreground text-center py-8">{msg}</div>
);

export default ConnectDashboard;
