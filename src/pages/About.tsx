import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/contexts/I18nContext";
import { History, User, MessageSquareQuote, Target, Eye, Award } from "lucide-react";

const About = () => {
  const { t } = useI18n();

  const blocks = [
    { icon: History, titleKey: "history" as const, textKey: "historyText" as const },
    { icon: User, titleKey: "founder" as const, textKey: "founderText" as const },
    { icon: MessageSquareQuote, titleKey: "principalMsg" as const, textKey: "principalText" as const },
    { icon: Target, titleKey: "mission" as const, textKey: "missionText" as const },
    { icon: Eye, titleKey: "vision" as const, textKey: "visionText" as const },
    { icon: Award, titleKey: "affiliation" as const, textKey: "affiliationText" as const },
  ];

  return (
    <div className="animate-fade-in">
      <section className="gradient-royal text-primary-foreground py-12 md:py-16">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{t("aboutHeading")}</h1>
          <p className="text-primary-foreground/80">{t("schoolName")}</p>
        </div>
      </section>

      <section className="container px-4 py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {blocks.map((b, i) => (
            <Card key={i} className="border-l-4 border-l-secondary hover:shadow-soft transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-lg gradient-saffron text-white">
                    <b.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-primary mb-2">{t(b.titleKey)}</h2>
                    <p className="text-muted-foreground leading-relaxed">{t(b.textKey)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
