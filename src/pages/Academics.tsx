import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/contexts/I18nContext";
import { BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Lang = "hi" | "en";

const SUBJECTS = [
  "subjHindi", "subjEnglish", "subjMath", "subjScience",
  "subjSocial", "subjSanskrit", "subjArt", "subjPE",
] as const;

// Class-wise syllabus per subject (concise topic list)
const SYLLABUS: Record<number, Record<typeof SUBJECTS[number], { hi: string[]; en: string[] }>> = {
  1: {
    subjHindi: { hi: ["वर्णमाला", "मात्राएँ", "सरल शब्द", "छोटी कहानियाँ"], en: ["Alphabet", "Vowel marks", "Simple words", "Short stories"] },
    subjEnglish: { hi: ["A–Z अक्षर", "ध्वनि", "रंग व संख्या", "तुकबन्दी"], en: ["A–Z letters", "Phonics", "Colours & numbers", "Rhymes"] },
    subjMath: { hi: ["1–100 तक गिनती", "जोड़-घटाव (1 अंक)", "आकृतियाँ"], en: ["Counting 1–100", "Addition/Subtraction (1 digit)", "Shapes"] },
    subjScience: { hi: ["हमारा शरीर", "पेड़-पौधे", "जानवर"], en: ["Our body", "Plants", "Animals"] },
    subjSocial: { hi: ["मेरा परिवार", "मेरा विद्यालय", "त्यौहार"], en: ["My family", "My school", "Festivals"] },
    subjSanskrit: { hi: ["वर्णमाला परिचय"], en: ["Alphabet intro"] },
    subjArt: { hi: ["रंग भरना", "सरल आकृतियाँ"], en: ["Colouring", "Simple shapes"] },
    subjPE: { hi: ["खेल व व्यायाम"], en: ["Games & exercise"] },
  },
  2: {
    subjHindi: { hi: ["संयुक्त अक्षर", "वाक्य रचना", "कविताएँ"], en: ["Conjunct letters", "Sentence formation", "Poems"] },
    subjEnglish: { hi: ["सरल वाक्य", "लिंग व वचन", "कहानियाँ"], en: ["Simple sentences", "Gender & number", "Short stories"] },
    subjMath: { hi: ["जोड़-घटाव (2 अंक)", "गुणा परिचय", "समय व पैसा"], en: ["Add/Subtract (2 digit)", "Intro to multiplication", "Time & money"] },
    subjScience: { hi: ["जल व वायु", "ऋतुएँ", "स्वच्छता"], en: ["Water & air", "Seasons", "Cleanliness"] },
    subjSocial: { hi: ["हमारा गाँव", "यातायात के साधन"], en: ["Our village", "Means of transport"] },
    subjSanskrit: { hi: ["शब्द व वाक्य"], en: ["Words & sentences"] },
    subjArt: { hi: ["चित्रकला", "हस्तकला"], en: ["Drawing", "Craft"] },
    subjPE: { hi: ["योग, दौड़"], en: ["Yoga, running"] },
  },
  3: {
    subjHindi: { hi: ["व्याकरण: संज्ञा सर्वनाम", "अनुच्छेद लेखन"], en: ["Grammar: noun, pronoun", "Paragraph writing"] },
    subjEnglish: { hi: ["Tenses परिचय", "Articles", "Reading"], en: ["Intro to tenses", "Articles", "Reading"] },
    subjMath: { hi: ["गुणा-भाग", "भिन्न परिचय", "मापन"], en: ["Multiplication & division", "Intro to fractions", "Measurement"] },
    subjScience: { hi: ["जीव-जंतु वर्गीकरण", "भोजन व पोषण"], en: ["Classification of life", "Food & nutrition"] },
    subjSocial: { hi: ["हमारा जिला", "बिहार परिचय"], en: ["Our district", "Intro to Bihar"] },
    subjSanskrit: { hi: ["सरल श्लोक"], en: ["Simple shlokas"] },
    subjArt: { hi: ["रंग-संयोजन"], en: ["Colour mixing"] },
    subjPE: { hi: ["कबड्डी, खो-खो"], en: ["Kabaddi, kho-kho"] },
  },
  4: {
    subjHindi: { hi: ["क्रिया, विशेषण", "पत्र लेखन"], en: ["Verb, adjective", "Letter writing"] },
    subjEnglish: { hi: ["Sentence types", "Story writing"], en: ["Sentence types", "Story writing"] },
    subjMath: { hi: ["बड़ी संख्याएँ", "दशमलव परिचय", "कोण व रेखा"], en: ["Large numbers", "Intro to decimals", "Angles & lines"] },
    subjScience: { hi: ["पदार्थ की अवस्थाएँ", "ऊर्जा परिचय"], en: ["States of matter", "Intro to energy"] },
    subjSocial: { hi: ["भारत परिचय", "स्वतंत्रता संग्राम"], en: ["Intro to India", "Freedom struggle"] },
    subjSanskrit: { hi: ["धातु व प्रत्यय परिचय"], en: ["Roots & suffixes"] },
    subjArt: { hi: ["प्राकृतिक चित्रण"], en: ["Nature drawing"] },
    subjPE: { hi: ["क्रिकेट, फुटबॉल"], en: ["Cricket, football"] },
  },
  5: {
    subjHindi: { hi: ["समास, अलंकार परिचय", "निबंध"], en: ["Samas, alankar intro", "Essays"] },
    subjEnglish: { hi: ["Active/Passive", "Comprehension"], en: ["Active/Passive", "Comprehension"] },
    subjMath: { hi: ["भिन्न व दशमलव", "क्षेत्रफल परिधि"], en: ["Fractions & decimals", "Area & perimeter"] },
    subjScience: { hi: ["सौरमंडल", "मानव शरीर तंत्र"], en: ["Solar system", "Human body systems"] },
    subjSocial: { hi: ["भारतीय इतिहास", "नक्शे"], en: ["Indian history", "Maps"] },
    subjSanskrit: { hi: ["कारक, लकार"], en: ["Karak, lakar"] },
    subjArt: { hi: ["सांस्कृतिक कला"], en: ["Cultural art"] },
    subjPE: { hi: ["एथलेटिक्स"], en: ["Athletics"] },
  },
  6: {
    subjHindi: { hi: ["रस, छंद", "कहानी लेखन"], en: ["Ras, chhand", "Story writing"] },
    subjEnglish: { hi: ["Tenses पूर्ण", "Essay"], en: ["All tenses", "Essay"] },
    subjMath: { hi: ["पूर्णांक", "बीजगणित परिचय", "ज्यामिति"], en: ["Integers", "Intro to algebra", "Geometry"] },
    subjScience: { hi: ["भौतिकी, रसायन, जीव विज्ञान परिचय"], en: ["Intro to Physics, Chemistry, Biology"] },
    subjSocial: { hi: ["प्राचीन भारत", "लोकतंत्र"], en: ["Ancient India", "Democracy"] },
    subjSanskrit: { hi: ["संधि, समास"], en: ["Sandhi, samas"] },
    subjArt: { hi: ["कैलिग्राफी"], en: ["Calligraphy"] },
    subjPE: { hi: ["टीम खेल"], en: ["Team sports"] },
  },
  7: {
    subjHindi: { hi: ["व्याकरण उन्नत", "निबंध व पत्र"], en: ["Advanced grammar", "Essay & letters"] },
    subjEnglish: { hi: ["Modals, reported speech"], en: ["Modals, reported speech"] },
    subjMath: { hi: ["परिमेय संख्याएँ", "समीकरण", "त्रिभुज"], en: ["Rational numbers", "Equations", "Triangles"] },
    subjScience: { hi: ["ऊष्मा, अम्ल-क्षार, श्वसन"], en: ["Heat, acids/bases, respiration"] },
    subjSocial: { hi: ["मध्यकालीन भारत", "संविधान"], en: ["Medieval India", "Constitution"] },
    subjSanskrit: { hi: ["अनुवाद अभ्यास"], en: ["Translation practice"] },
    subjArt: { hi: ["भारतीय चित्रकला"], en: ["Indian painting"] },
    subjPE: { hi: ["प्राथमिक चिकित्सा"], en: ["First aid"] },
  },
  8: {
    subjHindi: { hi: ["साहित्य, गद्य-पद्य", "रचनात्मक लेखन"], en: ["Literature, prose & poetry", "Creative writing"] },
    subjEnglish: { hi: ["Literature reader", "Formal writing"], en: ["Literature reader", "Formal writing"] },
    subjMath: { hi: ["वर्ग-वर्गमूल, घन", "रैखिक समीकरण", "क्षेत्रमिति"], en: ["Squares, cubes & roots", "Linear equations", "Mensuration"] },
    subjScience: { hi: ["बल, ध्वनि, धातु-अधातु, कोशिका"], en: ["Force, sound, metals/non-metals, cell"] },
    subjSocial: { hi: ["आधुनिक भारत", "अर्थव्यवस्था परिचय"], en: ["Modern India", "Intro to economy"] },
    subjSanskrit: { hi: ["श्लोक व्याख्या"], en: ["Shloka interpretation"] },
    subjArt: { hi: ["परियोजना कार्य"], en: ["Project work"] },
    subjPE: { hi: ["स्वास्थ्य व पोषण"], en: ["Health & nutrition"] },
  },
};

const Academics = () => {
  const { t, lang } = useI18n();
  const [activeClass, setActiveClass] = useState<number>(1);
  const classes = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="animate-fade-in">
      <section className="gradient-royal text-primary-foreground py-12 md:py-16">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{t("academicsHeading")}</h1>
          <p className="text-primary-foreground/80 mt-2">
            {lang === "hi" ? "कक्षा चुनकर पाठ्यक्रम देखें" : "Choose a class to view its syllabus"}
          </p>
        </div>
      </section>

      <section className="container px-4 py-12 md:py-16">
        <h2 className="text-2xl font-bold text-primary mb-4">{t("classesOffered")}</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-10">
          {classes.map((c) => {
            const active = activeClass === c;
            return (
              <button
                key={c}
                onClick={() => setActiveClass(c)}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-xl shadow-soft border-2 transition-all duration-200",
                  active
                    ? "gradient-saffron text-white border-secondary scale-105 shadow-glow"
                    : "bg-card text-foreground border-border hover:border-secondary hover:scale-105"
                )}
                aria-pressed={active}
              >
                <span className="text-2xl font-extrabold">{c}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">
                  {lang === "hi" ? "कक्षा" : "Class"}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeClass}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-secondary" />
                  {lang === "hi" ? `कक्षा ${activeClass} का पाठ्यक्रम` : `Class ${activeClass} Syllabus`}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {SUBJECTS.map((s) => {
                    const topics = SYLLABUS[activeClass][s][lang];
                    return (
                      <div key={s} className="rounded-lg border border-border bg-muted/30 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-secondary" />
                          <h4 className="font-semibold text-primary">{t(s)}</h4>
                        </div>
                        <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                          {topics.map((tp, i) => <li key={i}>{tp}</li>)}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
};

export default Academics;
