import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitIdeaFull } from "@/lib/ideas.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";
import { toast } from "sonner";

export const Route = createFileRoute("/idees-soumission")({
  head: () => ({
    meta: [
      { title: "Déposer un projet de film : Club Ciné Tremplin" },
      {
        name: "description",
        content:
          "Déposez votre dossier de film au Club Ciné Tremplin en accès libre : présentation, logline, synopsis, scénario, note d'intention ou simple lien Google Drive.",
      },
      { property: "og:title", content: "Déposer un projet de film : Club Ciné Tremplin" },
      {
        property: "og:description",
        content: "Accès libre : partagez votre projet de film avec le Club Ciné Tremplin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicIdeaForm,
});

function PublicIdeaForm() {
  const [f, setF] = useState({
    name: "",
    email: "",
    job: "",
    experience: "Débutant",
    projectTitle: "",
    presentation: "",
    logline: "",
    synopsis: "",
    scriptText: "",
    treatment: "",
    intentionNote: "",
    directingNote: "",
    driveLink: "",
  });
  const [thanks, setThanks] = useState<string | null>(null);
  const set = (key: keyof typeof f) => (value: string) => setF((p) => ({ ...p, [key]: value }));

  const send = useMutation({
    mutationFn: () =>
      submitIdeaFull({
        data: {
          name: f.name,
          email: f.email,
          job: f.job,
          experience: f.experience,
          projectTitle: f.projectTitle,
          presentation: f.presentation,
          logline: f.logline,
          synopsis: f.synopsis,
          scriptText: f.scriptText,
          treatment: f.treatment,
          intentionNote: f.intentionNote,
          directingNote: f.directingNote,
          driveLink: f.driveLink || undefined,
        },
      }),
    onSuccess: (r) => setThanks(r.message),
    onError: (e: Error) => toast.error(e.message),
  });

  const field = (
    key: keyof typeof f,
    label: string,
    rows = 0,
    required = false,
    placeholder?: string,
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>
        {label}
        {required ? " *" : ""}
      </Label>
      {rows > 0 ? (
        <Textarea
          id={key}
          rows={rows}
          value={f[key]}
          placeholder={placeholder}
          onChange={(e) => set(key)(e.target.value)}
        />
      ) : (
        <Input
          id={key}
          value={f[key]}
          placeholder={placeholder}
          onChange={(e) => set(key)(e.target.value)}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <img src={logo} alt="Club Ciné Tremplin" className="h-12 w-12 object-contain" />
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary">CLUB CINÉ TREMPLIN</p>
            <p className="text-xs text-muted-foreground">On apprend, on tourne, on décolle.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <h1 className="text-xl">Déposer un projet de film</h1>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {thanks ? (
              <div className="space-y-3 text-sm">
                <p className="font-medium">Votre dossier est bien arrivé.</p>
                <p className="text-muted-foreground">{thanks}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Déposer un autre projet
                </Button>
              </div>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  send.mutate();
                }}
              >
                <p className="text-xs text-muted-foreground">
                  Accès libre : aucun compte ni identifiant. Les champs marqués d'une étoile sont
                  obligatoires, mais un lien Google Drive contenant vos documents peut les remplacer.
                </p>
                {field("name", "Votre nom et prénom", 0, true)}
                {field("email", "Votre email", 0, true)}
                {field("job", "Votre métier")}
                <div className="space-y-1.5">
                  <Label htmlFor="experience">Expérience</Label>
                  <select
                    id="experience"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={f.experience}
                    onChange={(e) => set("experience")(e.target.value)}
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Expérimenté">Expérimenté</option>
                  </select>
                </div>
                {field("projectTitle", "Titre du projet", 0, true)}
                {field("presentation", "Votre présentation", 4, true)}
                {field("logline", "Logline", 2, true)}
                {field("synopsis", "Synopsis", 5, true)}
                {field("scriptText", "Scénario", 5, true)}
                {field("treatment", "Traitement", 4)}
                {field("intentionNote", "Note d'intention", 4, true)}
                {field(
                  "directingNote",
                  "Note de réalisation (si vous êtes réalisateur)",
                  4,
                )}
                {field(
                  "driveLink",
                  "Lien Google Drive de vos documents",
                  0,
                  false,
                  "https://drive.google.com/...",
                )}
                <Button type="submit" className="w-full" disabled={send.isPending}>
                  {send.isPending ? "Envoi en cours..." : "Envoyer mon dossier"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
