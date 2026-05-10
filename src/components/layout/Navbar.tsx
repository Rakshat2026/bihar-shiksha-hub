import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Globe, GraduationCap, ShieldCheck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/contexts/I18nContext";
import logo from "@/assets/logo.png";

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links: { to: string; key: Parameters<typeof t>[0] }[] = [
    { to: "/", key: "navHome" },
    { to: "/about", key: "navAbout" },
    { to: "/academics", key: "navAcademics" },
    { to: "/admissions", key: "navAdmissions" },
    { to: "/facilities", key: "navFacilities" },
    { to: "/faculty", key: "navFaculty" },
    { to: "/gallery", key: "navGallery" },
    { to: "/alumni", key: "navAlumni" },
    { to: "/notices", key: "navNotices" },
    { to: "/contact", key: "navContact" },
  ];

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setMobileOpen(false)}>
          <img src={logo} alt="Gyan Ganga Academy logo" width={40} height={40} className="h-10 w-10 object-contain" />
          <div className="hidden sm:block leading-tight">
            <div className="font-bold text-primary text-base">{t("schoolName")}</div>
            <div className="text-[10px] text-muted-foreground">{t("schoolLocation")}</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive ? "text-secondary bg-accent" : "text-foreground/80 hover:text-primary hover:bg-muted"
                }`
              }
            >
              {t(l.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "hi" ? "en" : "hi")}
            className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{lang === "hi" ? "EN" : "हिं"}</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="hidden sm:inline-flex gradient-royal text-primary-foreground hover:opacity-95">
                Portal Login <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/connect/login" className="flex items-center gap-2 cursor-pointer">
                  <GraduationCap className="h-4 w-4 text-tertiary" />
                  <div>
                    <div className="font-medium">Student Connect</div>
                    <div className="text-xs text-muted-foreground">Students & parents</div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/staff/login" className="flex items-center gap-2 cursor-pointer">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">Staff Portal</div>
                    <div className="text-xs text-muted-foreground">Teachers, HOD, Head</div>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className="lg:hidden p-2 rounded-md hover:bg-muted"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="lg:hidden border-t border-border bg-background">
          <nav className="container px-4 py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                    isActive ? "text-secondary bg-accent" : "text-foreground hover:bg-muted"
                  }`
                }
              >
                {t(l.key)}
              </NavLink>
            ))}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t">
              <Button asChild variant="outline" size="sm" onClick={() => setMobileOpen(false)}>
                <Link to="/connect/login"><GraduationCap className="h-4 w-4 mr-1" /> Student</Link>
              </Button>
              <Button asChild size="sm" className="gradient-royal text-primary-foreground" onClick={() => setMobileOpen(false)}>
                <Link to="/staff/login"><ShieldCheck className="h-4 w-4 mr-1" /> Staff</Link>
              </Button>
              <Button variant="outline" size="sm" className="col-span-2" onClick={() => setLang(lang === "hi" ? "en" : "hi")}>
                <Globe className="h-4 w-4 mr-1" />{lang === "hi" ? "English" : "हिंदी"}
              </Button>
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
