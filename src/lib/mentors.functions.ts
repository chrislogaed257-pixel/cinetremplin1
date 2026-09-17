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
    const name = invite.full_name || email;

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
      .upsert({ kind: "mentor", title: `Mentor — ${name}`, ref_id: id }, { onConflict: "kind,ref_id" });
    await db.from("mentor_invites").update({ used_at: new Date().toISOString() }).eq("id", invite.id);

    return { ok: true };
  });
