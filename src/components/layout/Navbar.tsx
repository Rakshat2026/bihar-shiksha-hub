import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Globe, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { LoginDialog } from "./LoginDialog";
import logo from "@/assets/logo.png";

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const loc = useLocation();

  const links: { to: string; key: Parameters<typeof t>[0] }[] = [
    { to: "/", key: "navHome" },
    { to: "/about", key: "navAbout" },
    { to: "/academics", key: "navAcademics" },
    { to: "/admissions", key: "navAdmissions" },
    { to: "/facilities", key: "navFacilities" },
    { to: "/gallery", key: "navGallery" },
    { to: "/notices", key: "navNotices" },
    { to: "/contact", key: "navContact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive ? "text-secondary bg-accent" : "text-foreground hover:text-primary hover:bg-muted"
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
              className="hidden sm:flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="h-4 w-4" />
              <span>{lang === "hi" ? "English" : "हिंदी"}</span>
            </button>

            {profile ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm font-medium text-primary flex items-center gap-1">
                  <UserIcon className="h-4 w-4" /> {profile.name.split(" ")[0]}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut} aria-label="logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="royal" size="sm" className="hidden sm:inline-flex" onClick={() => setLoginOpen(true)}>
                {t("login")}
              </Button>
            )}

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
          <div className="lg:hidden border-t border-border bg-background animate-fade-in">
            <nav className="container px-4 py-3 flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
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
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setLang(lang === "hi" ? "en" : "hi")}
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {lang === "hi" ? "English" : "हिंदी"}
                </Button>
                {profile ? (
                  <Button variant="outline" size="sm" className="flex-1" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-1" /> {t("logout")}
                  </Button>
                ) : (
                  <Button
                    variant="royal"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setMobileOpen(false);
                      setLoginOpen(true);
                    }}
                  >
                    {t("login")}
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
