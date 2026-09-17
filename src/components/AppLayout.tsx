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
import { useEffect, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { GlobalSearch } from "@/components/GlobalSearch";
import {
  Archive,
  ArrowLeft,
  Award,
  BarChart3,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Coins,
  FileSignature,
  FileText,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  Lightbulb,
  Link2,
  Mail,
  Menu,
  MessagesSquare,
  Moon,
  Network,
  ScrollText,
  Settings,
  Sun,
  Theater,
  Users,
  Vote,
} from "lucide-react";

type NavItem = { to: string; label: string; Icon: ComponentType<{ className?: string }> };

const ORDER_KEY = "cct.menu.order";
const SCROLL_KEY = "cct.menu.scroll";

export function AppLayout({ children, title }: { children: ReactNode; title: string }) {
  const { data: me } = useMe();
  const org = useOrgContext();
  const unread = useUnread(org.myId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { lang, setLang, theme, setTheme, t } = usePrefs();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [dragged, setDragged] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ORDER_KEY);
      if (raw) setOrder(JSON.parse(raw) as string[]);
    } catch {
      /* ordre par défaut */
    }
  }, []);

  // Restaure la position exacte du menu au retour d'une rubrique.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved) el.scrollTop = Number(saved);
  }, [pathname]);

  let nav: NavItem[] = [
    { to: "/dashboard", label: "Tableau de bord", Icon: LayoutDashboard },
    { to: "/taches", label: "Mes tâches", Icon: ClipboardList },
    { to: "/rapports", label: "Rapports", Icon: FileText },
    { to: "/conges", label: "Mes congés", Icon: CalendarDays },
    { to: "/equipes", label: "Équipes", Icon: Users },
    { to: "/organigramme", label: "Organigramme", Icon: Network },
    { to: "/ressources", label: "Liens & documents", Icon: Link2 },
    { to: "/discussion", label: "Discussions", Icon: MessagesSquare },
    { to: "/messagerie", label: "Messagerie", Icon: Mail },
  ];
  if (org.canSeeIdeas) {
    nav.push({ to: "/idees", label: "Idées & projets", Icon: Lightbulb });
  }
  if (org.canAccounting) nav.push({ to: "/comptabilite", label: "Comptabilité", Icon: Coins });
  if (
    me?.isAdmin ||
    org.myBasePositions.includes("Producteur général") ||
    org.myBasePositions.includes("Producteur délégué")
  )
    nav.push({ to: "/mot-de-passe", label: "Mot de passe oublié", Icon: KeyRound });
  nav.push({ to: "/analyse", label: "Analyse de travail", Icon: BarChart3 });
  nav.push({ to: "/contrats", label: "Contrats", Icon: FileSignature });
  nav.push({ to: "/feuille-de-service", label: "Feuille de service", Icon: Briefcase });
  nav.push({ to: "/festivals", label: "Festivals", Icon: Award });
  nav.push({ to: "/vote", label: "Vote", Icon: Vote });
  nav.push({ to: "/casting", label: "Casting", Icon: Theater });
  nav.push({ to: "/archives", label: "Archives du club", Icon: Archive });
  if (me?.isAdmin || org.isDeputy || org.myBasePositions.includes("Producteur général"))
    nav.push({ to: "/mentors", label: "Mentors externes", Icon: GraduationCap });
  if (me?.isAdmin || org.myBasePositions.includes("Producteur général"))
    nav.push({ to: "/journal", label: "Journal d'activité", Icon: ScrollText });
  if (me?.isAdmin) nav.push({ to: "/modifications", label: "Modifications", Icon: Settings });
  if (org.isMentor && !me?.isAdmin)
    nav = [{ to: "/mentor", label: "Espace mentor", Icon: GraduationCap }];
  if (org.isFunder && !me?.isAdmin)
    nav = [{ to: "/espace-bailleur", label: "Mon espace bailleur", Icon: Coins }];

  const ordered =
    order.length > 0
      ? [...nav].sort((a, b) => {
          const ia = order.indexOf(a.to);
          const ib = order.indexOf(b.to);
          return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
        })
      : nav;

  function persist(list: NavItem[]) {
    const next = list.map((i) => i.to);
    setOrder(next);
    try {
      localStorage.setItem(ORDER_KEY, JSON.stringify(next));
    } catch {
      /* stockage indisponible */
    }
  }

  function handleDrop(target: string) {
    if (!dragged || dragged === target) return;
    const list = [...ordered];
    const from = list.findIndex((i) => i.to === dragged);
    const to = list.findIndex((i) => i.to === target);
    if (from < 0 || to < 0) return;
    const item = list[from];
    if (!item) return;
    list.splice(from, 1);
    list.splice(to, 0, item);
    persist(list);
    setDragged(null);
  }

  function rememberScroll() {
    const el = navRef.current;
    if (el) sessionStorage.setItem(SCROLL_KEY, String(el.scrollTop));
  }

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
      <aside className="border-b border-border lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-4 py-3">
          <img src={logo} alt="Club Ciné Tremplin" className="h-10 w-10 rounded object-contain" />
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary">CLUB CINÉ TREMPLIN</p>
            <p className="text-xs text-muted-foreground">On apprend, on tourne, on décolle</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <nav
          ref={navRef}
          className={`${menuOpen ? "flex" : "hidden"} flex-wrap gap-1 px-2 pb-3 lg:flex lg:flex-col lg:flex-nowrap lg:overflow-y-auto`}
        >
          {ordered.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              draggable
              onDragStart={() => setDragged(item.to)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(item.to)}
              onClick={() => {
                rememberScroll();
                setMenuOpen(false);
              }}
              title={`${t(item.label)} : glisser pour réordonner`}
              className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm transition-colors ${
                pathname === item.to
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              } ${dragged === item.to ? "opacity-50" : ""}`}
            >
              <item.Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{t(item.label)}</span>
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
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 print:hidden">
            <p className="mr-auto text-xs text-muted-foreground">
              {me?.profile?.full_name}
              {org.myPositions.length > 0 ? ` : ${org.myPositions.join(", ")}` : ""}
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
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
          <div className="mb-5 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="print:hidden"
              onClick={() => window.history.back()}
              aria-label={t("Retour")}
              title={t("Retour")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-semibold">{t(title)}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
