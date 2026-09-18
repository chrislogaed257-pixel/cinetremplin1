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

type FullSubmission = {
  name: string;
  email: string;
  job: string;
  experience: string;
  projectTitle: string;
  presentation: string;
  logline: string;
  synopsis: string;
  scriptText: string;
  treatment?: string | undefined;
  intentionNote: string;
  directingNote?: string | undefined;
  driveLink?: string | undefined;
};

/**
 * Dossier complet déposé en accès libre (aucun compte, aucun identifiant).
 * Obligatoires : titre, présentation, logline, synopsis, scénario et note d'intention,
 * chacun pouvant être remplacé par un lien Google Drive.
 */
export const submitIdeaFull = createServerFn({ method: "POST" })
  .inputValidator((d: FullSubmission) => d)
  .handler(async ({ data }) => {
    const name = data.name?.trim();
    const email = data.email?.trim();
    const title = data.projectTitle?.trim();
    const link = data.driveLink?.trim();
    if (!name || !email) throw new Error("Nom et email sont requis.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Adresse email invalide.");
    if (!title) throw new Error("Le titre du projet est obligatoire.");
    const need = (value: string | undefined, label: string) => {
      if (!value?.trim() && !link) throw new Error(`${label} : écrivez le texte ou ajoutez un lien Google Drive.`);
    };
    need(data.presentation, "Votre présentation");
    need(data.logline, "La logline");
    need(data.synopsis, "Le synopsis");
    need(data.scriptText, "Le scénario");
    need(data.intentionNote, "La note d'intention");

    const db = await admin();
    const description = [
      data.presentation?.trim(),
      data.logline?.trim() ? `Logline : ${data.logline.trim()}` : "",
      data.synopsis?.trim() ? `Synopsis : ${data.synopsis.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const { data: idea, error } = await db
      .from("ideas")
      .insert({
        submitter_name: name,
        submitter_email: email,
        description: description || title,
        project_title: title,
        presentation: data.presentation?.trim() ?? "",
        submitter_job: data.job?.trim() ?? "",
        experience_level: data.experience?.trim() ?? "",
        logline: data.logline?.trim() ?? "",
        synopsis: data.synopsis?.trim() ?? "",
        treatment: data.treatment?.trim() ?? "",
        intention_note: data.intentionNote?.trim() ?? "",
        directing_note: data.directingNote?.trim() ?? "",
        script_text: data.scriptText?.trim() ?? "",
        drive_link: link || null,
        origin: "externe",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const { notifyReviewers } = await import("@/lib/projects.functions");
    await notifyReviewers(
      db,
      "Nouveau dossier de projet reçu",
      `${name} a déposé le projet : ${title}`,
    );

    return {
      ok: true,
      id: idea.id,
      message:
        "Merci du fond du coeur pour la confiance que vous accordez au Club Ciné Tremplin. Votre dossier est bien arrivé entre les mains de la production : il sera lu avec attention et vous recevrez une réponse par email.",
    };
  });
