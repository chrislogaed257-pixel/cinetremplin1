import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Submission = {
  name: string;
  email: string;
  description: string;
  driveLink?: string | undefined;
  fileName?: string | undefined;
  fileBase64?: string | undefined;
};

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const ALLOWED = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];

/** Soumission publique d'une idée de film (aucun compte requis). */
export const submitIdea = createServerFn({ method: "POST" })
  .inputValidator((d: Submission) => d)
  .handler(async ({ data }) => {
    const name = data.name?.trim();
    const email = data.email?.trim();
    const description = data.description?.trim();
    if (!name || !email || !description) throw new Error("Nom, email et description sont requis.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Adresse email invalide.");
    if (!data.driveLink && !data.fileBase64)
      throw new Error("Ajoutez un fichier ou un lien Google Drive.");

    const db = await admin();
    let fileUrl: string | null = null;

    if (data.fileBase64 && data.fileName) {
      const lower = data.fileName.toLowerCase();
      if (!ALLOWED.some((e) => lower.endsWith(e)))
        throw new Error("Formats acceptés : Word, PDF ou Excel.");
      const bytes = Uint8Array.from(atob(data.fileBase64), (c) => c.charCodeAt(0));
      if (bytes.length > 20 * 1024 * 1024) throw new Error("Fichier trop volumineux (20 Mo max).");
      const path = `${crypto.randomUUID()}-${data.fileName.replace(/[^\w.\-]/g, "_")}`;
      const { error } = await db.storage.from("idea-files").upload(path, bytes);
      if (error) throw new Error(error.message);
      fileUrl = path;
    }

    const { data: idea, error: iErr } = await db
      .from("ideas")
      .insert({
        submitter_name: name,
        submitter_email: email,
        description,
        drive_link: data.driveLink?.trim() || null,
        file_url: fileUrl,
      })
      .select("id")
      .single();
    if (iErr) throw new Error(iErr.message);

    // Notifier Producteur général, Producteur délégué et Scénariste
    const { data: targets } = await db
      .from("profile_positions")
      .select("profile_id, positions!inner(name)")
      .in("positions.name", ["Producteur général", "Producteur délégué", "Scénariste"]);
    const { data: admins } = await db.from("user_roles").select("user_id").eq("role", "admin");
    const ids = new Set<string>([
      ...((targets ?? []) as { profile_id: string }[]).map((t) => t.profile_id),
      ...((admins ?? []) as { user_id: string }[]).map((a) => a.user_id),
    ]);
    if (ids.size > 0) {
      await db.from("notifications").insert(
        [...ids].map((user_id) => ({
          user_id,
          title: "Nouvelle idée de film reçue",
          body: `${name} a soumis une idée : ${description.slice(0, 120)}`,
          link: "/idees",
        })),
      );
    }
    return { ok: true, id: idea.id };
  });

/** Lien de téléchargement temporaire du fichier d'une idée. */
export const getIdeaFileLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { ideaId: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: idea, error } = await context.supabase
      .from("ideas")
      .select("file_url")
      .eq("id", data.ideaId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!idea?.file_url) return { url: null };
    const db = await admin();
    const { data: signed, error: sErr } = await db.storage
      .from("idea-files")
      .createSignedUrl(idea.file_url, 300);
    if (sErr) throw new Error(sErr.message);
    return { url: signed.signedUrl };
  });
