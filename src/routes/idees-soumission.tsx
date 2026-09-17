import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { submitIdea } from "@/lib/ideas.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png.asset.json";
import { toast } from "sonner";

export const Route = createFileRoute("/idees-soumission")({
  head: () => ({
    meta: [
      { title: "Proposer une idée de film — Club Ciné Tremplin" },
      {
        name: "description",
        content:
          "Envoyez votre idée de film ou votre scénario au Club Ciné Tremplin : un fichier ou un lien, et une courte description.",
      },
      { property: "og:title", content: "Proposer une idée de film — Club Ciné Tremplin" },
      {
        property: "og:description",
        content: "Partagez votre idée de film ou votre scénario avec le Club Ciné Tremplin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PublicIdeaForm,
});

function PublicIdeaForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sent, setSent] = useState(false);

  const send = useMutation({
    mutationFn: async () => {
      let fileBase64: string | undefined;
      if (file) {
        const buffer = new Uint8Array(await file.arrayBuffer());
        let binary = "";
        buffer.forEach((b) => (binary += String.fromCharCode(b)));
        fileBase64 = btoa(binary);
      }
      return submitIdea({
        data: {
          name,
          email,
          description,
          driveLink: driveLink || undefined,
          fileName: file?.name,
          fileBase64,
        },
      });
    },
    onSuccess: () => setSent(true),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-3">
          <img src={logo.url} alt="Club Ciné Tremplin" className="h-12 w-12 object-contain" />
          <div>
            <p className="text-sm font-semibold tracking-wide text-primary">CLUB CINÉ TREMPLIN</p>
            <p className="text-xs text-muted-foreground">On apprend, on tourne, on décolle.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <h1 className="text-xl">Proposer une idée de film ou un scénario</h1>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <p className="text-sm">
                Merci ! Votre idée a bien été reçue. L'équipe du club l'examine et vous répondra par
                email.
              </p>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  send.mutate();
                }}
              >
                <div className="space-y-1.5">
                  <Label htmlFor="n">Votre nom</Label>
                  <Input id="n" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="e">Votre email</Label>
                  <Input
                    id="e"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="f">Fichier (Word, PDF ou Excel)</Label>
                  <Input
                    id="f"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Un fichier <strong>ou</strong> un lien Google Drive suffit.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="l">Lien Google Drive</Label>
                  <Input
                    id="l"
                    type="url"
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="d">Courte description de votre idée</Label>
                  <Textarea
                    id="d"
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={send.isPending}>
                  {send.isPending ? "Envoi…" : "Envoyer mon idée"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
