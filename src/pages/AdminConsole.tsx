import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogOut, Inbox, Users, GraduationCap, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface Enquiry {
  id: string; created_at: string; name: string; parent_name: string | null;
  mobile_number: string; email: string | null; class_applied: string;
  previous_school: string | null; address: string | null; message: string | null; status: string;
}

const AdminConsole = () => {
  const { user, staff, isStaff, signOut, loading } = useAuth();
  const isAdmin = !!staff && staff.sub_role === "head";
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setBusy(true);
      const { data, error } = await supabase.from("enquiries").select("*").order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setEnquiries((data ?? []) as Enquiry[]);
      setBusy(false);
    })();
  }, [isAdmin]);

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>;
  if (!user || !isStaff) return <Navigate to="/staff/login" replace />;
  if (!isAdmin) return (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <h1 className="text-xl font-bold">Admin access required</h1>
        <p className="text-sm text-muted-foreground">Only Head accounts can access the admin console.</p>
      </div>
    </div>
  );

  const markContacted = async (id: string) => {
    const { error } = await supabase.from("enquiries").update({ status: "contacted" }).eq("id", id);
    if (error) return toast.error(error.message);
    setEnquiries((es) => es.map((e) => (e.id === id ? { ...e, status: "contacted" } : e)));
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-primary text-primary-foreground">
        <div className="container px-4 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-primary-foreground/70">Admin Console</p>
            <h1 className="text-xl font-bold">{staff?.name}</h1>
          </div>
          <Button onClick={signOut} variant="outline" size="sm" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
            <LogOut className="h-4 w-4 mr-1" /> Sign out
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <Tabs defaultValue="enq">
          <TabsList>
            <TabsTrigger value="enq"><Inbox className="h-4 w-4 mr-1" /> Enquiries</TabsTrigger>
            <TabsTrigger value="staff"><Users className="h-4 w-4 mr-1" /> Staff</TabsTrigger>
            <TabsTrigger value="students"><GraduationCap className="h-4 w-4 mr-1" /> Students</TabsTrigger>
          </TabsList>

          <TabsContent value="enq">
            <Card className="border-0 shadow-card">
              <CardHeader><CardTitle>Admission enquiries</CardTitle></CardHeader>
              <CardContent>
                {busy ? <Loader2 className="animate-spin" /> : enquiries.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">No enquiries yet.</p>
                ) : (
                  <div className="space-y-3">
                    {enquiries.map((e, i) => (
                      <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="border rounded-lg p-4 bg-card">
                        <div className="flex justify-between flex-wrap gap-2">
                          <div>
                            <p className="font-semibold">{e.name} <span className="text-muted-foreground font-normal">· {e.class_applied}</span></p>
                            <p className="text-xs text-muted-foreground">
                              Parent: {e.parent_name ?? "—"} · {new Date(e.created_at).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={e.status === "new" ? "default" : "secondary"}>{e.status}</Badge>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 mt-3 text-sm">
                          <p><span className="text-muted-foreground">Mobile:</span> {e.mobile_number}</p>
                          <p><span className="text-muted-foreground">Email:</span> {e.email ?? "—"}</p>
                          <p className="sm:col-span-2"><span className="text-muted-foreground">Address:</span> {e.address ?? "—"}</p>
                          <p className="sm:col-span-2"><span className="text-muted-foreground">Previous school:</span> {e.previous_school ?? "—"}</p>
                          {e.message && <p className="sm:col-span-2 italic text-muted-foreground">"{e.message}"</p>}
                        </div>
                        {e.status === "new" && (
                          <Button size="sm" variant="outline" className="mt-3" onClick={() => markContacted(e.id)}>
                            Mark as contacted
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card className="border-0 shadow-card">
              <CardHeader><CardTitle>Staff accounts</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Staff provisioning runs through a secure admin tool. Account creation will appear here in the next release; for now coordinate with IT for new staff IDs.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card className="border-0 shadow-card">
              <CardHeader><CardTitle>Student & parent accounts</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Student onboarding (UID generation, parent linking, credential issue) will appear here in the next release.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminConsole;
