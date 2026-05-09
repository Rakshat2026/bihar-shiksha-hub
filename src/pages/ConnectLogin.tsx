import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Lock, Mail, GraduationCap, ArrowLeft, IdCard } from "lucide-react";

const ConnectLogin = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [tab, setTab] = useState<"student" | "parent">("student");

  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !password) return toast.error("Student ID and password are required");
    setLoading(true);
    // resolve Student UID -> email stored at provisioning time as `<uid>@students.gga.local`
    const studentEmail = `${uid.trim().toUpperCase()}@students.gga.local`;
    const { error } = await supabase.auth.signInWithPassword({ email: studentEmail, password });
    setLoading(false);
    if (error) return toast.error("Invalid Student ID or password");
    toast.success("Welcome back");
    navigate("/connect");
  };

  const handleParentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Email and password are required");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate("/connect");
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = tab === "parent" ? email : `${uid.trim().toUpperCase()}@students.gga.local`;
    if (!target) return toast.error("Enter your registered email");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(target, {
      redirectTo: `${window.location.origin}/connect/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password reset link sent. Please check your email.");
    setMode("login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 gradient-soft">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary text-sm mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to website
        </Link>
        <Card className="border-0 shadow-elevated">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl gradient-emerald flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-tertiary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Student Connect</h1>
                <p className="text-xs text-muted-foreground">For students & parents</p>
              </div>
            </div>

            {mode === "login" ? (
              <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                <TabsList className="grid grid-cols-2 mb-4 w-full">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="parent">Parent</TabsTrigger>
                </TabsList>

                <TabsContent value="student">
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="uid">Student ID</Label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="uid" placeholder="e.g. GGA-2026-0001" className="pl-9 uppercase" value={uid}
                          onChange={(e) => setUid(e.target.value)} />
                      </div>
                    </div>
                    <PasswordField value={password} onChange={setPassword} />
                    <Button type="submit" className="w-full gradient-emerald text-tertiary-foreground" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Sign in
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="parent">
                  <form onSubmit={handleParentLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="pe">Registered email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="pe" type="email" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                    </div>
                    <PasswordField value={password} onChange={setPassword} />
                    <Button type="submit" className="w-full gradient-emerald text-tertiary-foreground" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Sign in
                    </Button>
                  </form>
                </TabsContent>

                <button type="button" onClick={() => setMode("forgot")}
                  className="w-full text-sm text-primary hover:underline mt-3">
                  Forgot password?
                </button>
                <p className="text-xs text-muted-foreground text-center pt-3 mt-3 border-t">
                  Accounts are issued by the school administrator. There is no public sign-up.
                </p>
              </Tabs>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your {tab === "parent" ? "email" : "Student ID"} and we'll send a secure reset link.
                </p>
                {tab === "parent" ? (
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>Student ID</Label>
                    <Input className="uppercase" value={uid} onChange={(e) => setUid(e.target.value)} />
                  </div>
                )}
                <Button type="submit" className="w-full gradient-emerald text-tertiary-foreground" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Send reset link
                </Button>
                <button type="button" onClick={() => setMode("login")} className="w-full text-sm text-primary hover:underline">
                  Back to sign in
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const PasswordField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="space-y-2">
    <Label>Password</Label>
    <div className="relative">
      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input type="password" className="pl-9" value={value} onChange={(e) => onChange(e.target.value)} autoComplete="current-password" />
    </div>
  </div>
);

export default ConnectLogin;
