import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MembroRow = {
  id: string;
  nome: string;
  email: string;
  criado_em: string | null;
};

// Lista todos os emails cadastrados no sistema: contas de autenticação,
// perfis públicos e a tabela legada "membros". Somente administradores.
export const listMembros = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MembroRow[]> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: isAdmin } = await (context.supabase as any).rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Apenas administradores podem ver os cadastros.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const byEmail = new Map<string, MembroRow>();

    const add = (row: MembroRow) => {
      const email = row.email.trim().toLowerCase();
      if (!email) return;
      if (byEmail.has(email)) return;
      byEmail.set(email, { ...row, email });
    };

    // 1) Contas de autenticação (todos os cadastros do sistema).
    try {
      let page = 1;
      for (;;) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) break;
        const users = data?.users ?? [];
        for (const u of users) {
          add({
            id: u.id,
            nome: (u.user_metadata?.["full_name"] as string | undefined) ?? u.email ?? u.id,
            email: u.email ?? "",
            criado_em: u.created_at ?? null,
          });
        }
        if (users.length < 1000) break;
        page += 1;
      }
    } catch {
      // Se a listagem de contas falhar, seguimos com as outras fontes.
    }

    // 2) Perfis públicos.
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id,email,full_name,updated_at");
    for (const p of profiles ?? []) {
      add({
        id: p.id,
        nome: p.full_name?.trim() || p.email,
        email: p.email,
        criado_em: p.updated_at ?? null,
      });
    }

    // 3) Tabela legada de membros.
    const { data: membros } = await supabaseAdmin.from("membros").select("id,nome,email,criado_em");
    for (const m of membros ?? []) {
      add({
        id: `membro-${m.id}`,
        nome: m.nome?.trim() || m.email,
        email: m.email,
        criado_em: m.criado_em ?? null,
      });
    }

    return [...byEmail.values()].sort((a, b) => {
      const ta = a.criado_em ? Date.parse(a.criado_em) : 0;
      const tb = b.criado_em ? Date.parse(b.criado_em) : 0;
      return tb - ta || a.email.localeCompare(b.email);
    });
  });
