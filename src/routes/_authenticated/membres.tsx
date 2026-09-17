import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useOrgContext, positionNamesOf } from "@/hooks/useOrg";
import { createMember, deleteMember, updateMember, type PositionAssignment } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/membres")({
  component: MembersPage,
});

type Role = "admin" | "member" | "mentor" | "funder";

const roleLabel: Record<Role, string> = {
  admin: "Producteur général (accès complet)",
  member: "Membre",
  mentor: "Mentor",
  funder: "Bailleur",
};

function MembersPage() {
  const org = useOrgContext();
  const qc = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [likes, setLikes] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [positions, setPositions] = useState<PositionAssignment[]>([]);
  const [managerIds, setManagerIds] = useState<string[]>([]);
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [posQuery, setPosQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const projects = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("id, title").order("created_at");
      if (error) throw error;
      return (data ?? []) as { id: string; title: string }[];
    },
  });

  /** Postes déjà occupés par au moins une autre personne : on propose alors un rang. */
  const occupied = useMemo(() => {
    const map = new Map<string, number>();
    for (const pp of org.profilePositions) {
      if (pp.profile_id === editingId) continue;
      map.set(pp.position_id, (map.get(pp.position_id) ?? 0) + 1);
    }
    return map;
  }, [org.profilePositions, editingId]);

  /** Recherche insensible aux accents et à la casse. */
  const normalize = (v: string) =>
    v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const visiblePositions = org.positions
    .filter((p) => p.active)
    .filter((p) => normalize(p.name).includes(normalize(posQuery)));

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["profiles"] });
    qc.invalidateQueries({ queryKey: ["profile_positions"] });
    qc.invalidateQueries({ queryKey: ["profile_managers"] });
    qc.invalidateQueries({ queryKey: ["me"] });
  };

  const reset = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setLikes("");
    setDislikes("");
    setRole("member");
    setPositions([]);
    setManagerIds([]);
    setProjectIds([]);
    setPosQuery("");
    setEditingId(null);
  };

  const toggleProject = (id: string) =>
    setProjectIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const togglePosition = (positionId: string) => {
    setPositions((prev) =>
      prev.some((p) => p.positionId === positionId)
        ? prev.filter((p) => p.positionId !== positionId)
        : [...prev, { positionId, rank: "" }],
    );
  };

  const setRank = (positionId: string, rank: string) =>
    setPositions((prev) => prev.map((p) => (p.positionId === positionId ? { ...p, rank } : p)));

  const toggleManager = (id: string) =>
    setManagerIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));

  const create = useMutation({
    mutationFn: () =>
      createMember({
        data: { email, password, fullName, positions, managerIds, role, likes, dislikes, projectIds },
      }),
    onSuccess: () => {
      reset();
      refresh();
      toast.success("Membre créé");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: () =>
      updateMember({
        data: {
          id: editingId!,
          fullName,
          positions,
          managerIds,
          role,
          password: password || undefined,
          likes,
          dislikes,
          projectIds,
        },
      }),
    onSuccess: () => {
      reset();
      refresh();
      toast.success("Membre mis à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMember({ data: { id } }),
    onSuccess: () => {
      refresh();
      toast.success("Membre supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function startEdit(id: string) {
    const p = org.profiles.find((x) => x.id === id);
    if (!p) return;
    setEditingId(id);
    setFullName(p.full_name);
    setLikes(p.likes ?? "");
    setDislikes(p.dislikes ?? "");
    setPassword("");
    setRole("member");
    setPositions(
      org.profilePositions
        .filter((pp) => pp.profile_id === id)
        .map((pp) => ({ positionId: pp.position_id, rank: pp.rank_label })),
    );
    setManagerIds(org.links.filter((l) => l.profile_id === id).map((l) => l.manager_id));
    supabase
      .from("project_members")
      .select("project_id")
      .eq("profile_id", id)
      .then(({ data }) => setProjectIds((data ?? []).map((r) => r.project_id)));
  }

  if (!org.isAdmin) {
    return (
      <AppLayout title="Membres">
        <p className="text-sm text-muted-foreground">Espace réservé au Producteur général.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Membres">
      <div className="grid gap-4 md:grid-cols-[380px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm">
              {editingId ? "Modifier le membre" : "Créer un compte"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                editingId ? save.mutate() : create.mutate();
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="fn">Nom complet</Label>
                <Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              {!editingId && (
                <div className="space-y-1.5">
                  <Label htmlFor="em">Email</Label>
                  <Input id="em" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="pw">{editingId ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}</Label>
                <Input
                  id="pw"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!editingId}
                  minLength={editingId ? 0 : 6}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Rôle</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(roleLabel) as Role[]).map((r) => (
                      <SelectItem key={r} value={r}>
                        {roleLabel[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="posq">Poste(s)</Label>
                <Input
                  id="posq"
                  placeholder="Rechercher un poste…"
                  value={posQuery}
                  onChange={(e) => setPosQuery(e.target.value)}
                />
                <div className="max-h-56 space-y-1 overflow-y-auto rounded border border-border p-2">
                  {visiblePositions.length === 0 && (
                    <p className="text-xs text-muted-foreground">Aucun poste ne correspond.</p>
                  )}
                  {visiblePositions.map((p) => {
                    const selected = positions.find((x) => x.positionId === p.id);
                    const taken = occupied.get(p.id) ?? 0;
                    return (
                      <div key={p.id} className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={!!selected}
                            onCheckedChange={() => togglePosition(p.id)}
                            id={`pos-${p.id}`}
                          />
                          <label htmlFor={`pos-${p.id}`} className="mr-auto cursor-pointer">
                            {p.name}
                          </label>
                          {taken > 0 && (
                            <span className="text-[11px] text-muted-foreground">
                              {taken} titulaire{taken > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        {selected && (
                          <div className="ml-6 space-y-1">
                            {taken > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {["Assistant 1", "Assistant 2", "Assistant 3"].map((r) => (
                                  <Button
                                    key={r}
                                    type="button"
                                    size="sm"
                                    variant={selected.rank === r ? "default" : "outline"}
                                    className="h-6 px-2 text-[11px]"
                                    onClick={() => setRank(p.id, selected.rank === r ? "" : r)}
                                  >
                                    {r}
                                  </Button>
                                ))}
                              </div>
                            )}
                            <Input
                              className="h-7 w-40 text-xs"
                              placeholder="Rang (1er AR…)"
                              value={selected.rank}
                              onChange={(e) => setRank(p.id, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Supérieur(s) direct(s)</Label>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded border border-border p-2">
                  {org.activeProfiles
                    .filter((p) => p.id !== editingId)
                    .map((p) => (
                      <div key={p.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          id={`mgr-${p.id}`}
                          checked={managerIds.includes(p.id)}
                          onCheckedChange={() => toggleManager(p.id)}
                        />
                        <label htmlFor={`mgr-${p.id}`} className="cursor-pointer">
                          {p.full_name}
                        </label>
                      </div>
                    ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Projet(s) en cours auquel ce membre participe (facultatif)</Label>
                <div className="max-h-32 space-y-1 overflow-y-auto rounded border border-border p-2">
                  {(projects.data ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground">Aucun projet pour le moment.</p>
                  )}
                  {(projects.data ?? []).map((pr) => (
                    <div key={pr.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        id={`prj-${pr.id}`}
                        checked={projectIds.includes(pr.id)}
                        onCheckedChange={() => toggleProject(pr.id)}
                      />
                      <label htmlFor={`prj-${pr.id}`} className="cursor-pointer">
                        {pr.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lk">Une chose que tu aimes</Label>
                <Input id="lk" placeholder="Le partage" value={likes} onChange={(e) => setLikes(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dk">Une chose que tu n'aimes pas</Label>
                <Input
                  id="dk"
                  placeholder="La malhonnêteté"
                  value={dislikes}
                  onChange={(e) => setDislikes(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={create.isPending || save.isPending}>
                  {editingId ? "Enregistrer" : "Créer"}
                </Button>
                {editingId && (
                  <Button type="button" variant="ghost" onClick={reset}>
                    Annuler
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-2">
          {org.profiles.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-center gap-3 p-4 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground">{p.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {positionNamesOf(p.id, org.profilePositions, org.positions).join(" · ") ||
                      "Aucun poste"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supérieurs :{" "}
                    {org.links
                      .filter((l) => l.profile_id === p.id)
                      .map((l) => org.profileName(l.manager_id))
                      .join(" · ") || "—"}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => startEdit(p.id)}>
                  Modifier
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove.mutate(p.id)}>
                  Supprimer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
