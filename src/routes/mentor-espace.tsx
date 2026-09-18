import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { mentorProjects } from "@/lib/mentors.functions";

export const Route = createFileRoute("/mentor-espace")({
  component: MentorOpenSpace,
  head: () => ({
    meta: [
      { title: "Espace mentor en accès libre : Club Ciné Tremplin" },
      {
        name: "description",
        content:
          "Consultez les projets du Club Ciné Tremplin et laissez votre retour de mentor, sans compte ni identifiant.",
      },
      { property: "og:title", content: "Espace mentor en accès libre : Club Ciné Tremplin" },
      {
        property: "og:description",
        content: "Accès libre pour les mentors externes du Club Ciné Tremplin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type P = { id: string; title: string; description: string; status: string };

function MentorOpenSpace() {
  const [projects, setProjects] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    void (async () => {
      const res = await mentorProjects();
      setProjects(res.projects);
      setLoading(false);
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("mentor_feedback").insert({
      mentor_name: name.trim() || "Mentor externe",
      project_id: projectId || null,
      content: content.trim(),
    });
    setBusy(false);
    if (error) {
      toast.error("Envoi impossible pour le moment.");
      return;
    }
    setDone(true);
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Espace mentor : Club Ciné Tremplin</h1>
        <p className="text-sm text-muted-foreground">
          Accès libre : aucun compte, aucun identifiant, aucune adresse email n'est demandé.
        </p>
      </header>

      {loading && <p className="text-sm text-muted-foreground">Chargement des projets...</p>}

      {!loading && projects.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucun projet à présenter pour le moment.</p>
      )}

      {projects.map((p) => (
        <Card key={p.id}>
          <CardContent className="space-y-1 p-4">
            <p className="font-medium">{p.title}</p>
            {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
            <span className="inline-block rounded bg-secondary px-2 py-0.5 text-xs">{p.status}</span>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Votre retour de mentor</CardTitle>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="space-y-3 text-sm">
              <p className="font-medium">Merci pour votre retour.</p>
              <p className="text-muted-foreground">
                Votre message a été transmis à la production. Vous pouvez quitter cette page.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDone(false);
                    setContent("");
                  }}
                >
                  Écrire un autre retour
                </Button>
                <Link to="/">
                  <Button>Quitter</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={submit}>
              <div className="space-y-1.5">
                <Label htmlFor="mn">Votre nom (facultatif)</Label>
                <Input id="mn" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mp">Projet concerné (facultatif)</Label>
                <select
                  id="mp"
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  <option value="">Retour général</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mc">Votre message</Label>
                <Textarea
                  id="mc"
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={busy || content.trim().length === 0}>
                Envoyer mon retour
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
