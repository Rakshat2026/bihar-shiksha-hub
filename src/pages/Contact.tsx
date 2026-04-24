import { useState } from "react";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/contexts/I18nContext";
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  mobile: z.string().trim().regex(/^\d{10}$/, "10 digits required"),
  message: z.string().trim().min(1).max(1000),
});

const Contact = () => {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, mobile, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    // For now, just simulate success — full contact form storage can be added later
    setTimeout(() => {
      toast.success(t("enquirySuccess"));
      setName("");
      setMobile("");
      setMessage("");
      setLoading(false);
    }, 600);
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
          <h1 className="text-4xl md:text-5xl font-bold">{t("contactHeading")}</h1>
        </div>
      </section>

      <section className="container px-4 py-12 md:py-16 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {items.map((it, i) => (
            <Card key={i}>
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
            <iframe
              title="School map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=85.85%2C26.10%2C86.05%2C26.30&layer=mapnik&marker=26.20,85.95"
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        </div>

        <Card className="shadow-soft">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">{t("contactHeading")}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cname">{t("fieldName")}</Label>
                <Input id="cname" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cmob">{t("fieldMobile")}</Label>
                <Input
                  id="cmob"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cmsg">{t("fieldMessage")}</Label>
                <Textarea id="cmsg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={1000} />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {t("submitEnquiry")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Contact;
