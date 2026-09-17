import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/casting-soumission/$token")({
  component: CastingSubmitPage,
  head: () => ({
    meta: [
      { title: "Candidature casting — Club Ciné Tremplin" },
      {
        name: "description",
        content:
          "Déposez votre candidature au casting d'un film du Club Ciné Tremplin : coordonnées, âge, ville et lien vers votre vidéo.",
      },
      { property: "og:title", content: "Candidature casting — Club Ciné Tremplin" },
      {
        property: "og:description",
        content: "Formulaire public de candidature au casting du Club Ciné Tremplin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function CastingSubmitPage() {
  const { token } = Route.useParams();
  const [call, setCall] = useState<{ id: string; title: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    age: "",
    link: "",
    note: "",
  });

  useEffect(() => {
    void (async () => {
      const { data } = await supabase
        .from("casting_calls")
        .select("id,title,description")
        .eq("public_token", token)
        .eq("is_open", true)
        .maybeSingle();
      setCall(data ?? null);
      setLoading(false);
    })();
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!call) return;
    setBusy(true);
    const { error } = await supabase.from("casting_applications").insert({ call_id: call.id, ...form });
    setBusy(false);
    if (error) {
      toast.error("Envoi impossible pour le moment.");
      return;
    }
    setDone(true);
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>🎬 {call ? call.title : "Casting"}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : !call ? (
            <p className="text-sm text-muted-foreground">
              Ce casting n'est pas ouvert ou le lien n'est plus valide.
            </p>
          ) : done ? (
            <p className="text-sm">
              Merci ! Votre candidature est enregistrée. L'équipe du Club Ciné Tremplin vous
              recontactera.
            </p>
          ) : (
            <form className="space-y-3" onSubmit={submit}>
              {call.description && (
                <p className="text-sm text-muted-foreground">{call.description}</p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="n">Nom complet</Label>
                <Input id="n" value={form.full_name} onChange={set("full_name")} required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="e">Email</Label>
                  <Input id="e" type="email" value={form.email} onChange={set("email")} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="p">Téléphone</Label>
                  <Input id="p" value={form.phone} onChange={set("phone")} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c">Ville</Label>
                  <Input id="c" value={form.city} onChange={set("city")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="a">Âge</Label>
                  <Input id="a" value={form.age} onChange={set("age")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="l">Lien vidéo / book</Label>
                <Input id="l" value={form.link} onChange={set("link")} placeholder="https://" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="no">Présentation</Label>
                <Textarea id="no" rows={4} value={form.note} onChange={set("note")} />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                Envoyer ma candidature
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
