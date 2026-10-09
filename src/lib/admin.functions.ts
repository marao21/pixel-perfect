import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Strips invisible characters/spaces that come along when copying an email.
export function cleanEmail(v: string) {
  return v
    .replace(/[\u200B-\u200D\uFEFF\u00A0\s]/g, "")
    .replace(/^mailto:/i, "")
    .toLowerCase();
}

const input = z.object({
  email: z.preprocess(
    (v) => (typeof v === "string" ? cleanEmail(v) : v),
    z.string().email("Email inválido").max(255),
  ),
  password: z.string().max(72).optional().default(""),
  fullAccess: z.boolean(),
});

// Grants admin. Existing accounts are promoted without changing their password;
// new emails get an account created with the given password. Only full admins may call it.
export const createAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data, context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ok } = await (context.supabase as any).rpc("is_full_admin", {
      _user_id: context.userId,
    });
    if (!ok)
      throw new Error("Só administradores com acesso completo podem adicionar administradores.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email;

    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    let userId: string | null = prof?.id ?? null;
    let existed = !!userId;

    if (!userId) {
      if (data.password.length < 6)
        throw new Error("Email novo: informe uma senha com pelo menos 6 caracteres.");
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: data.password,
        email_confirm: true,
      });
      if (!created?.user) throw new Error(error?.message ?? "Não foi possível criar a conta.");
      userId = created.user.id;
      existed = false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roles = supabaseAdmin.from("user_roles") as any;
    await roles.delete().eq("user_id", userId).eq("role", "admin");
    const { error: e2 } = await roles.insert({
      user_id: userId,
      role: "admin",
      full_access: data.fullAccess,
    });
    if (e2) throw new Error(e2.message);
    return { ok: true, existed };
  });
