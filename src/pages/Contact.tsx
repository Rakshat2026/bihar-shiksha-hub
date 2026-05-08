import { useState } from "react";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Mail, Clock, Send, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  category: z.enum(["academic", "infrastructure", "staff", "transport", "safety", "other"]),
  message: z.string().trim().min(5).max(2000),
});

const Contact = () => {
  const { t } = useI18n();
  const [category, setCategory] = useState<"academic" | "infrastructure" | "staff" | "transport" | "safety" | "other">("academic");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ category, message });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Invalid input"); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from("complaints").insert({ category, message: message.trim() });
      if (error) throw error;
      toast.success(t("complaintSent"));
      setMessage("");
      setCategory("academic");
    } catch (err) {
      console.error(err);
      toast.error("Could not send. Please try again.");
    } finally { setLoading(false); }
  };

  const items = [
    { icon: MapPin, label: t("address"), value: t("addressFull") },
    { icon: Phone, label: t("phone"), value: "+91 99319 14858" },
    { icon: Mail, label: t("email"), value: "info@gyangangaacademy.in" },
    { icon: Clock, label: t("hours"), value: t("hoursVal") },
  ];

  return (
    <div className="animate-fade-in">
      <section className="gradient-royal text-primary-foreground py-12 md:py-16">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-display">{t("contactHeading")}</h1>
          <p className="text-primary-foreground/85 mt-3 max-w-2xl mx-auto">{t("contactIntro")}</p>
        </div>
      </section>

      <section className="container px-4 py-12 md:py-16 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {items.map((it, i) => (
            <Card key={i} className="shadow-card">
              <CardContent className="p-5 flex gap-4 items-start">
                <div className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-lg gradient-saffron text-white">
                  <it.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-primary">{it.label}</div>
                  <div className="text-sm text-muted-foreground">{it.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="aspect-video rounded-xl overflow-hidden border border-border shadow-soft">
            <iframe title="School map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=85.85%2C26.10%2C86.05%2C26.30&layer=mapnik&marker=26.20,85.95"
              className="w-full h-full" loading="lazy" />
          </div>
        </div>

        <Card className="shadow-soft">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-2 text-tertiary mb-4">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium">{t("contactIntro")}</span>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("complaintCategory")}</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">{t("catAcademic")}</SelectItem>
                    <SelectItem value="infrastructure">{t("catInfra")}</SelectItem>
                    <SelectItem value="staff">{t("catStaffCat")}</SelectItem>
                    <SelectItem value="transport">{t("catTransport")}</SelectItem>
                    <SelectItem value="safety">{t("catSafety")}</SelectItem>
                    <SelectItem value="other">{t("catOther")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("complaintMessage")}</Label>
                <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={2000} />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {t("submitComplaint")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Contact;
