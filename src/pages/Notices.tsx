import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/contexts/I18nContext";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Calendar } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  description: string;
  notice_date: string;
}

const Notices = () => {
  const { t, lang } = useI18n();
  const [notices, setNotices] = useState<Notice[] | null>(null);

  useEffect(() => {
    supabase
      .from("notices")
      .select("id, title, description, notice_date")
      .order("notice_date", { ascending: false })
      .then(({ data }) => setNotices((data as Notice[]) ?? []));
  }, []);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="animate-fade-in">
      <section className="gradient-royal text-primary-foreground py-12 md:py-16">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold flex items-center justify-center gap-3">
            <Bell className="h-10 w-10" /> {t("noticesHeading")}
          </h1>
        </div>
      </section>

      <section className="container px-4 py-12 md:py-16 max-w-3xl">
        {notices === null ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("noNotices")}</p>
        ) : (
          <ul className="space-y-4">
            {notices.map((n) => (
              <li key={n.id}>
                <Card className="border-l-4 border-l-secondary hover:shadow-soft transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-xs text-secondary font-semibold mb-2">
                      <Calendar className="h-3.5 w-3.5" /> {fmt(n.notice_date)}
                    </div>
                    <h2 className="font-bold text-lg text-primary mb-1">{n.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {n.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Notices;
