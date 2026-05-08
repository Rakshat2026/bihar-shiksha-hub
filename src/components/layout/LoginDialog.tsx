import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth, type StaffSubRole } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Phone, KeyRound, Mail, Loader2, Info, GraduationCap, Users, Briefcase } from "lucide-react";
import { friendlyAuthError } from "@/lib/errors";
import { TurnstileWidget } from "@/components/auth/TurnstileWidget";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Tab = "student" | "parent" | "staff";

export function LoginDialog({ open, onOpenChange }: Props) {
  const { t } = useI18n();
  const { refreshAll } = useAuth();
  const [tab, setTab] = useState<Tab>("student");
  const [captchaToken, setCaptchaToken] = useState("");

  const handleClose = (v: boolean) => onOpenChange(v);

  const handleGoogle = async () => {
    if (!captchaToken) { toast.error(t("captchaPlease")); return; }
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (!result.redirected) {
        await refreshAll();
        toast.success(t("welcomeBack"));
        handleClose(false);
      }
    } catch (err) {
      toast.error(friendlyAuthError(err, "Google sign-in failed."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary font-display">{t("loginHeading")}</DialogTitle>
          <DialogDescription>{t("loginIntro")}</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mt-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="student" className="text-xs sm:text-sm">
              <GraduationCap className="h-4 w-4 mr-1" />{t("studentLogin")}
            </TabsTrigger>
            <TabsTrigger value="parent" className="text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-1" />{t("parentLogin")}
            </TabsTrigger>
            <TabsTrigger value="staff" className="text-xs sm:text-sm">
              <Briefcase className="h-4 w-4 mr-1" />{t("staffLogin")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="mt-4">
            <StudentMobileFlow captchaToken={captchaToken} onSuccess={() => { refreshAll(); handleClose(false); }} />
          </TabsContent>
          <TabsContent value="parent" className="mt-4">
            <ParentEmailFlow captchaToken={captchaToken} onSuccess={() => { refreshAll(); handleClose(false); }} />
          </TabsContent>
          <TabsContent value="staff" className="mt-4">
            <StaffPasswordFlow captchaToken={captchaToken} onSuccess={() => { refreshAll(); handleClose(false); }} />
          </TabsContent>
        </Tabs>

        <div className="mt-4">
          <TurnstileWidget onVerify={setCaptchaToken} />
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{t("orDivider")}</span>
          </div>
        </div>

        <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleGoogle}>
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t("signInGoogle")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

/* -------------- Student: mobile + OTP via auth-otp edge fn -------------- */
function StudentMobileFlow({ captchaToken, onSuccess }: { captchaToken: string; onSuccess: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) { toast.error(t("captchaPlease")); return; }
    const cleaned = mobile.replace(/\D/g, "");
    if (cleaned.length !== 10) { toast.error(t("invalidMobile")); return; }
    setMobile(cleaned);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("auth-otp", {
        body: { action: "request", mobile: cleaned, captchaToken },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDevCode(typeof data?.dev_code === "string" ? data.dev_code : null);
      setStep("otp");
      toast.success(t("mockOtpHint"));
    } catch (err) {
      toast.error(friendlyAuthError(err, "Could not send code."));
    } finally { setLoading(false); }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(otp)) { toast.error(t("invalidOtp")); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("auth-otp", {
        body: { action: "verify", mobile, code: otp },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const { email, password, isNew } = data as { email: string; password: string; isNew: boolean };
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) throw signInErr;
      // Ensure student role exists
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase.from("user_roles").upsert(
          { user_id: u.user.id, role: "student" }, { onConflict: "user_id,role" }
        );
      }
      toast.success(isNew ? t("accountCreated") : t("welcomeBack"));
      onSuccess();
    } catch (err) {
      toast.error(friendlyAuthError(err, "Verification failed."));
    } finally { setLoading(false); }
  };

  if (step === "mobile") {
    return (
      <form onSubmit={sendOtp} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="m">{t("fieldMobile")}</Label>
          <div className="flex gap-2">
            <div className="flex items-center px-3 rounded-md border border-input bg-muted text-sm font-medium">+91</div>
            <Input id="m" type="tel" inputMode="numeric" maxLength={10} value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} placeholder="9876543210" required />
          </div>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />} {t("sendOtp")}
        </Button>
      </form>
    );
  }
  return (
    <form onSubmit={verifyOtp} className="space-y-3">
      <div className="rounded-md bg-accent text-accent-foreground p-3 text-sm flex gap-2">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <div>
          <strong>{t("mockOtpHint")}</strong>
          <div className="text-xs opacity-80 mt-0.5">+91 {mobile}</div>
          {devCode && <div className="text-xs mt-1">Demo code: <span className="font-mono font-bold tracking-widest">{devCode}</span></div>}
        </div>
      </div>
      <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} maxLength={6} inputMode="numeric"
        placeholder="••••••" className="text-center text-lg tracking-widest" required />
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} {t("verifyOtp")}
      </Button>
    </form>
  );
}

/* -------------- Parent: email + Supabase OTP (free, built-in) -------------- */
function ParentEmailFlow({ captchaToken, onSuccess }: { captchaToken: string; onSuccess: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) { toast.error(t("captchaPlease")); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error(t("invalidEmail")); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      toast.success(t("emailOtpHint"));
      setStep("otp");
    } catch (err) {
      toast.error(friendlyAuthError(err, "Could not send code."));
    } finally { setLoading(false); }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(otp)) { toast.error(t("invalidOtp")); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "email" });
      if (error) throw error;
      const { data: u } = await supabase.auth.getUser();
      if (u.user) {
        await supabase.from("user_roles").upsert(
          { user_id: u.user.id, role: "parent" }, { onConflict: "user_id,role" }
        );
      }
      toast.success(t("welcomeBack"));
      onSuccess();
    } catch (err) {
      toast.error(friendlyAuthError(err, "Verification failed."));
    } finally { setLoading(false); }
  };

  if (step === "email") {
    return (
      <form onSubmit={sendOtp} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="pe">{t("fieldEmail")}</Label>
          <Input id="pe" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} {t("sendOtp")}
        </Button>
      </form>
    );
  }
  return (
    <form onSubmit={verifyOtp} className="space-y-3">
      <div className="rounded-md bg-accent text-accent-foreground p-3 text-sm">
        <Info className="h-4 w-4 inline mr-1" /> {t("emailOtpHint")} — <strong>{email}</strong>
      </div>
      <Input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} maxLength={6} inputMode="numeric"
        placeholder="••••••" className="text-center text-lg tracking-widest" required />
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} {t("verifyOtp")}
      </Button>
    </form>
  );
}

/* -------------- Staff: email + password + signup with profile -------------- */
function StaffPasswordFlow({ captchaToken, onSuccess }: { captchaToken: string; onSuccess: () => void }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [subRole, setSubRole] = useState<StaffSubRole>("teacher");
  const [klass, setKlass] = useState("");
  const [section, setSection] = useState("A");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) { toast.error(t("captchaPlease")); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error(t("invalidEmail")); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) throw new Error("Name required");
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { emailRedirectTo: window.location.origin, data: { name } },
        });
        if (error) throw error;
        const uid = data.user?.id;
        if (uid) {
          await supabase.from("user_roles").upsert({ user_id: uid, role: "staff" }, { onConflict: "user_id,role" });
          await supabase.from("staff").insert({
            user_id: uid, name: name.trim(), email, sub_role: subRole,
            assigned_class: klass || null, assigned_section: section || null,
          });
        }
        toast.success(t("accountCreated"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("welcomeBack"));
      }
      onSuccess();
    } catch (err) {
      toast.error(friendlyAuthError(err, "Sign-in failed."));
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {mode === "signup" && (
        <>
          <div className="space-y-2">
            <Label>{t("fieldName")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>{t("staffSubRole")}</Label>
            <Select value={subRole} onValueChange={(v) => setSubRole(v as StaffSubRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">{t("subTeacher")}</SelectItem>
                <SelectItem value="hod">{t("subHod")}</SelectItem>
                <SelectItem value="head">{t("subHead")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {subRole === "teacher" && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>{t("assignedClass")}</Label>
                <Input value={klass} onChange={(e) => setKlass(e.target.value)} placeholder="5" maxLength={4} />
              </div>
              <div className="space-y-2">
                <Label>{t("assignedSection")}</Label>
                <Input value={section} onChange={(e) => setSection(e.target.value.toUpperCase())} maxLength={2} />
              </div>
            </div>
          )}
        </>
      )}
      <div className="space-y-2">
        <Label>{t("fieldEmail")}</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>{t("fieldPassword")}</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
        {mode === "signin" ? t("signIn") : t("signUp")}
      </Button>
      <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="text-xs text-primary hover:underline w-full text-center">
        {mode === "signin" ? t("switchToSignUp") : t("switchToSignIn")}
      </button>
    </form>
  );
}
