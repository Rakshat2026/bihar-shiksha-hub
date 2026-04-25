import { useState } from "react";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LoginDialog } from "@/components/layout/LoginDialog";
import { toast } from "sonner";
import { Loader2, Send, Lock, CheckCircle2 } from "lucide-react";
import { friendlyAuthError } from "@/lib/errors";

const enquirySchema = z.object({
  class_applied: z.string().min(1, "Class is required"),
  message: z.string().max(1000).optional(),
});

const Admissions = () => {
  const { t } = useI18n();
  const { profile, user } = useAuth();
  const [classApplied, setClassApplied] = useState("");
  const [role, setRole] = useState<"student" | "parent">(profile?.role ?? "student");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error(t("loginRequired"));
      setLoginOpen(true);
      return;
    }
    const parsed = enquirySchema.safeParse({ class_applied: classApplied, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("enquiries").insert({
        user_id: user.id,
        name: profile.name,
        mobile_number: profile.mobile_number,
        role,
        class_applied: classApplied,
        message: message.trim() || null,
      });
      if (error) throw error;
      setSubmitted(true);
      setClassApplied("");
      setMessage("");
      toast.success(t("enquirySuccess"));
    } catch (err) {
      toast.error(friendlyAuthError(err, "Could not submit your enquiry. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <section className="gradient-royal text-primary-foreground py-12 md:py-16">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{t("admissionsHeading")}</h1>
          <p className="text-primary-foreground/85 max-w-2xl mx-auto">{t("admissionIntro")}</p>
        </div>
      </section>

      <section className="container px-4 py-12 md:py-16 max-w-2xl">
        <Card className="shadow-soft">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">{t("enquiryForm")}</h2>

            {submitted && (
              <div className="mb-6 p-4 rounded-md bg-accent border border-secondary/30 text-accent-foreground flex gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-secondary" />
                <div className="font-medium">{t("enquirySuccess")}</div>
              </div>
            )}

            {!profile ? (
              <div className="text-center py-8">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">{t("loginRequired")}</p>
                <Button variant="royal" size="lg" onClick={() => setLoginOpen(true)}>
                  {t("login")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("fieldName")}</Label>
                    <Input value={profile.name} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("fieldMobile")}</Label>
                    <Input value={`+91 ${profile.mobile_number}`} readOnly className="bg-muted" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("fieldRole")}</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={(v) => setRole(v as "student" | "parent")}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="student" id="ar-student" />
                      <Label htmlFor="ar-student" className="cursor-pointer">{t("roleStudent")}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="parent" id="ar-parent" />
                      <Label htmlFor="ar-parent" className="cursor-pointer">{t("roleParent")}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">{t("fieldClass")}</Label>
                  <Select value={classApplied} onValueChange={setClassApplied}>
                    <SelectTrigger id="class"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((c) => (
                        <SelectItem key={c} value={`Class ${c}`}>Class {c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t("fieldMessage")}</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {t("submitEnquiry")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  );
};

export default Admissions;
