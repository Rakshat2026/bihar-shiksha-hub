import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, ClipboardList, BookOpen, Trophy, LogOut, Bell, Loader2 } from "lucide-react";

interface Student { id: string; student_uid: string; name: string; class: string; section: string; roll_no: string | null; }

const StaffDashboard = () => {
  const { user, staff, isStaff, signOut, loading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!user || !staff) return;
    (async () => {
      setBusy(true);
      const { data } = await supabase
        .from("students").select("id, student_uid, name, class, section, roll_no")
        .eq("class", staff.assigned_class ?? "")
        .eq("section", staff.assigned_section ?? "")
        .order("roll_no", { ascending: true });
      setStudents((data ?? []) as Student[]);
      setBusy(false);
    })();
  }, [user, staff]);

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!user || !isStaff) return <Navigate to="/staff/login" replace />;

  const stats = [
    { icon: Users, label: "Class Roster", value: students.length, hint: staff?.assigned_class ? `${staff.assigned_class} - ${staff.assigned_section}` : "—" },
    { icon: ClipboardList, label: "Today's Attendance", value: "—", hint: "Tap to mark" },
    { icon: BookOpen, label: "Pending Homework", value: "—", hint: "Manage" },
    { icon: Trophy, label: "Results Recorded", value: "—", hint: "This term" },
  ];

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-primary text-primary-foreground">
        <div className="container px-4 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-primary-foreground/70">Staff Portal</p>
            <h1 className="text-xl font-bold">{staff?.name ?? "Welcome"}</h1>
            <p className="text-xs text-primary-foreground/80">
              {staff?.sub_role?.toUpperCase()} · {staff?.assigned_class ?? "—"} {staff?.assigned_section}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
              <Link to="/notices"><Bell className="h-4 w-4 mr-1" /> Notices</Link>
            </Button>
            <Button onClick={signOut} variant="outline" size="sm" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="border-0 shadow-card hover-lift">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg gradient-royal text-primary-foreground grid place-items-center">
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

        <Card className="border-0 shadow-card">
          <CardHeader><CardTitle>My Class</CardTitle></CardHeader>
          <CardContent>
            <Tabs defaultValue="roster">
              <TabsList>
                <TabsTrigger value="roster">Roster</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="homework">Homework</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
              </TabsList>
              <TabsContent value="roster">
                {busy ? <div className="py-8 text-center"><Loader2 className="animate-spin inline" /></div> : students.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6">
                    No students assigned. Ask the administrator to assign your class & section.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-muted-foreground border-b">
                        <tr><th className="py-2 px-2">Roll</th><th className="py-2 px-2">Name</th><th className="py-2 px-2">UID</th></tr>
                      </thead>
                      <tbody>
                        {students.map((s) => (
                          <tr key={s.id} className="border-b last:border-0 hover:bg-muted/40">
                            <td className="py-2 px-2 font-medium">{s.roll_no ?? "—"}</td>
                            <td className="py-2 px-2">{s.name}</td>
                            <td className="py-2 px-2 font-mono text-xs">{s.student_uid}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="attendance"><p className="py-6 text-sm text-muted-foreground">Attendance marking comes online once your class roster is populated by admin.</p></TabsContent>
              <TabsContent value="homework"><p className="py-6 text-sm text-muted-foreground">Post homework for your class — coming online with the next staff release.</p></TabsContent>
              <TabsContent value="results"><p className="py-6 text-sm text-muted-foreground">Record term results for your students — coming online with the next staff release.</p></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StaffDashboard;
