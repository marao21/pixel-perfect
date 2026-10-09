import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, LayoutTemplate, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageBlockEditor } from "@/components/PageBlockEditor";
import { SystemPageContent } from "@/components/SystemPageContent";
import { db, type CustomPage } from "@/lib/content";
import { blockError } from "@/lib/page-blocks";
import { defaultSystemPage, normalizeHomeSections, HOME_SECTIONS, SYSTEM_TABS, type SystemPage, type SystemSlug } from "@/lib/system-pages";

export function SystemPagesEditor() {
  const queryClient = useQueryClient();
  const [slug, setSlug] = useState<SystemSlug>("home");
  const [draft, setDraft] = useState<SystemPage>(defaultSystemPage("home"));
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(false); setPreview(false); setDirty(false);
    Promise.all([
      db.from("system_pages").select("*").eq("slug", slug).maybeSingle(),
      db.from("custom_pages").select("*").order("position"),
    ]).then(([result, links]) => {
      if (!active) return;
      if (result.error || links.error) { setError(true); toast.error("Não foi possível carregar as abas. Tente novamente."); return; }
      const next = result.data as SystemPage | null;
      setDraft(next ? { ...defaultSystemPage(slug), ...next, home_sections: normalizeHomeSections(next.home_sections) } : defaultSystemPage(slug));
      setPages(links.data ?? []);
    }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug, reload]);
  function update(patch: Partial<SystemPage>) { setDraft((value) => ({ ...value, ...patch })); setDirty(true); }
  const validation = draft.content_blocks.map(blockError).find(Boolean);
  async function save() {
    if (saving || loading || error || validation) return;
    setSaving(true);
    try {
      const { data, error: saveError } = await db.from("system_pages").upsert({
        slug, title: draft.title.trim(), intro: draft.intro, content_blocks: draft.content_blocks,
        content_position: draft.content_position, show_original: draft.show_original,
        home_sections: draft.home_sections, show_announcements: draft.show_announcements, published: true,
      }, { onConflict: "slug" }).select("*").single();
      if (saveError || !data) throw saveError;
      setDraft(data as SystemPage); setDirty(false);
      await queryClient.invalidateQueries({ queryKey: ["system-page", slug] });
      toast.success(`${SYSTEM_TABS.find((tab) => tab.slug === slug)?.label} atualizada`);
    } catch { toast.error("Não foi possível salvar. As alterações continuam aqui para tentar novamente."); }
    finally { setSaving(false); }
  }
  function move(index: number, direction: number) {
    const next = [...draft.home_sections];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const section = next.splice(index, 1)[0];
    if (!section) return;
    next.splice(target, 0, section); update({ home_sections: next });
  }
  return <section className="space-y-5 py-4">
    <h2 className="flex items-center gap-2 font-display text-2xl text-foreground"><LayoutTemplate className="h-5 w-5" /> Editar abas do sistema</h2>
    <div className="space-y-2"><Label htmlFor="system-tab">Aba</Label>
      <select id="system-tab" disabled={saving} className="h-10 w-full rounded-md border border-input bg-background px-3 text-foreground" value={slug} onChange={(e) => {
        if (dirty && !window.confirm("Trocar de aba sem salvar as alterações?")) return;
        setSlug(e.target.value as SystemSlug);
      }}>{SYSTEM_TABS.map((tab) => <option key={tab.slug} value={tab.slug}>{tab.label}</option>)}</select>
    </div>
    {loading ? <p role="status" className="text-muted-foreground">Carregando aba…</p> : error ? <div className="space-y-3"><p role="alert" className="text-destructive">Não foi possível carregar esta aba.</p><Button variant="outline" onClick={() => setReload((v) => v + 1)}>Tentar novamente</Button></div> : <>
      <div className="flex flex-wrap justify-between gap-2">
        <Button variant="outline" size="sm" onClick={() => setPreview((v) => !v)}>{preview ? "Voltar à edição" : "Pré-visualizar conteúdo"}</Button>
        <Button variant="ghost" size="sm" disabled={saving} onClick={() => { if (window.confirm("Restaurar o conteúdo padrão desta aba? Salve para confirmar.")) { setDraft(defaultSystemPage(slug)); setDirty(true); } }}><RotateCcw className="h-4 w-4" /> Restaurar padrão</Button>
      </div>
      {preview ? <SystemPageContent page={draft}>{null}</SystemPageContent> : <fieldset disabled={saving} className="min-w-0 space-y-5">
        <div className="space-y-2"><Label htmlFor="system-title">Título de abertura (opcional)</Label><Input id="system-title" value={draft.title} onChange={(e) => update({ title: e.target.value })} /></div>
        <div className="space-y-2"><Label htmlFor="system-intro">Texto de abertura</Label><Textarea id="system-intro" value={draft.intro} onChange={(e) => update({ intro: e.target.value })} /></div>
        <div className="flex items-center justify-between gap-3"><Label htmlFor="system-original">Mostrar conteúdo original da aba</Label><Switch id="system-original" checked={draft.show_original} onCheckedChange={(show_original) => update({ show_original })} /></div>
        {slug === "home" && <div className="space-y-3 border-y border-border py-4">
          <h3 className="font-semibold text-foreground">Seções da Home</h3>
          <div className="flex items-center justify-between gap-3"><Label htmlFor="home-announcements">Avisos no topo</Label><Switch id="home-announcements" checked={draft.show_announcements} onCheckedChange={(show_announcements) => update({ show_announcements })} /></div>
          {draft.home_sections.map((section, index) => {
            const label = HOME_SECTIONS.find((item) => item.id === section.id)?.label ?? section.id;
            return <div key={section.id} className="flex items-center gap-2 border-t border-border py-2">
              <Label className="min-w-0 flex-1" htmlFor={`home-${section.id}`}>{label}</Label>
              <Switch id={`home-${section.id}`} checked={section.visible} onCheckedChange={(visible) => update({ home_sections: draft.home_sections.map((item) => item.id === section.id ? { ...item, visible } : item) })} />
              <Button type="button" size="icon" variant="ghost" disabled={index === 0} aria-label={`Subir ${label}`} title={`Subir ${label}`} onClick={() => move(index, -1)}><ArrowUp className="h-4 w-4" /></Button>
              <Button type="button" size="icon" variant="ghost" disabled={index === draft.home_sections.length - 1} aria-label={`Descer ${label}`} title={`Descer ${label}`} onClick={() => move(index, 1)}><ArrowDown className="h-4 w-4" /></Button>
            </div>;
          })}
        </div>}
        <div className="space-y-2"><Label htmlFor="system-position">Posição do conteúdo adicionado</Label><select id="system-position" className="h-10 w-full rounded-md border border-input bg-background px-3 text-foreground" value={draft.content_position} onChange={(e) => update({ content_position: e.target.value as SystemPage["content_position"] })}><option value="before">Antes do conteúdo original</option><option value="after">Depois do conteúdo original</option></select></div>
        <PageBlockEditor blocks={draft.content_blocks} onChange={(content_blocks) => update({ content_blocks })} pages={pages} />
      </fieldset>}
      {validation && <p role="alert" className="text-sm text-destructive">{validation}</p>}
      <Button className="w-full" disabled={saving || !!validation || !dirty} onClick={() => void save()}><Save className="h-4 w-4" /> {saving ? "Salvando…" : "Salvar alterações da aba"}</Button>
    </>}
  </section>;
}