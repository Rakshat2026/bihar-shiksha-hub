import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/contexts/I18nContext";
import { School, BookMarked, Trophy, Droplet, Sparkles, Monitor } from "lucide-react";

const Facilities = () => {
  const { t } = useI18n();
  const items = [
    { icon: School, titleKey: "fac1" as const, descKey: "fac1d" as const },
    { icon: BookMarked, titleKey: "fac2" as const, descKey: "fac2d" as const },
    { icon: Trophy, titleKey: "fac3" as const, descKey: "fac3d" as const },
    { icon: Droplet, titleKey: "fac4" as const, descKey: "fac4d" as const },
    { icon: Sparkles, titleKey: "fac5" as const, descKey: "fac5d" as const },
    { icon: Monitor, titleKey: "fac6" as const, descKey: "fac6d" as const },
  ];

  return (
    <div className="animate-fade-in">
      <section className="gradient-royal text-primary-foreground py-12 md:py-16">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">{t("facilitiesHeading")}</h1>
        </div>
      </section>

      <section className="container px-4 py-12 md:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Card key={i} className="hover:shadow-glow hover:-translate-y-1 transition-all duration-300 border-2 hover:border-secondary">
              <CardContent className="p-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl gradient-saffron text-white mb-4">
                  <it.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-lg text-primary mb-2">{t(it.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(it.descKey)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Facilities;
