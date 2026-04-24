import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, BookOpen, Heart, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/contexts/I18nContext";
import hero from "@/assets/hero-school.jpg";

const Index = () => {
  const { t } = useI18n();

  const features = [
    { icon: GraduationCap, titleKey: "feat1Title" as const, descKey: "feat1Desc" as const },
    { icon: BookOpen, titleKey: "feat2Title" as const, descKey: "feat2Desc" as const },
    { icon: Heart, titleKey: "feat3Title" as const, descKey: "feat3Desc" as const },
    { icon: IndianRupee, titleKey: "feat4Title" as const, descKey: "feat4Desc" as const },
  ];

  return (
    <div className="animate-fade-in">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={hero}
            alt="Students of Gyan Ganga Academy in classroom"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 gradient-hero opacity-90" />
        </div>
        <div className="relative container px-4 py-20 md:py-28 text-white">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-sm font-medium mb-4">
              {t("schoolLocation")} • Since 1983
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4">
              {t("schoolName")}
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-secondary mb-3">
              "{t("tagline")}"
            </p>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/admissions">
                  {t("ctaAdmission")} <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outlineLight" size="lg">
                <Link to="/about">{t("ctaLearn")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container px-4 py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">{t("whyUs")}</h2>
          <div className="w-20 h-1 bg-secondary mx-auto rounded-full" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Card key={i} className="border-2 hover:border-secondary hover:shadow-glow transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl gradient-saffron text-white mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-lg text-primary mb-2">{t(f.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(f.descKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="gradient-royal text-primary-foreground">
        <div className="container px-4 py-12 md:py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {t("ctaAdmission")} 2025-26
          </h2>
          <p className="text-primary-foreground/90 mb-6 max-w-xl mx-auto">
            {t("admissionIntro")}
          </p>
          <Button asChild variant="hero" size="lg">
            <Link to="/admissions">
              {t("ctaAdmission")} <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
