import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { useMe, useProfiles } from "@/hooks/useProfile";
import { useManagerLinks } from "@/hooks/useOrg";
import { playConfirm } from "@/lib/sound";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/rapports")({
  component: ReportsPage,
});

type Report = {
  id: string;
  author_id: string;
  recipient_id: string | null;
  title: string;
  content: string;
  link: string | null;
  status: "sent" | "read" | "validated";
  created_at: string;
};

const statusLabel = { sent: "Envoyé", read: "Lu", validated: "Validé" } as const;

function ReportsPage() {
  const { data: me } = useMe();
  const { data: profiles = [] } = useProfiles();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [comment, setComment] = useState<Record<string, string>>({});
  const [commentLink, setCommentLink] = useState<Record<string, string>>({});
  const [recipient, setRecipient] = useState("");
  const { data: links = [] } = useManagerLinks();

  const reports = useQuery({
    queryKey: ["reports", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Report[];
    },
  });

  const comments = useQuery({
    queryKey: ["report_comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_comments")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const myManagers = links.filter((l) => l.profile_id === me?.userId).map((l) => l.manager_id);
  const myManagerId = recipient || myManagers[0] || me?.profile?.manager_id || null;

  const send = useMutation({
    mutationFn: async () => {
      if (!myManagerId) throw new Error("Choisissez le supérieur destinataire du rapport.");
      const { error } = await supabase.from("reports").insert({
        author_id: me!.userId,
        recipient_id: myManagerId,
        title,
        content,
        link: link || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setTitle("");
      setContent("");
      setLink("");
      qc.invalidateQueries({ queryKey: ["reports"] });
      playConfirm();
      toast.success("Rapport envoyé");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Report["status"] }) => {
      const { error } = await supabase.from("reports").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const addComment = useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase
        .from("report_comments")
        .insert({
          report_id: reportId,
          author_id: me!.userId,
          content: comment[reportId] ?? "",
          link: commentLink[reportId] || null,
        });
      if (error) throw error;
    },
    onSuccess: (_d, reportId) => {
      setComment((c) => ({ ...c, [reportId]: "" }));
      setCommentLink((c) => ({ ...c, [reportId]: "" }));
      qc.invalidateQueries({ queryKey: ["report_comments"] });
      playConfirm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const name = (id: string | null) => profiles.find((p) => p.id === id)?.full_name ?? "—";
  const all = reports.data ?? [];
  const mine = all.filter((r) => r.author_id === me?.userId);
  const received = all.filter((r) => r.author_id !== me?.userId);

  function ReportCard({ r }: { r: Report }) {
    const canModerate = r.author_id !== me?.userId;
    return (
      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-auto font-medium">{r.title}</p>
            <Badge variant={r.status === "validated" ? "default" : "secondary"}>{statusLabel[r.status]}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {name(r.author_id)} → {name(r.recipient_id)} ·{" "}
            {new Date(r.created_at).toLocaleString("fr-FR")}
          </p>
          <p className="whitespace-pre-wrap text-sm">{r.content}</p>
          {r.link && (
            <a href={r.link} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
              Pièce jointe / lien
            </a>
          )}
          <div className="space-y-1 border-t border-border pt-2">
            {(comments.data ?? [])
              .filter((c: { report_id: string }) => c.report_id === r.id)
              .map((c: { id: string; author_id: string; content: string; link?: string | null }) => (
                <p key={c.id} className="text-xs text-muted-foreground">
                  <span className="text-foreground">{name(c.author_id)}</span> : {c.content}
                  {c.link && (
                    <>
                      {" "}
                      <a
                        href={c.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 underline"
                      >
                        lien Drive
                      </a>
                    </>
                  )}
                </p>
              ))}
          </div>
          {canModerate && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: r.id, status: "read" })}>
                Marquer lu
              </Button>
              <Button size="sm" onClick={() => setStatus.mutate({ id: r.id, status: "validated" })}>
                Valider
              </Button>
              <Input
                className="w-56"
                placeholder="Réponse"
                value={comment[r.id] ?? ""}
                onChange={(e) => setComment((c) => ({ ...c, [r.id]: e.target.value }))}
              />
              <Input
                className="w-56"
                type="url"
                placeholder="Lien Google Drive (optionnel)"
                value={commentLink[r.id] ?? ""}
                onChange={(e) => setCommentLink((c) => ({ ...c, [r.id]: e.target.value }))}
              />
              <Button size="sm" variant="ghost" onClick={() => addComment.mutate(r.id)}>
                Envoyer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <AppLayout title="Rapports">
      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm">Nouveau rapport</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                send.mutate();
              }}
            >
              <div className="space-y-1.5">
                <Label>Destiné à</Label>
                {myManagers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Aucun supérieur défini pour votre compte.
                  </p>
                ) : (
                  <Select value={myManagerId ?? ""} onValueChange={setRecipient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir le supérieur" />
                    </SelectTrigger>
                    <SelectContent>
                      {myManagers.map((id) => (
                        <SelectItem key={id} value={id}>
                          {name(id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rt">Titre</Label>
                <Input id="rt" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={150} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rc">Contenu</Label>
                <Textarea id="rc" rows={6} value={content} onChange={(e) => setContent(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rl">Lien (optionnel)</Label>
                <Input id="rl" type="url" value={link} onChange={(e) => setLink(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={send.isPending}>
                Envoyer
              </Button>
            </form>
          </CardContent>
        </Card>

        <Tabs defaultValue="received">
          <TabsList>
            <TabsTrigger value="received">Rapports reçus ({received.length})</TabsTrigger>
            <TabsTrigger value="sent">Mes rapports ({mine.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="received" className="space-y-3">
            {received.length === 0 && <p className="text-sm text-muted-foreground">Aucun rapport reçu.</p>}
            {received.map((r) => (
              <ReportCard key={r.id} r={r} />
            ))}
          </TabsContent>
          <TabsContent value="sent" className="space-y-3">
            {mine.length === 0 && <p className="text-sm text-muted-foreground">Aucun rapport envoyé.</p>}
            {mine.map((r) => (
              <ReportCard key={r.id} r={r} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
