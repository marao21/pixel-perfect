import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const input = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  fullAccess: z.boolean(),
});

// Creates (or reuses) an account and grants admin. Only full admins may call it.
export const createAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => input.parse(d))
  .handler(async ({ data, context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: ok } = await (context.supabase as any).rpc("is_full_admin", { _user_id: context.userId });
    if (!ok) throw new Error("Só administradores com acesso completo podem adicionar administradores.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();
    let userId: string | null = null;

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({ email, password: data.password, email_confirm: true });
    if (created?.user) userId = created.user.id;
    else {
      const { data: prof } = await supabaseAdmin.from("profiles").select("id").ilike("email", email).maybeSingle();
      if (!prof) throw new Error(error?.message ?? "Não foi possível criar a conta.");
      userId = prof.id;
      await supabaseAdmin.auth.admin.updateUserById(userId, { password: data.password });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roles = supabaseAdmin.from("user_roles") as any;
    await roles.delete().eq("user_id", userId).eq("role", "admin");
    const { error: e2 } = await roles.insert({ user_id: userId, role: "admin", full_access: data.fullAccess });
    if (e2) throw new Error(e2.message);
    return { ok: true };
  });
