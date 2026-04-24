import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/contexts/I18nContext";
import { BookOpen } from "lucide-react";

const Academics = () => {
  const { t, lang } = useI18n();

  const subjects = [
    "subjHindi", "subjEnglish", "subjMath", "subjScience",
    "subjSocial", "subjSanskrit", "subjArt", "subjPE",
  ] as const;

  const classes = Array.from({ length: 8 }, (_, i) => i + 1);

  return (
    <div className="animate-fade-in">
      <section className="gradient-royal text-primary-foreground py-12 md:py-16">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{t("academicsHeading")}</h1>
        </div>
      </section>

      <section className="container px-4 py-12 md:py-16 grid gap-8 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">{t("classesOffered")}</h2>
            <div className="grid grid-cols-4 gap-3">
              {classes.map((c) => (
                <div key={c} className="aspect-square flex flex-col items-center justify-center rounded-lg gradient-saffron text-white shadow-soft">
                  <span className="text-2xl font-extrabold">{c}</span>
                  <span className="text-[10px] uppercase tracking-wider">
                    {lang === "hi" ? "कक्षा" : "Class"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-4">{t("subjects")}</h2>
            <ul className="grid grid-cols-2 gap-3">
              {subjects.map((s) => (
                <li key={s} className="flex items-center gap-2 p-3 rounded-md bg-muted">
                  <BookOpen className="h-4 w-4 text-secondary shrink-0" />
                  <span className="font-medium text-sm">{t(s)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Academics;
