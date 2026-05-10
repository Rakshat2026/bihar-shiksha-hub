import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/contexts/I18nContext";
import { useToast } from "@/hooks/use-toast";
import { Quote, Star, GraduationCap } from "lucide-react";

type Alum = {
  name: string;
  batch: string;
  occupation: { hi: string; en: string };
  message: { hi: string; en: string };
  rating: number;
};

const FEATURED: Alum[] = [
  {
    name: "Ravi Kumar Jha",
    batch: "Batch of 2010",
    occupation: { hi: "सॉफ्टवेयर इंजीनियर, बेंगलुरु", en: "Software Engineer, Bengaluru" },
    message: {
      hi: "ज्ञान गंगा एकेडमी ने मेरी सोच की बुनियाद रखी। यहाँ मिले संस्कार आज भी मार्गदर्शक हैं।",
      en: "Gyan Ganga Academy laid the foundation of my thinking. The values I learned here still guide me.",
    },
    rating: 5,
  },
  {
    name: "Anita Mishra",
    batch: "Batch of 2012",
    occupation: { hi: "डॉक्टर (MBBS), पटना", en: "Doctor (MBBS), Patna" },
    message: {
      hi: "शिक्षकों का स्नेह और कठोर अनुशासन — दोनों ने मुझे डॉक्टर बनने की प्रेरणा दी।",
      en: "The teachers' affection and discipline both inspired me to become a doctor.",
    },
    rating: 5,
  },
  {
    name: "Sandeep Thakur",
    batch: "Batch of 2008",
    occupation: { hi: "बैंक प्रबंधक, मुंबई", en: "Bank Manager, Mumbai" },
    message: {
      hi: "गणित की बुनियाद यहीं से मजबूत हुई। आज भी विद्यालय आना घर आने जैसा लगता है।",
      en: "My math foundation was built here. Even today, visiting the school feels like coming home.",
    },
    rating: 4,
  },
  {
    name: "Priya Singh",
    batch: "Batch of 2015",
    occupation: { hi: "शिक्षिका, दरभंगा", en: "Teacher, Darbhanga" },
    message: {
      hi: "मैं स्वयं अब शिक्षिका हूँ — वही प्रेम बच्चों तक पहुँचाने का प्रयास करती हूँ।",
      en: "I am a teacher myself now — trying to pass on the same love to my students.",
    },
    rating: 5,
  },
];

const Alumni = () => {
  const { lang } = useI18n();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState<Alum[]>([]);
  const [form, setForm] = useState({ name: "", batch: "", occupation: "", message: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("gga_alumni");
      if (raw) setSubmitted(JSON.parse(raw));
    } catch {}
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.batch || !form.message) return;
    const next: Alum = {
      name: form.name,
      batch: form.batch,
      occupation: { hi: form.occupation, en: form.occupation },
      message: { hi: form.message, en: form.message },
      rating: 5,
    };
    const updated = [next, ...submitted];
    setSubmitted(updated);
    localStorage.setItem("gga_alumni", JSON.stringify(updated));
    setForm({ name: "", batch: "", occupation: "", message: "" });
    toast({
      title: lang === "hi" ? "धन्यवाद!" : "Thank you!",
      description: lang === "hi" ? "आपका संदेश दीवार पर जोड़ दिया गया।" : "Your message has been added to the wall.",
    });
  };

  const all = [...submitted, ...FEATURED];

  return (
    <div className="animate-fade-in">
      <section className="gradient-royal text-primary-foreground py-12 md:py-16">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {lang === "hi" ? "पूर्व विद्यार्थी" : "Alumni"}
          </h1>
          <p className="text-primary-foreground/80 mt-2 max-w-2xl mx-auto">
            {lang === "hi"
              ? "हमारे पूर्व विद्यार्थी ही हमारी असली पहचान हैं। उनकी कहानियाँ और संदेश यहाँ पढ़ें।"
              : "Our alumni are our true identity. Read their stories and messages below."}
          </p>
        </div>
      </section>

      <section className="container px-4 py-12 md:py-16">
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-secondary" />
          {lang === "hi" ? "हमारे गौरव" : "Our Pride"}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {all.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="h-full border-2 hover:border-secondary hover:shadow-glow transition-all">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-secondary/40 mb-2" />
                  <p className="text-sm italic text-foreground/90 mb-4">"{a.message[lang]}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="gradient-saffron text-white font-bold">
                        {a.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-primary truncate">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.occupation[lang]}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">{a.batch}</Badge>
                        <div className="flex">
                          {Array.from({ length: a.rating }).map((_, k) => (
                            <Star key={k} className="h-3 w-3 fill-secondary text-secondary" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 py-12 md:py-16">
        <div className="container px-4 max-w-2xl">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-2">
                {lang === "hi" ? "क्या आप भी पूर्व विद्यार्थी हैं?" : "Are you also an alumnus?"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {lang === "hi"
                  ? "अपना संदेश और अनुभव साझा करें — यह नए विद्यार्थियों को प्रेरित करेगा।"
                  : "Share your message and experience — it will inspire new students."}
              </p>
              <form onSubmit={submit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>{lang === "hi" ? "नाम" : "Name"}</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>{lang === "hi" ? "बैच (पासआउट वर्ष)" : "Batch (passing year)"}</Label>
                    <Input value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} placeholder="2018" required />
                  </div>
                </div>
                <div>
                  <Label>{lang === "hi" ? "वर्तमान कार्य / पेशा" : "Current occupation"}</Label>
                  <Input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
                </div>
                <div>
                  <Label>{lang === "hi" ? "आपका संदेश" : "Your message"}</Label>
                  <Textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                </div>
                <Button type="submit" className="gradient-royal text-primary-foreground">
                  {lang === "hi" ? "संदेश साझा करें" : "Share message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Alumni;
