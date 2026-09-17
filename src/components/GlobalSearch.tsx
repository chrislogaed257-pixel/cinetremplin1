import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrgContext } from "@/hooks/useOrg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Result = { label: string; kind: string; to: string };

/**
 * Recherche globale. Toutes les requêtes passent par la base : un membre ne peut
 * donc voir que ce que ses droits l'autorisent. Les votes ne sont jamais indexés.
 */
export function GlobalSearch() {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const org = useOrgContext();
  const navigate = useNavigate();
  const q = term.trim();

  const results = useQuery({
    queryKey: ["global_search", q],
    enabled: q.length >= 2 && !org.isMentor && !org.isFunder,
    queryFn: async (): Promise<Result[]> => {
      const like = `%${q}%`;
      const [projects, tasks, reports, contracts, festivals, resources] = await Promise.all([
        supabase.from("projects").select("id, title").ilike("title", like).limit(5),
        supabase.from("tasks").select("id, title").ilike("title", like).limit(5),
        supabase.from("reports").select("id, title").ilike("title", like).limit(5),
        supabase.from("contracts").select("id, role_title").ilike("role_title", like).limit(5),
        supabase.from("festivals").select("id, name").ilike("name", like).limit(5),
        supabase.from("resources").select("id, title").ilike("title", like).limit(5),
      ]);
      const people: Result[] = org.activeProfiles
        .filter((p) => p.full_name.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 5)
        .map((p) => ({ label: p.full_name, kind: "Membre", to: `/profil/${p.id}` }));
      return [
        ...people,
        ...(projects.data ?? []).map((r) => ({ label: r.title, kind: "Projet", to: "/idees" })),
        ...(tasks.data ?? []).map((r) => ({ label: r.title, kind: "Tâche", to: "/taches" })),
        ...(reports.data ?? []).map((r) => ({ label: r.title, kind: "Rapport", to: "/rapports" })),
        ...(contracts.data ?? []).map((r) => ({
          label: r.role_title,
          kind: "Contrat",
          to: "/contrats",
        })),
        ...(festivals.data ?? []).map((r) => ({
          label: r.name,
          kind: "Festival",
          to: "/festivals",
        })),
        ...(resources.data ?? []).map((r) => ({
          label: r.title,
          kind: "Document",
          to: "/ressources",
        })),
      ];
    },
  });

  if (org.isMentor || org.isFunder) return null;

  return (
    <div className="relative">
      <Input
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="🔍 Rechercher…"
        className="h-8 w-40 text-xs sm:w-56"
      />
      {open && q.length >= 2 && (
        <div className="absolute right-0 z-40 mt-1 max-h-80 w-72 overflow-y-auto rounded border border-border bg-background p-1 shadow-lg">
          {(results.data ?? []).length === 0 && (
            <p className="p-2 text-xs text-muted-foreground">Aucun résultat.</p>
          )}
          {(results.data ?? []).map((r, i) => (
            <Button
              key={`${r.kind}-${i}`}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                setOpen(false);
                setTerm("");
                navigate({ to: r.to });
              }}
            >
              <span className="mr-2 text-muted-foreground">{r.kind}</span>
              {r.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
