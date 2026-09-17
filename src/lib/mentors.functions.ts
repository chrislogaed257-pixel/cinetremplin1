import { createServerFn } from "@tanstack/react-start";

type AcceptInput = { code: string; email: string; password: string };

/**
 * Un mentor externe crée lui-même son accès à partir du code d'invitation
 * préparé par la production. Le code est à usage unique.
 */
export const acceptMentorInvite = createServerFn({ method: "POST" })
  .inputValidator((d: AcceptInput) => d)
  .handler(async ({ data }) => {
    const code = data.code.trim();
    const email = data.email.trim().toLowerCase();
    if (!code || !email || data.password.length < 8)
      throw new Error("Code, email et mot de passe (8 caractères minimum) requis.");

    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");

    const { data: invite } = await db
      .from("mentor_invites")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (!invite) throw new Error("Code d'invitation inconnu.");
    if (invite.used_at) throw new Error("Ce code a déjà été utilisé.");
    if (invite.email.trim().toLowerCase() !== email)
      throw new Error("Cet email ne correspond pas à l'invitation.");

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
