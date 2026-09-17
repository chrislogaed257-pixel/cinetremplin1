import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/hooks/useProfile";
import { useOrgContext, useUnread } from "@/hooks/useOrg";
import { PositionSwitcher } from "@/components/PositionSwitcher";
import { NotificationsBell } from "@/components/NotificationsBell";
import { PasswordGate } from "@/components/PasswordGate";
import { usePrefs } from "@/lib/prefs";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ReactNode } from "react";
import { GlobalSearch } from "@/components/GlobalSearch";

export function AppLayout({ children, title }: { children: ReactNode; title: string }) {
  const { data: me } = useMe();
  const org = useOrgContext();
  const unread = useUnread(org.myId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { lang, setLang, theme, setTheme, t } = usePrefs();
  const [menuOpen, setMenuOpen] = useState(false);

  let nav: { to: string; label: string; icon: string }[] = [
    { to: "/dashboard", label: "Tableau de bord", icon: "📋" },
    { to: "/taches", label: "Mes tâches", icon: "🎬" },
    { to: "/rapports", label: "Rapports", icon: "📝" },
    { to: "/conges", label: "Mes congés", icon: "🌴" },
    { to: "/equipes", label: "Équipes", icon: "🎥" },
    { to: "/organigramme", label: "Organigramme", icon: "🎞️" },
    { to: "/ressources", label: "Liens & documents", icon: "📎" },
    { to: "/discussion", label: "Discussions", icon: "💬" },
    { to: "/messagerie", label: "Messagerie", icon: "✉️" },
  ];
  if (org.canSeeIdeas) {
    nav.push({ to: "/idees", label: "Idées & projets", icon: "💡" });
  }
  if (org.canAccounting) nav.push({ to: "/comptabilite", label: "Comptabilité", icon: "💰" });
  if (
    me?.isAdmin ||
    org.myBasePositions.includes("Producteur général") ||
    org.myBasePositions.includes("Producteur délégué")
  )
    nav.push({ to: "/mot-de-passe", label: "Mot de passe oublié", icon: "🔑" });
  nav.push({ to: "/analyse", label: "Analyse de travail", icon: "📊" });
  nav.push({ to: "/contrats", label: "Contrats", icon: "📄" });
  nav.push({ to: "/feuille-de-service", label: "Feuille de service", icon: "🗓️" });
  nav.push({ to: "/festivals", label: "Festivals", icon: "🏆" });
  nav.push({ to: "/vote", label: "Vote", icon: "🗳️" });
  nav.push({ to: "/casting", label: "Casting", icon: "🎭" });
  if (me?.isAdmin || org.isDeputy || org.myBasePositions.includes("Producteur général"))
    nav.push({ to: "/mentors", label: "Mentors externes", icon: "🎓" });
  if (me?.isAdmin || org.myBasePositions.includes("Producteur général"))
    nav.push({ to: "/journal", label: "Journal d'activité", icon: "🗒️" });
  if (me?.isAdmin) nav.push({ to: "/modifications", label: "Modifications", icon: "⚙️" });
  if (org.isMentor && !me?.isAdmin) nav = [{ to: "/mentor", label: "Espace mentor", icon: "🎓" }];
  if (org.isFunder && !me?.isAdmin)
    nav = [{ to: "/espace-bailleur", label: "Mon espace bailleur", icon: "💰" }];

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  function switchLang(next: "fr" | "en") {
    if (next === lang) return;
    setLang(next);
    toast.success(next === "en" ? "Language switched to English." : "Langue changée en français.");
  }

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <aside className="border-b border-border lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-4 py-3">
          <img
            src={logo}
            alt="Club Ciné Tremplin"
            className="h-10 w-10 rounded object-contain"
          />
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary">CLUB CINÉ TREMPLIN</p>
            <p className="text-xs text-muted-foreground">🎬 On apprend, on tourne, on décolle</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            ☰
          </Button>
        </div>
        <nav
          className={`${menuOpen ? "flex" : "hidden"} flex-wrap gap-1 px-2 pb-3 lg:flex lg:flex-col lg:flex-nowrap`}
        >
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors ${
                pathname === item.to
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              <span>{t(item.label)}</span>
              {item.to === "/messagerie" && unread.directTotal > 0 && (
                <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {unread.directTotal}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="border-b border-border">
          <div className="flex flex-wrap items-center gap-2 px-4 py-3">
            <p className="mr-auto text-xs text-muted-foreground">
              {me?.profile?.full_name}
              {org.myPositions.length > 0 ? ` — ${org.myPositions.join(", ")}` : ""}
              {me?.isAdmin ? " (admin)" : ""}
            </p>
            <GlobalSearch />
            <PositionSwitcher myPositions={org.myPositions} />
            <NotificationsBell userId={me?.userId} />
            <div className="flex overflow-hidden rounded border border-border">
              {(["fr", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => switchLang(l)}
                  className={`px-2 py-1 text-xs uppercase ${
                    lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? t("Mode clair") : t("Mode sombre")}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </Button>
            {me?.isAdmin && (
              <Link to="/membres">
                <Button variant="outline" size="sm">
                  {t("Membres")}
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={signOut}>
              {t("Déconnexion")}
            </Button>
          </div>
        </header>
        {me?.profile?.must_change_password && <PasswordGate userId={me.userId} />}
        <main className="mx-auto max-w-6xl px-4 py-6">
          <h1 className="mb-5 text-2xl font-semibold">{t(title)}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}
