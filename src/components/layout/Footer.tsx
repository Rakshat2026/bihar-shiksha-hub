import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import logo from "@/assets/logo.png";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="bg-primary text-primary-foreground mt-16">
      <div className="container px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={logo} alt="logo" width={40} height={40} className="h-10 w-10 object-contain bg-white rounded-md p-1" />
            <div className="font-bold">{t("schoolName")}</div>
          </div>
          <p className="text-sm text-primary-foreground/80">{t("tagline")}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-secondary">{t("quickLinks")}</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-secondary transition-colors">{t("navAbout")}</Link></li>
            <li><Link to="/academics" className="hover:text-secondary transition-colors">{t("navAcademics")}</Link></li>
            <li><Link to="/admissions" className="hover:text-secondary transition-colors">{t("navAdmissions")}</Link></li>
            <li><Link to="/notices" className="hover:text-secondary transition-colors">{t("navNotices")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-secondary">{t("contactHeading")}</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /><span>{t("addressFull")}</span></li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0" /><span>+91 98765 43210</span></li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0" /><span>info@gyangangaacademy.in</span></li>
            <li className="flex gap-2"><Clock className="h-4 w-4 mt-0.5 shrink-0" /><span>{t("hoursVal")}</span></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-secondary">{t("schoolLocation")}</h3>
          <div className="aspect-video rounded-md overflow-hidden border border-primary-foreground/20">
            <iframe
              title="School location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=85.85%2C26.10%2C86.05%2C26.30&layer=mapnik&marker=26.20,85.95"
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20">
        <div className="container px-4 py-4 text-center text-sm text-primary-foreground/80">
          © {year} {t("schoolName")} — {t("rightsReserved")}
        </div>
      </div>
    </footer>
  );
}
