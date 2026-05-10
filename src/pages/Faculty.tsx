import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/contexts/I18nContext";
import { GraduationCap, Mail, BookOpen } from "lucide-react";

type Person = {
  name: { hi: string; en: string };
  role: { hi: string; en: string };
  subject?: { hi: string; en: string };
  bio: { hi: string; en: string };
  email?: string;
  highlight?: boolean;
};

const PRINCIPAL: Person = {
  name: { hi: "श्री हेमन्त कुमार झा", en: "Shri Hemant Kumar Jha" },
  role: { hi: "संस्थापक एवं प्रधानाचार्य", en: "Founder & Principal" },
  bio: {
    hi: "चार दशकों से अधिक का शिक्षण अनुभव। 1983 में ज्ञान गंगा एकेडमी की स्थापना कर ग्रामीण बच्चों तक गुणवत्तापूर्ण शिक्षा पहुँचाने का कार्य कर रहे हैं।",
    en: "Over four decades of teaching experience. Founded Gyan Ganga Academy in 1983 with a vision to bring quality education to rural children.",
  },
  email: "principal@gyanganga.edu.in",
  highlight: true,
};

const STAFF: Person[] = [
  {
    name: { hi: "श्रीमती सुनीता झा", en: "Mrs. Sunita Jha" },
    role: { hi: "उप-प्रधानाचार्या (HOD)", en: "Vice Principal (HOD)" },
    subject: { hi: "हिंदी एवं संस्कृत", en: "Hindi & Sanskrit" },
    bio: { hi: "20+ वर्षों का अध्यापन अनुभव।", en: "20+ years of teaching experience." },
  },
  {
    name: { hi: "श्री राजेश कुमार", en: "Mr. Rajesh Kumar" },
    role: { hi: "वरिष्ठ शिक्षक", en: "Senior Teacher" },
    subject: { hi: "गणित", en: "Mathematics" },
    bio: { hi: "M.Sc. Mathematics, B.Ed.। प्रतियोगी परीक्षा प्रशिक्षक।", en: "M.Sc. Mathematics, B.Ed. Competitive exam mentor." },
  },
  {
    name: { hi: "श्रीमती कविता मिश्रा", en: "Mrs. Kavita Mishra" },
    role: { hi: "शिक्षिका", en: "Teacher" },
    subject: { hi: "विज्ञान", en: "Science" },
    bio: { hi: "M.Sc. विज्ञान। प्रयोगात्मक शिक्षण में विशेषज्ञता।", en: "M.Sc. Science. Specialist in hands-on learning." },
  },
  {
    name: { hi: "श्री अमित ठाकुर", en: "Mr. Amit Thakur" },
    role: { hi: "शिक्षक", en: "Teacher" },
    subject: { hi: "अंग्रेजी", en: "English" },
    bio: { hi: "M.A. English। संचार कौशल पर बल।", en: "M.A. English. Focus on communication skills." },
  },
  {
    name: { hi: "श्रीमती पूजा देवी", en: "Mrs. Pooja Devi" },
    role: { hi: "शिक्षिका", en: "Teacher" },
    subject: { hi: "सामाजिक विज्ञान", en: "Social Studies" },
    bio: { hi: "M.A. इतिहास। कहानी-शैली में अध्यापन।", en: "M.A. History. Storytelling approach to teaching." },
  },
  {
    name: { hi: "श्री संजीव झा", en: "Mr. Sanjeev Jha" },
    role: { hi: "खेल शिक्षक", en: "Sports Coach" },
    subject: { hi: "शारीरिक शिक्षा", en: "Physical Education" },
    bio: { hi: "राज्य स्तरीय कबड्डी खिलाड़ी।", en: "State-level kabaddi player." },
  },
  {
    name: { hi: "श्रीमती मीरा कुमारी", en: "Mrs. Meera Kumari" },
    role: { hi: "कला शिक्षिका", en: "Art Teacher" },
    subject: { hi: "कला एवं शिल्प", en: "Art & Craft" },
    bio: { hi: "मधुबनी कला प्रशिक्षक।", en: "Madhubani art trainer." },
  },
  {
    name: { hi: "श्री विकास पाण्डेय", en: "Mr. Vikas Pandey" },
    role: { hi: "कंप्यूटर शिक्षक", en: "Computer Teacher" },
    subject: { hi: "डिजिटल साक्षरता", en: "Digital Literacy" },
    bio: { hi: "BCA, बुनियादी कंप्यूटिंग विशेषज्ञ।", en: "BCA, basic computing specialist." },
  },
];

const initials = (name: string) =>
  name.replace(/^(श्री|श्रीमती|Mr\.?|Mrs\.?|Ms\.?)\s+/i, "").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const PersonCard = ({ p, lang }: { p: Person; lang: "hi" | "en" }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
    className={p.highlight ? "md:col-span-2 lg:col-span-3" : ""}
  >
    <Card className={`h-full border-2 ${p.highlight ? "border-secondary shadow-glow" : "hover:border-secondary"} transition-colors`}>
      <CardContent className={`p-6 ${p.highlight ? "md:flex md:items-center md:gap-6" : "text-center"}`}>
        <div className={`flex ${p.highlight ? "justify-center md:justify-start" : "justify-center"} mb-4 md:mb-0`}>
          <Avatar className={`${p.highlight ? "h-32 w-32" : "h-24 w-24"} ring-4 ring-secondary/30`}>
            <AvatarFallback className="gradient-saffron text-white text-2xl font-bold">
              {initials(p.name.en)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className={p.highlight ? "md:flex-1" : ""}>
          <h3 className={`font-bold text-primary ${p.highlight ? "text-2xl" : "text-lg"}`}>{p.name[lang]}</h3>
          <Badge variant="secondary" className="mt-1 mb-2">{p.role[lang]}</Badge>
          {p.subject && (
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
              {!p.highlight && <BookOpen className="h-3.5 w-3.5" />}
              <span>{p.subject[lang]}</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-2">{p.bio[lang]}</p>
          {p.email && (
            <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1 mt-3 text-sm text-secondary hover:underline">
              <Mail className="h-3.5 w-3.5" /> {p.email}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const Faculty = () => {
  const { lang } = useI18n();
  return (
    <div className="animate-fade-in">
      <section className="gradient-royal text-primary-foreground py-12 md:py-16">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {lang === "hi" ? "हमारे शिक्षक" : "Our Faculty"}
          </h1>
          <p className="text-primary-foreground/80 mt-2">
            {lang === "hi" ? "समर्पित और अनुभवी शिक्षण मंडल" : "A dedicated and experienced teaching team"}
          </p>
        </div>
      </section>

      <section className="container px-4 py-12 md:py-16">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-secondary" />
            {lang === "hi" ? "प्रधानाचार्य" : "Principal"}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PersonCard p={PRINCIPAL} lang={lang} />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-secondary" />
            {lang === "hi" ? "शिक्षण मंडल" : "Teaching Staff"}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STAFF.map((p, i) => <PersonCard key={i} p={p} lang={lang} />)}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Faculty;
