import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, KeyRound, UserPlus, Loader2, Info } from "lucide-react";
import { friendlyAuthError } from "@/lib/errors";

type Step = "mobile" | "otp" | "profile";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: Props) {
  const { t } = useI18n();
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "parent">("student");
  const [loading, setLoading] = useState(false);
  // Only populated in mock-OTP mode (no SMS provider configured) so the user
  // can actually log in during the prototype phase. In production this stays empty.
  const [devCode, setDevCode] = useState<string | null>(null);

  const reset = () => {
    setStep("mobile");
    setMobile("");
    setOtp("");
    setName("");
    setRole("student");
    setLoading(false);
    setDevCode(null);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = mobile.replace(/\D/g, "");
    if (cleaned.length !== 10) {
      toast.error(t("invalidMobile"));
      return;
    }
    setMobile(cleaned);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("auth-otp", {
        body: { action: "request", mobile: cleaned },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDevCode(typeof data?.dev_code === "string" ? data.dev_code : null);
      setStep("otp");
      toast.success(t("mockOtpHint"));
    } catch (err) {
      toast.error(friendlyAuthError(err, "Could not send code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[0-9]{6}$/.test(otp)) {
      toast.error(t("invalidOtp"));
      return;
    }
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

      if (isNew) {
        // New account — collect profile details before closing.
        setStep("profile");
      } else {
        toast.success(t("welcomeBack"));
        await refreshProfile();
        handleClose(false);
      }
    } catch (err) {
      toast.error(friendlyAuthError(err, "Verification failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Not authenticated");

      const { error } = await supabase.from("profiles").insert({
        user_id: uid,
        name: name.trim(),
        mobile_number: mobile,
        role,
      });
      if (error) throw error;
      toast.success(t("accountCreated"));
      await refreshProfile();
      handleClose(false);
    } catch (err) {
      toast.error(friendlyAuthError(err, "Could not save profile. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">{t("loginHeading")}</DialogTitle>
          <DialogDescription>{t("loginIntro")}</DialogDescription>
        </DialogHeader>

        {step === "mobile" && (
          <form onSubmit={handleSendOtp} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="mobile">{t("fieldMobile")}</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 rounded-md border border-input bg-muted text-sm font-medium">+91</div>
                <Input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder="9876543210"
                  required
                />
              </div>
            </div>
            <Button type="submit" variant="royal" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />}
              {t("sendOtp")}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 mt-2">
            <div className="rounded-md bg-accent text-accent-foreground p-3 text-sm flex gap-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <strong>{t("mockOtpHint")}</strong>
                <div className="text-xs opacity-80 mt-0.5">+91 {mobile}</div>
                {devCode && (
                  <div className="text-xs mt-1">
                    Demo code: <span className="font-mono font-bold tracking-widest">{devCode}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">{t("enterOtp")}</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="text-center text-lg tracking-widest"
                required
              />
            </div>
            <Button type="submit" variant="royal" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {t("verifyOtp")}
            </Button>
          </form>
        )}

        {step === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("fieldName")}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>{t("fieldRole")}</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as "student" | "parent")} className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="student" id="r-student" />
                  <Label htmlFor="r-student" className="cursor-pointer">{t("roleStudent")}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="parent" id="r-parent" />
                  <Label htmlFor="r-parent" className="cursor-pointer">{t("roleParent")}</Label>
                </div>
              </RadioGroup>
            </div>
            <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {t("saveProfile")}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
