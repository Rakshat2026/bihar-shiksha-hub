import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle2, Sparkles } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2, "Student name is required").max(120),
  parent_name: z.string().trim().min(2, "Parent / guardian name is required").max(120),
  mobile_number: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().trim().email("Enter a valid email").max(180),
  address: z.string().trim().min(5, "Address is required").max(500),
  class_applied: z.string().min(1, "Please select a class"),
  previous_school: z.string().trim().max(180).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

const Admissions = () => {
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "", parent_name: "", mobile_number: "", email: "",
    address: "", class_applied: "", previous_school: "", message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please review the form");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("enquiries").insert({
        name: parsed.data.name,
        parent_name: parsed.data.parent_name,
        mobile_number: parsed.data.mobile_number,
        email: parsed.data.email,
        address: parsed.data.address,
        class_applied: parsed.data.class_applied,
        previous_school: parsed.data.previous_school || null,
        message: parsed.data.message || null,
        role: "parent",
      });
      if (error) throw error;
      setSubmitted(true);
      setForm({ name: "", parent_name: "", mobile_number: "", email: "", address: "", class_applied: "", previous_school: "", message: "" });
    } catch (err: any) {
      toast.error(err?.message ?? "Could not submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="relative overflow-hidden gradient-hero text-primary-foreground py-16 md:py-24">
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-nav-glow)" }} />
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="container relative px-4 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark text-sm mb-4">
            <Sparkles className="h-4 w-4 text-secondary" />
            <span>Admissions open · 2026 – 2027</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-3">Admission Enquiry</h1>
          <p className="text-lg md:text-xl text-primary-foreground/85 max-w-2xl mx-auto">
            Share a few details and our admissions team will reach out personally — no account required.
          </p>
        </motion.div>
      </section>

      <section className="container px-4 py-12 md:py-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <Card className="border-0 shadow-elevated">
            <CardContent className="p-6 md:p-10">
              {submitted ? (
                <div className="text-center py-10">
                  <div className="mx-auto w-16 h-16 rounded-full gradient-emerald flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-tertiary-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Enquiry received</h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Thank you. Our admissions team will contact you within 1–2 working days.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>Submit another enquiry</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Student full name *</Label>
                      <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={120} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent_name">Parent / guardian name *</Label>
                      <Input id="parent_name" value={form.parent_name} onChange={(e) => update("parent_name", e.target.value)} maxLength={120} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mobile">Mobile number *</Label>
                      <Input id="mobile" inputMode="tel" placeholder="10-digit number" value={form.mobile_number}
                        onChange={(e) => update("mobile_number", e.target.value.replace(/\D/g, "").slice(0, 10))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} maxLength={180} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Full address *</Label>
                    <Textarea id="address" rows={2} value={form.address} onChange={(e) => update("address", e.target.value)} maxLength={500} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="class">Class applying for *</Label>
                      <Select value={form.class_applied} onValueChange={(v) => update("class_applied", v)}>
                        <SelectTrigger id="class"><SelectValue placeholder="Select class" /></SelectTrigger>
                        <SelectContent>
                          {["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)].map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prev">Previous school</Label>
                      <Input id="prev" value={form.previous_school} onChange={(e) => update("previous_school", e.target.value)} maxLength={180} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message / query</Label>
                    <Textarea id="message" rows={4} value={form.message} onChange={(e) => update("message", e.target.value)} maxLength={1000} />
                  </div>
                  <Button type="submit" size="lg" className="w-full gradient-royal text-primary-foreground hover:opacity-95" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    Submit Enquiry
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    This form is for enquiries only — it does not create a login account.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
};

export default Admissions;
