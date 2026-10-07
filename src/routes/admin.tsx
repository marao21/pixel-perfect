import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Megaphone, PlayCircle, HandCoins, BookOpen, Users, Trash2, LogOut, Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Page } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db, youtubeId, type Announcement, type DevOverride, type PixOption, type Settings, type Video, type CustomPage, slugify } from "@/lib/content";
import { getDevotionalForDay } from "@/lib/devotionals";
import { useServerFn } from "@tanstack/react-start";
import { createAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel Admin — Os Mamutes" },
      { name: "description", content: "Área dos líderes para gerenciar avisos, vídeos, Pix e devocionais." },
      { property: "og:title", content: "Painel Admin — Os Mamutes" },
      { property: "og:description", content: "Gerenciamento do app Os Mamutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminRoute,
});

type Gate = "loading" | "signed_out" | "not_admin" | "admin";

function AdminRoute() {
  const [gate, setGate] = useState<Gate>("loading");
  const [noAdmins, setNoAdmins] = useState(false);

  const check = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return setGate("signed_out");
    const { data: isAdmin } = await db.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    if (isAdmin) return setGate("admin");
    const { data: exists } = await db.rpc("admin_exists");
    setNoAdmins(!exists);
    setGate("not_admin");
  }, []);

  useEffect(() => { void check(); }, [check]);

  if (gate === "loading") return <Page title="Admin"><p className="text-muted-foreground">Carregando…</p></Page>;

  if (gate === "signed_out")
    return (
      <Page title="Admin">
        <Box title="Área dos líderes">
          <p className="text-sm text-muted-foreground">Entre com sua conta para acessar o painel.</p>
          <Button asChild className="mt-3 w-full"><Link to="/login">Entrar</Link></Button>
        </Box>
      </Page>
    );

  if (gate === "not_admin")
    return (
      <Page title="Admin">
        <Box title="Sem permissão">
          {noAdmins ? (
            <>
              <p className="text-sm text-muted-foreground">Ainda não existe nenhum administrador. Você pode ser o primeiro.</p>
              <Button className="mt-3 w-full" onClick={async () => { await db.rpc("claim_first_admin"); void check(); }}>
                Tornar-me administrador
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Sua conta não é administradora. Peça a um líder para liberar seu acesso.</p>
          )}
        </Box>
      </Page>
    );

  return (
    <Page title="Admin">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl uppercase text-foreground">Painel do Líder</h1>
        <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); setGate("signed_out"); }}>
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>
      <Tabs defaultValue="avisos">
        <TabsList className="grid h-auto w-full grid-cols-6">
          <TabsTrigger value="avisos" aria-label="Avisos"><Megaphone className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="videos" aria-label="Vídeos"><PlayCircle className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="pix" aria-label="Oferta"><HandCoins className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="devocional" aria-label="Devocional"><BookOpen className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="paginas" aria-label="Páginas"><FileText className="h-4 w-4" /></TabsTrigger>
          <TabsTrigger value="admins" aria-label="Administradores"><Users className="h-4 w-4" /></TabsTrigger>
        </TabsList>
        <TabsContent value="avisos"><AvisosTab /></TabsContent>
        <TabsContent value="videos"><VideosTab /></TabsContent>
        <TabsContent value="pix"><PixTab /></TabsContent>
        <TabsContent value="devocional"><DevocionalTab /></TabsContent>
        <TabsContent value="paginas"><PaginasTab /></TabsContent>
        <TabsContent value="admins"><AdminsTab /></TabsContent>
      </Tabs>
    </Page>
  );
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-4 rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 font-display text-lg uppercase text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function fail(error: { message: string } | null) {
  if (error) { toast.error(error.message); return true; }
  return false;
}

function AvisosTab() {
  const [rows, setRows] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const load = useCallback(() => db.from("announcements").select("*").order("created_at", { ascending: false }).then(({ data }: { data: Announcement[] | null }) => setRows(data ?? [])), []);
  useEffect(() => { void load(); }, [load]);

  return (
    <>
      <Box title="Novo aviso">
        <div className="space-y-2">
          <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Mensagem" value={body} onChange={(e) => setBody(e.target.value)} />
          <Button className="w-full" disabled={!title.trim()} onClick={async () => {
            const { error } = await db.from("announcements").insert({ title: title.trim(), body: body.trim() || null });
            if (fail(error)) return;
            setTitle(""); setBody(""); toast.success("Aviso publicado"); void load();
          }}><Plus className="h-4 w-4" /> Publicar aviso</Button>
        </div>
      </Box>
      <Box title={`Avisos (${rows.length})`}>
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Nenhum aviso ainda.</p>}
        {rows.map((a) => (
          <Row key={a.id} title={a.title} sub={a.body} published={a.published}
            onToggle={async (p) => { fail((await db.from("announcements").update({ published: p }).eq("id", a.id)).error); void load(); }}
            onDelete={async () => { fail((await db.from("announcements").delete().eq("id", a.id)).error); void load(); }} />
        ))}
      </Box>
    </>
  );
}

function VideosTab() {
  const [rows, setRows] = useState<Video[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const load = useCallback(() => db.from("videos").select("*").order("position").order("created_at").then(({ data }: { data: Video[] | null }) => setRows(data ?? [])), []);
  useEffect(() => { void load(); }, [load]);
  const valid = !!youtubeId(url) && !!title.trim();

  return (
    <>
      <Box title="Novo vídeo do YouTube">
        <div className="space-y-2">
          <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Link do YouTube" value={url} onChange={(e) => setUrl(e.target.value)} />
          {url && !youtubeId(url) && <p className="text-xs text-destructive">Link do YouTube inválido.</p>}
          <Textarea placeholder="Descrição (opcional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <Button className="w-full" disabled={!valid} onClick={async () => {
            const { error } = await db.from("videos").insert({ title: title.trim(), youtube_url: url.trim(), description: desc.trim() || null, position: rows.length });
            if (fail(error)) return;
            setTitle(""); setUrl(""); setDesc(""); toast.success("Vídeo adicionado"); void load();
          }}><Plus className="h-4 w-4" /> Adicionar vídeo</Button>
        </div>
      </Box>
      <Box title={`Vídeos (${rows.length})`}>
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Nenhum vídeo ainda. Eles aparecem na tela inicial.</p>}
        {rows.map((v) => {
          const id = youtubeId(v.youtube_url);
          return (
            <div key={v.id} className="mb-2 flex gap-3 rounded-xl border border-border p-2">
              {id && <img src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" className="h-14 w-24 shrink-0 rounded object-cover" />}
              <div className="min-w-0 flex-1">
                <Row title={v.title} published={v.published} bare
                  onToggle={async (p) => { fail((await db.from("videos").update({ published: p }).eq("id", v.id)).error); void load(); }}
                  onDelete={async () => { fail((await db.from("videos").delete().eq("id", v.id)).error); void load(); }} />
              </div>
            </div>
          );
        })}
      </Box>
    </>
  );
}

function PaginasTab() {
  const [rows, setRows] = useState<CustomPage[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("");
  const load = useCallback(() => db.from("custom_pages").select("*").order("position").order("created_at").then(({ data }: { data: CustomPage[] | null }) => setRows(data ?? [])), []);
  useEffect(() => { void load(); }, [load]);
  const urlBad = !!url.trim() && !youtubeId(url);
  const reset = () => { setEditing(null); setTitle(""); setUrl(""); setBody(""); };

  async function save() {
    const data = { title: title.trim(), body: body.trim() || null, youtube_url: url.trim() || null };
    const { error } = editing
      ? await db.from("custom_pages").update(data).eq("id", editing)
      : await db.from("custom_pages").insert({ ...data, slug: `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`, position: rows.length });
    if (fail(error)) return;
    toast.success(editing ? "Aba atualizada" : "Aba criada — já aparece no menu");
    reset(); void load();
  }

  return (
    <>
      <Box title={editing ? "Editar aba" : "Nova aba no menu"}>
        <div className="space-y-2">
          <Input placeholder="Nome da aba (ex.: Estudos)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Link do YouTube (opcional)" value={url} onChange={(e) => setUrl(e.target.value)} />
          {urlBad && <p className="text-xs text-destructive">Link do YouTube inválido.</p>}
          <Textarea rows={8} placeholder="Texto da página (opcional)" value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex gap-2">
            <Button className="flex-1" disabled={!title.trim() || urlBad} onClick={save}><Plus className="h-4 w-4" /> {editing ? "Salvar" : "Criar aba"}</Button>
            {editing && <Button variant="outline" onClick={reset}>Cancelar</Button>}
          </div>
        </div>
      </Box>
      <Box title={`Abas (${rows.length})`}>
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma aba ainda. Elas aparecem no menu (☰).</p>}
        {rows.map((p) => (
          <div key={p.id}>
            <Row title={p.title} sub={p.body?.slice(0, 80)} published={p.published}
              onToggle={async (v) => { fail((await db.from("custom_pages").update({ published: v }).eq("id", p.id)).error); void load(); }}
              onDelete={async () => { fail((await db.from("custom_pages").delete().eq("id", p.id)).error); void load(); }} />
            <button className="-mt-1 mb-3 text-xs font-semibold text-primary" onClick={() => { setEditing(p.id); setTitle(p.title); setUrl(p.youtube_url ?? ""); setBody(p.body ?? ""); }}>Editar</button>
          </div>
        ))}
      </Box>
    </>
  );
}

function Row({ title, sub, published, onToggle, onDelete, bare }: { title: string; sub?: string | null; published: boolean; onToggle: (p: boolean) => void; onDelete: () => void; bare?: boolean }) {
  return (
    <div className={`flex items-start gap-2 ${bare ? "" : "mb-2 rounded-xl border border-border p-3"}`}>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{title}</p>
        {sub && <p className="line-clamp-2 text-xs text-muted-foreground">{sub}</p>}
        <label className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={published} onCheckedChange={onToggle} /> {published ? "Publicado" : "Oculto"}
        </label>
      </div>
      <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => { if (confirm("Excluir?")) onDelete(); }}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

function newPix(): PixOption {
  return { id: crypto.randomUUID(), label: "", key: "", receiver: "", amount: null, qr: "" };
}

function PixTab() {
  const [list, setList] = useState<PixOption[]>([]);
  useEffect(() => {
    db.from("app_settings").select("pix_key,pix_receiver,pix_qr_url,pix_options").eq("id", 1).maybeSingle().then(({ data }: { data: Settings | null }) => {
      const opts = data?.pix_options ?? [];
      if (opts.length) return setList(opts);
      if (data && (data.pix_key || data.pix_qr_url)) return setList([{ ...newPix(), key: data.pix_key ?? "", receiver: data.pix_receiver ?? "", qr: data.pix_qr_url ?? "" }]);
      setList([newPix()]);
    });
  }, []);

  const upd = (id: string, patch: Partial<PixOption>) => setList((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  function onFile(id: string, file: File | undefined) {
    if (!file) return;
    if (file.size > 1_000_000) { toast.error("Imagem muito grande (máx. 1 MB)."); return; }
    const r = new FileReader();
    r.onload = () => upd(id, { qr: String(r.result) });
    r.readAsDataURL(file);
  }

  async function save() {
    const clean = list
      .filter((p) => p.key.trim() || p.qr)
      .map((p) => ({ ...p, amount: p.amount !== null && p.amount > 0 ? p.amount : null }));
    const first = clean[0];
    const { error } = await db.from("app_settings").update({
      pix_options: clean,
      pix_key: first?.key || null, pix_receiver: first?.receiver || null, pix_qr_url: first?.qr || null,
    }).eq("id", 1);
    if (!fail(error)) toast.success("Pix salvo — já aparece na página Oferta");
  }

  return (
    <>
      {list.map((p, i) => (
        <Box key={p.id} title={`Pix ${i + 1}`}>
          <div className="space-y-3">
            <div><Label>Nome (ex.: Oferta, Dízimo, Missões)</Label><Input value={p.label} onChange={(e) => upd(p.id, { label: e.target.value })} /></div>
            <div><Label>Nome do recebedor</Label><Input value={p.receiver} onChange={(e) => upd(p.id, { receiver: e.target.value })} placeholder="Igreja Batista Belém" /></div>
            <div><Label>Chave Pix</Label><Input value={p.key} onChange={(e) => upd(p.id, { key: e.target.value })} /></div>
            <div>
              <Label>Valor</Label>
              <label className="my-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={p.amount === null} onCheckedChange={(free) => upd(p.id, { amount: free ? null : 10 })} /> Valor livre (só a chave)
              </label>
              {p.amount !== null && (
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={p.amount}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    // Se digitou um valor maior que zero, não é mais "valor livre"; se apagou/zerou, volta a ser livre.
                    upd(p.id, { amount: v > 0 ? v : null });
                  }}
                  placeholder="R$"
                />
              )}
            </div>
            <div>
              <Label>Imagem do QR Code (opcional)</Label>
              <Input type="file" accept="image/*" onChange={(e) => onFile(p.id, e.target.files?.[0])} />
              {p.qr && (
                <div className="mt-2 text-center">
                  <img src={p.qr} alt="QR Code" className="mx-auto w-40 rounded-lg" />
                  <Button variant="ghost" size="sm" onClick={() => upd(p.id, { qr: "" })}>Remover imagem</Button>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full" onClick={() => setList((l) => l.filter((x) => x.id !== p.id))}>
              <Trash2 className="h-4 w-4 text-destructive" /> Remover este Pix
            </Button>
          </div>
        </Box>
      ))}
      <Button variant="outline" className="mb-3 w-full" onClick={() => setList((l) => [...l, newPix()])}><Plus className="h-4 w-4" /> Adicionar outro Pix</Button>
      <Button className="w-full" onClick={() => void save()}>Salvar</Button>
    </>
  );
}

function DevocionalTab() {
  const today = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000) + 1;
  const [day, setDay] = useState(Math.min(365, today));
  const [f, setF] = useState({ title: "", verse: "", reference: "", body: "", author: "" });
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    db.from("devotional_overrides").select("*").eq("day_of_year", day).maybeSingle().then(({ data }: { data: DevOverride | null }) => {
      const base = getDevotionalForDay(day);
      setCustom(!!data);
      setF(data
        ? { title: data.title, verse: data.verse ?? "", reference: data.reference ?? "", body: data.body, author: data.author ?? "" }
        : { title: base.title, verse: base.verse, reference: base.ref, body: base.body.join("\n\n"), author: base.author });
    });
  }, [day]);

  const date = new Date(new Date().getFullYear(), 0, day).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });

  return (
    <Box title="Editar devocional">
      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <div className="flex-1"><Label>Dia do ano (1–365)</Label><Input type="number" min={1} max={365} value={day} onChange={(e) => setDay(Math.min(365, Math.max(1, Number(e.target.value) || 1)))} /></div>
          <p className="pb-2 text-sm text-muted-foreground">{date}</p>
        </div>
        <p className="text-xs text-gold">{custom ? "Texto personalizado pelo líder" : "Texto padrão do app — edite e salve para personalizar"}</p>
        <Input placeholder="Título" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <Textarea placeholder="Versículo" value={f.verse} onChange={(e) => setF({ ...f, verse: e.target.value })} />
        <Input placeholder="Referência (ex.: João 3:16)" value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} />
        <Textarea rows={10} placeholder="Texto (deixe uma linha em branco entre parágrafos)" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
        <Input placeholder="Autor" value={f.author} onChange={(e) => setF({ ...f, author: e.target.value })} />
        <div className="flex gap-2">
          <Button className="flex-1" disabled={!f.title.trim() || !f.body.trim()} onClick={async () => {
            const { error } = await db.from("devotional_overrides").upsert({ day_of_year: day, title: f.title, verse: f.verse || null, reference: f.reference || null, body: f.body, author: f.author || null });
            if (!fail(error)) { setCustom(true); toast.success("Devocional salvo"); }
          }}>Salvar</Button>
          {custom && (
            <Button variant="outline" onClick={async () => {
              if (fail((await db.from("devotional_overrides").delete().eq("day_of_year", day)).error)) return;
              setDay((d) => d); setCustom(false); toast.success("Voltou ao texto padrão");
            }}>Restaurar padrão</Button>
          )}
        </div>
      </div>
    </Box>
  );
}

function AdminsTab() {
  const [rows, setRows] = useState<{ user_id: string; email: string; full_access: boolean }[]>([]);
  const [me, setMe] = useState<{ id: string; full: boolean } | null>(null);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [full, setFull] = useState(false);
  const [busy, setBusy] = useState(false);
  const create = useServerFn(createAdmin);

  const load = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    if (u.user) {
      const { data: f } = await db.rpc("is_full_admin", { _user_id: u.user.id });
      setMe({ id: u.user.id, full: !!f });
    }
    const { data } = await db.from("user_roles").select("user_id,full_access").eq("role", "admin");
    const list = (data ?? []) as { user_id: string; full_access: boolean }[];
    if (!list.length) return setRows([]);
    const { data: p } = await supabase.from("profiles").select("id,email").in("id", list.map((r) => r.user_id));
    setRows(list.map((r) => ({ ...r, email: p?.find((x) => x.id === r.user_id)?.email ?? r.user_id })));
  }, []);
  useEffect(() => { void load(); }, [load]);

  const canManage = !!me?.full;

  return (
    <>
      {canManage ? (
        <Box title="Novo administrador">
          <div className="space-y-2">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="text" placeholder="Senha (mín. 6 caracteres)" value={pw} onChange={(e) => setPw(e.target.value)} />
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Switch checked={full} onCheckedChange={setFull} />
              {full ? "Acesso completo (pode mexer em tudo e gerenciar administradores)" : "Acesso comum (não pode adicionar nem excluir administradores)"}
            </label>
            <Button className="w-full" disabled={busy || !email.trim() || pw.length < 6} onClick={async () => {
              setBusy(true);
              try {
                await create({ data: { email: email.trim(), password: pw, fullAccess: full } });
                setEmail(""); setPw(""); setFull(false); toast.success("Administrador adicionado. Ele já pode entrar com esse email e senha."); void load();
              } catch (e) { toast.error(e instanceof Error ? e.message : "Erro ao adicionar"); }
              setBusy(false);
            }}><Plus className="h-4 w-4" /> Adicionar administrador</Button>
          </div>
        </Box>
      ) : (
        <Box title="Administradores">
          <p className="text-sm text-muted-foreground">Seu acesso é comum: você pode editar o conteúdo, mas não pode adicionar nem excluir administradores.</p>
        </Box>
      )}
      <Box title={`Administradores (${rows.length})`}>
        {rows.map((r) => (
          <div key={r.user_id} className="mb-2 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm text-foreground">{r.email}{r.user_id === me?.id ? " (você)" : ""}</span>
              {canManage && r.user_id !== me?.id && (
                <Button variant="ghost" size="icon" aria-label="Remover admin" onClick={async () => {
                  if (!confirm("Remover este administrador?")) return;
                  fail((await db.from("user_roles").delete().eq("user_id", r.user_id).eq("role", "admin")).error); void load();
                }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              )}
            </div>
            <label className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={r.full_access} disabled={!canManage || r.user_id === me?.id}
                onCheckedChange={async (v) => { fail((await db.from("user_roles").update({ full_access: v }).eq("user_id", r.user_id).eq("role", "admin")).error); void load(); }} />
              {r.full_access ? "Acesso completo" : "Acesso comum"}
            </label>
          </div>
        ))}
      </Box>
    </>
  );
}
