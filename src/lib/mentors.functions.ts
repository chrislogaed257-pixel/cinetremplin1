import { createServerFn } from "@tanstack/react-start";

type AcceptInput = { code?: string; email: string; password: string; fullName?: string };

/**
 * Un mentor externe crée lui-même son accès.
 * Deux chemins possibles :
 *  - avec un code d'invitation préparé par la production (usage unique) ;
 *  - en accès libre depuis le lien partagé : email, nom complet et mot de passe suffisent.
 */
export const acceptMentorInvite = createServerFn({ method: "POST" })
  .inputValidator((d: AcceptInput) => d)
  .handler(async ({ data }) => {
    const code = (data.code ?? "").trim();
    const email = data.email.trim().toLowerCase();
    const fullName = (data.fullName ?? "").trim();
    if (!email || data.password.length < 8)
      throw new Error("Email et mot de passe (8 caractères minimum) requis.");

    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");

    let invite: { id: string; full_name: string; used_at: string | null } | null = null;
    if (code) {
      const { data: found } = await db
        .from("mentor_invites")
        .select("*")
        .eq("code", code)
        .maybeSingle();
      if (!found) throw new Error("Code d'invitation inconnu.");
      if (found.used_at) throw new Error("Ce code a déjà été utilisé.");
      if (found.email.trim().toLowerCase() !== email)
        throw new Error("Cet email ne correspond pas à l'invitation.");
      invite = found;
    } else if (!fullName) {
      throw new Error("Indiquez votre nom complet.");
    }

    const { data: created, error } = await db.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
    });
    if (error || !created.user) throw new Error(error?.message ?? "Création impossible");
    const id = created.user.id;
    const name = invite?.full_name || fullName || email;

    const { error: pErr } = await db.from("profiles").insert({
      id,
      email,
      full_name: name,
      position: "Mentor externe",
      manager_id: null,
    });
    if (pErr) throw new Error(pErr.message);
    await db.from("user_roles").insert({ user_id: id, role: "mentor" });
    await db
      .from("conversations")
      .upsert({ kind: "mentor", title: `Mentor : ${name}`, ref_id: id }, { onConflict: "kind,ref_id" });
    if (invite)
      await db.from("mentor_invites").update({ used_at: new Date().toISOString() }).eq("id", invite.id);

    return { ok: true };
  });

/**
 * Projets présentés aux mentors externes en accès libre.
 * Aucun identifiant n'est requis : seules les informations publiques du projet sortent.
 */
export const mentorProjects = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const { data } = await db
    .from("projects")
    .select("id, title, description, status")
    .order("created_at", { ascending: false });
  return {
    projects: (data ?? []) as { id: string; title: string; description: string; status: string }[],
  };
});

/**
 * Espace de discussion du mentor invité, ouvert par jeton : aucun compte requis.
 * Le mentor échange uniquement avec la personne qui l'a invité.
 */
export const mentorThread = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => d)
  .handler(async ({ data }) => {
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: invite } = await db
      .from("mentor_invites")
      .select("id, full_name, email, status, created_by")
      .eq("public_token", data.token.trim())
      .maybeSingle();
    if (!invite) return { invite: null, inviter: null, messages: [] };
    let inviter: { full_name: string; position: string } | null = null;
    if (invite.created_by) {
      const { data: p } = await db
        .from("profiles")
        .select("full_name, position")
        .eq("id", invite.created_by)
        .maybeSingle();
      inviter = p ?? null;
    }
    const { data: messages } = await db
      .from("mentor_messages")
      .select("id, from_mentor, content, created_at")
      .eq("invite_id", invite.id)
      .order("created_at");
    return {
      invite: {
        id: invite.id,
        full_name: invite.full_name,
        status: invite.status as string,
      },
      inviter,
      messages: (messages ?? []) as {
        id: string;
        from_mentor: boolean;
        content: string;
        created_at: string;
      }[],
    };
  });

/** Message envoyé par le mentor depuis son lien d'accès libre. */
export const mentorSendMessage = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; content: string }) => d)
  .handler(async ({ data }) => {
    const content = data.content.trim();
    if (!content) throw new Error("Votre message est vide.");
    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { data: invite } = await db
      .from("mentor_invites")
      .select("id, full_name, status, created_by")
      .eq("public_token", data.token.trim())
      .maybeSingle();
    if (!invite) throw new Error("Lien inconnu.");
    if (invite.status !== "active")
      throw new Error("Cette discussion est en pause ou clôturée par le club.");
    const { error } = await db
      .from("mentor_messages")
      .insert({ invite_id: invite.id, from_mentor: true, content });
    if (error) throw new Error(error.message);
    if (invite.created_by) {
      await db.from("notifications").insert({
        user_id: invite.created_by,
        title: "Message d'un mentor externe",
        body: `${invite.full_name || "Le mentor invité"} vous a écrit : ${content.slice(0, 120)}`,
        link: "/mentors",
      });
    }
    return { ok: true };
  });
