import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useOrgContext } from "@/hooks/useOrg";
import { Chat, useConversation } from "@/components/Chat";
import { ProjectPhaseControl } from "@/components/ProjectPhase";
import { getIdeaFileLink } from "@/lib/ideas.functions";
import { createProject, deleteProject } from "@/lib/projects.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/idees")({
  component: IdeasPage,
});

type Idea = {
  id: string;
  submitter_name: string;
  submitter_email: string;
  description: string;
  file_url: string | null;
  drive_link: string | null;
  status: string;
  responded: boolean;
  responded_at: string | null;
  response_note: string | null;
  created_at: string;
};
type Vote = {
  id: string;
  idea_id: string;
  voter_id: string;
  voter_position: string;
  decision: "approved" | "rejected";
  comment: string;
};
type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  idea_id: string | null;
  phase_id: string | null;
  state: string;
  synopsis?: string;
  synopsis_link?: string;
  script_title?: string;
  script_link?: string;
  budget_title?: string;
  budget_link?: string;
};

const PROJECT_MANAGERS = [
  "Producteur général",
  "Producteur délégué",
  "Scénariste",
  "Réalisateur",
  "Comptable / Trésorier",
];

const VOTING_POSITIONS = ["Producteur général", "Producteur délégué", "Scénariste"];

/** Numérotation romaine des projets (I, II, III…). */
function roman(n: number): string {
  const table: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let rest = n;
  let out = "";
  for (const [value, letters] of table) {
    while (rest >= value) {
      out += letters;
      rest -= value;
    }
  }
  return out;
}

/** Jours restants avant la fin du délai de décision de 3 jours. */
function daysLeft(createdAt: string): number {
  const limit = new Date(createdAt).getTime() + 3 * 86400000;
  return Math.ceil((limit - Date.now()) / 86400000);
}

function IdeasPage() {
  const org = useOrgContext();
  const qc = useQueryClient();
  const [comment, setComment] = useState("");
  const [note, setNote] = useState("");
  const [openProject, setOpenProject] = useState<string | null>(null);

  const ideas = useQuery({
    queryKey: ["ideas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ideas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Idea[];
    },
  });
  const votes = useQuery({
    queryKey: ["idea_votes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("idea_votes").select("*");
      if (error) throw error;
      return (data ?? []) as Vote[];
    },
  });
  const projects = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });
  const templates = useQuery({
    queryKey: ["message_templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("message_templates").select("*");
      if (error) throw error;
      return (data ?? []) as { key: string; subject: string; body: string }[];
    },
  });

  const autoReply = (idea: Idea) => {
    const key = idea.status === "Projet approuvé" ? "idea_approved" : "idea_rejected";
    const t = (templates.data ?? []).find((x) => x.key === key);
    if (!t) return "";
    return t.body.replaceAll("{nom}", idea.submitter_name);
  };

  const myVotingPositions = org.isAdmin
    ? VOTING_POSITIONS.filter(
        (p) => org.myBasePositions.includes(p) || p === "Producteur général",
      )
    : org.myBasePositions.filter((p) => VOTING_POSITIONS.includes(p));

  const vote = useMutation({
    mutationFn: async ({
      idea,
      decision,
      position,
    }: {
      idea: Idea;
      decision: Vote["decision"];
      position: string;
    }) => {
      if (!comment.trim()) throw new Error("Le commentaire est obligatoire.");
      const { error } = await supabase.from("idea_votes").upsert(
        {
          idea_id: idea.id,
          voter_id: org.myId,
          voter_position: position,
          decision,
          comment: comment.trim(),
        },
        { onConflict: "idea_id,voter_id,voter_position" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      setComment("");
      qc.invalidateQueries({ queryKey: ["idea_votes"] });
      qc.invalidateQueries({ queryKey: ["ideas"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Avis enregistré");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markResponded = useMutation({
    mutationFn: async (idea: Idea) => {
      if (!note.trim()) throw new Error("Notez ce qui a été répondu.");
      const { error } = await supabase
        .from("ideas")
        .update({
          responded: true,
          responded_at: new Date().toISOString(),
          response_note: note.trim(),
        })
        .eq("id", idea.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setNote("");
      qc.invalidateQueries({ queryKey: ["ideas"] });
      toast.success("Réponse enregistrée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function openFile(ideaId: string) {
    try {
      const { url } = await getIdeaFileLink({ data: { ideaId } });
      if (url) window.open(url, "_blank");
      else toast.error("Aucun fichier joint.");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <AppLayout title="Idées & projets">
      <Tabs defaultValue="ideas">
        <TabsList>
          <TabsTrigger value="ideas">Idées reçues</TabsTrigger>
          <TabsTrigger value="projects">Projets approuvés</TabsTrigger>
          <TabsTrigger value="refused">Idées non retenues</TabsTrigger>
        </TabsList>

        <TabsContent value="ideas" className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Lien public de soumission : <code>/idees-soumission</code>
          </p>
          {(ideas.data ?? []).filter((i) => i.status !== "Refusée").length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune idée reçue.</p>
          )}
          {(ideas.data ?? []).filter((i) => i.status !== "Refusée").map((idea) => {
            const ideaVotes = (votes.data ?? []).filter((v) => v.idea_id === idea.id);
            return (
              <Card key={idea.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {idea.submitter_name}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      · {idea.submitter_email} ·{" "}
                      {new Date(idea.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="whitespace-pre-wrap text-sm">{idea.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded bg-secondary px-2 py-1 text-xs">{idea.status}</span>
                    {idea.status !== "Projet approuvé" && (
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          daysLeft(idea.created_at) > 0
                            ? "bg-secondary text-muted-foreground"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {daysLeft(idea.created_at) > 0
                          ? `Décision attendue sous ${daysLeft(idea.created_at)} j`
                          : "Délai de 3 jours dépassé"}
                      </span>
                    )}
                    {idea.file_url && (
                      <Button size="sm" variant="outline" onClick={() => openFile(idea.id)}>
                        Ouvrir le fichier
                      </Button>
                    )}
                    {idea.drive_link && (
                      <a
                        href={idea.drive_link}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded bg-blue-500/10 px-2 py-1 text-xs text-blue-400 underline"
                      >
                        Lien Google Drive
                      </a>
                    )}
                  </div>

                  {ideaVotes.length > 0 && (
                    <div className="space-y-1 border-t border-border pt-2">
                      {ideaVotes.map((v) => (
                        <p key={v.id} className="text-xs text-muted-foreground">
                          {org.profileName(v.voter_id)} ({v.voter_position}) —{" "}
                          {v.decision === "approved" ? "Approuvé" : "Refusé"} : {v.comment}
                        </p>
                      ))}
                    </div>
                  )}

                  {myVotingPositions.length > 0 && (
                    <div className="space-y-2 border-t border-border pt-3">
                      <Textarea
                        rows={2}
                        placeholder="Commentaire (obligatoire)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      {myVotingPositions.map((p) => (
                        <div key={p} className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-muted-foreground">En tant que {p} :</span>
                          <Button
                            size="sm"
                            onClick={() => vote.mutate({ idea, decision: "approved", position: p })}
                          >
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => vote.mutate({ idea, decision: "rejected", position: p })}
                          >
                            Refuser
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {(org.isScreenwriter || org.isAdmin) && (
                    <div className="space-y-2 border-t border-border pt-3">
                      {idea.responded ? (
                        <p className="text-xs text-muted-foreground">
                          Répondu le{" "}
                          {idea.responded_at
                            ? new Date(idea.responded_at).toLocaleDateString("fr-FR")
                            : ""}{" "}
                          — {idea.response_note}
                        </p>
                      ) : (
                        <>
                          <Textarea
                            rows={3}
                            placeholder="Note de la réponse envoyée"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setNote(autoReply(idea))}
                            >
                              Réponse automatique
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markResponded.mutate(idea)}
                            >
                              Marquer comme répondu
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="projects" className="mt-4 space-y-4">
          {canManageProjects && <ProjectCreator />}
          {(projects.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Aucun projet approuvé.</p>
          )}
          {[...(projects.data ?? [])].reverse().map((p, i) => (
            <Card key={p.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      <span className="mr-2 text-primary">{roman(i + 1)}</span>
                      {p.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  </div>
                  <span className="rounded bg-secondary px-2 py-1 text-xs">{p.status}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setOpenProject(openProject === p.id ? null : p.id)}
                  >
                    {openProject === p.id ? "Fermer" : "Discussion du projet"}
                  </Button>
                  {canManageProjects && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => remove.mutate(p.id)}
                      disabled={remove.isPending}
                    >
                      Supprimer
                    </Button>
                  )}
                </div>
                {(p.synopsis || p.synopsis_link || p.script_link || p.budget_link) && (
                  <div className="space-y-1 rounded border border-border p-3 text-sm">
                    {p.synopsis && <p className="whitespace-pre-wrap">{p.synopsis}</p>}
                    <div className="flex flex-wrap gap-3 text-xs">
                      {p.synopsis_link && (
                        <a className="underline" href={p.synopsis_link} target="_blank" rel="noreferrer">
                          Document du synopsis
                        </a>
                      )}
                      {p.script_link && (
                        <a className="underline" href={p.script_link} target="_blank" rel="noreferrer">
                          Scénario{p.script_title ? ` : ${p.script_title}` : ""}
                        </a>
                      )}
                      {p.budget_link && (
                        <a className="underline" href={p.budget_link} target="_blank" rel="noreferrer">
                          Budget{p.budget_title ? ` : ${p.budget_title}` : ""}
                        </a>
                      )}
                    </div>
                  </div>
                )}
                <LoglineEditor projectId={p.id} canEdit={org.isAdmin || org.isDeputy} />
                <ProjectPhaseControl
                  projectId={p.id}
                  phaseId={p.phase_id}
                  state={p.state ?? "En cours"}
                />
                {openProject === p.id && <ProjectChat projectId={p.id} />}
              </CardContent>
            </Card>
          ))}
        </TabsContent>


        <TabsContent value="refused" className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Les idées non retenues sont conservées avec leur auteur et les avis reçus.
          </p>
          {(ideas.data ?? [])
            .filter((i) => i.status === "Refusée")
            .map((idea) => (
              <Card key={idea.id}>
                <CardContent className="space-y-2 p-4">
                  <p className="font-medium">
                    {idea.submitter_name}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      · {idea.submitter_email} ·{" "}
                      {new Date(idea.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </p>
                  <p className="whitespace-pre-wrap text-sm">{idea.description}</p>
                  {(votes.data ?? [])
                    .filter((v) => v.idea_id === idea.id)
                    .map((v) => (
                      <p key={v.id} className="text-xs text-muted-foreground">
                        {org.profileName(v.voter_id)} ({v.voter_position}) —{" "}
                        {v.decision === "approved" ? "Approuvé" : "Refusé"} : {v.comment}
                      </p>
                    ))}
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}

function ProjectChat({ projectId }: { projectId: string }) {
  const conv = useConversation("project", projectId);
  if (!conv.data) return <p className="text-sm text-muted-foreground">Discussion indisponible.</p>;
  return <Chat conversationId={conv.data.id} />;
}

function LoglineEditor({ projectId, canEdit }: { projectId: string; canEdit: boolean }) {
  const qc = useQueryClient();
  const [value, setValue] = useState<string | null>(null);

  const logline = useQuery({
    queryKey: ["project_logline", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("logline")
        .eq("id", projectId)
        .maybeSingle();
      if (error) throw error;
      return (data?.logline ?? "") as string;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("projects")
        .update({ logline: value ?? "" })
        .eq("id", projectId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["project_logline", projectId] });
      setValue(null);
      toast.success("Logline enregistrée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const current = logline.data ?? "";

  return (
    <div className="rounded border border-border p-3">
      <p className="mb-1 text-xs font-medium text-muted-foreground">🎞️ Logline</p>
      {value === null ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="min-w-0 flex-1 text-sm">{current || "Aucune logline pour le moment."}</p>
          {canEdit && (
            <Button size="sm" variant="ghost" onClick={() => setValue(current)}>
              Modifier
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea rows={2} value={value} onChange={(e) => setValue(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => save.mutate()}>
              Enregistrer
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setValue(null)}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
