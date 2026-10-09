import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Heading1, Heading2, ImagePlus, Link2, Plus, Settings2, Trash2, Type, Video, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import type { CustomPage } from "@/lib/content";
import { moveBlock, newBlock, safeLink, type BlockType, type PageBlock } from "@/lib/page-blocks";

const selectClass = "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm text-foreground";

const INSERT: { type: BlockType; label: string; icon: typeof Type }[] = [
  { type: "text", label: "Texto", icon: Type },
  { type: "heading", label: "Título", icon: Heading1 },
  { type: "subtitle", label: "Subtítulo", icon: Heading2 },
  { type: "image", label: "Imagem", icon: ImagePlus },
  { type: "video", label: "Vídeo", icon: Video },
];

function AutoText({ value, onChange, className, placeholder, onSelectText, autoFocus }: {
  value: string; onChange: (v: string) => void; className: string; placeholder: string;
  onSelectText?: (el: HTMLTextAreaElement) => void; autoFocus?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { const el = ref.current; if (el) { el.style.height = "auto"; el.style.height = `${el.scrollHeight}px`; } }, [value]);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);
  return <textarea ref={ref} rows={1} value={value} placeholder={placeholder} aria-label={placeholder}
    onChange={(e) => onChange(e.target.value)}
    onSelect={() => ref.current && onSelectText?.(ref.current)}
    className={`w-full resize-none overflow-hidden border-0 bg-transparent p-0 text-foreground outline-none placeholder:text-muted-foreground/60 focus:ring-0 ${className}`} />;
}

function PagePicker({ value, onChange, pages }: { value: string; onChange: (v: string) => void; pages: CustomPage[] }) {
  return <div className="space-y-2">
    <select aria-label="Página de destino" className={selectClass} value={pages.some((p) => `/p/${p.slug}` === value) ? value : ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">Escolher página do app…</option>
      {pages.map((p) => <option key={p.id} value={`/p/${p.slug}`}>{p.title}{p.show_in_menu === false ? " (fora do menu)" : ""}</option>)}
    </select>
    <Input aria-label="Ou cole um link" placeholder="Ou cole um link (https://…)" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>;
}

function Inserter({ onAdd, open, setOpen }: { onAdd: (t: BlockType) => void; open: boolean; setOpen: (v: boolean) => void }) {
  return <div className="group relative flex items-center justify-center py-1">
    <div className="absolute inset-x-0 top-1/2 h-px bg-border opacity-0 transition group-hover:opacity-100" />
    {open ? <div className="relative z-10 flex flex-wrap justify-center gap-1 rounded-xl border border-border bg-card p-1 shadow-lg">
      {INSERT.map(({ type, label, icon: Icon }) => <Button key={type} type="button" size="sm" variant="ghost" onClick={() => { onAdd(type); setOpen(false); }}><Icon /> {label}</Button>)}
      <Button type="button" size="icon" variant="ghost" aria-label="Fechar" onClick={() => setOpen(false)}><X /></Button>
    </div> : <Button type="button" size="icon" variant="outline" aria-label="Adicionar aqui" className="relative z-10 h-7 w-7 rounded-full opacity-40 group-hover:opacity-100 focus:opacity-100" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /></Button>}
  </div>;
}

function Block({ block, update, pages, autoFocus }: { block: PageBlock; update: (p: Partial<PageBlock>) => void; pages: CustomPage[]; autoFocus: boolean }) {
  const [sel, setSel] = useState<{ start: number; end: number } | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const textual = block.type === "text" || block.type === "heading" || block.type === "subtitle";

  async function upload(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) || file.size > 5 * 1024 * 1024) { toast.error("Use JPG, PNG, WebP ou GIF de até 5 MB."); return; }
    setUploading(true);
    try {
      const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }[file.type];
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("page-images").upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      update({ path, url: "", alt: block.alt || file.name.replace(/\.[^.]+$/, "") });
      toast.success("Imagem enviada");
    } catch { toast.error("Não foi possível enviar a imagem. Tente novamente."); }
    finally { setUploading(false); }
  }

  if (textual) {
    const cls = block.type === "heading" ? "font-display text-2xl md:text-3xl" : block.type === "subtitle" ? "font-display text-lg md:text-xl text-gold" : "font-serif-read text-base leading-relaxed";
    const ph = block.type === "heading" ? "Título" : block.type === "subtitle" ? "Subtítulo" : "Comece a escrever… (selecione um trecho para virar link)";
    return <div className="space-y-2">
      <AutoText value={block.text} onChange={(text) => update({ text })} className={cls} placeholder={ph} autoFocus={autoFocus}
        onSelectText={(el) => setSel(el.selectionEnd > el.selectionStart ? { start: el.selectionStart, end: el.selectionEnd } : null)} />
      {sel && <div className="space-y-2 rounded-lg border border-gold/50 bg-card p-3">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground"><Link2 className="h-4 w-4" /> Transformar "{block.text.slice(sel.start, sel.end).slice(0, 40)}" em link</p>
        <PagePicker value={linkUrl} onChange={setLinkUrl} pages={pages} />
        <div className="flex gap-2">
          <Button type="button" size="sm" disabled={!safeLink(linkUrl)} onClick={() => {
            const chosen = block.text.slice(sel.start, sel.end).replace(/[[\]\n]/g, "");
            update({ text: `${block.text.slice(0, sel.start)}[${chosen}](${linkUrl.trim()})${block.text.slice(sel.end)}` });
            setSel(null); setLinkUrl("");
          }}>Criar link</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setSel(null)}>Cancelar</Button>
        </div>
      </div>}
    </div>;
  }

  if (block.type === "image") return <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
    <Label className="flex items-center gap-2 text-sm"><ImagePlus className="h-4 w-4" /> Imagem</Label>
    <Input type="file" aria-label="Enviar imagem" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploading} onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} />
    {uploading && <p className="text-sm text-muted-foreground">Enviando imagem…</p>}
    {block.path && <p className="text-sm text-primary">Imagem enviada ✓</p>}
    {!block.path && <Input aria-label="Endereço da imagem" placeholder="Ou cole o endereço da imagem (https://…)" value={block.url} onChange={(e) => update({ url: e.target.value, path: "" })} />}
    <Input aria-label="Legenda da imagem" placeholder="Legenda (opcional)" value={block.title} onChange={(e) => update({ title: e.target.value })} />
  </div>;

  if (block.type === "video") return <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
    <Label className="flex items-center gap-2 text-sm"><Video className="h-4 w-4" /> Vídeo do YouTube</Label>
    <Input aria-label="Link do YouTube" placeholder="Cole o link do YouTube" value={block.url} onChange={(e) => update({ url: e.target.value })} autoFocus={autoFocus} />
    <Input aria-label="Título do vídeo" placeholder="Título do vídeo (opcional)" value={block.title} onChange={(e) => update({ title: e.target.value })} />
    <AutoText value={block.text} onChange={(text) => update({ text })} className="rounded-md border border-input px-3 py-2 text-sm" placeholder="Texto deste vídeo (opcional)" />
  </div>;

  // Legacy "link" button blocks
  return <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
    <Input aria-label="Texto do link" placeholder="Texto do link" value={block.text} onChange={(e) => update({ text: e.target.value })} />
    <PagePicker value={block.url} onChange={(url) => update({ url })} pages={pages} />
  </div>;
}

function Options({ block, update, pages }: { block: PageBlock; update: (p: Partial<PageBlock>) => void; pages: CustomPage[] }) {
  return <div className="space-y-3 rounded-lg bg-muted/40 p3 p-3 text-sm">
    <div className="grid grid-cols-2 gap-3">
      <Label className="space-y-1">Alinhamento<select className={selectClass} value={block.align} onChange={(e) => update({ align: e.target.value as PageBlock["align"] })}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Label>
      <Label className="space-y-1">Largura<select className={selectClass} value={block.width} onChange={(e) => update({ width: e.target.value as PageBlock["width"] })}><option value="full">Completa</option><option value="medium">Média</option><option value="small">Pequena</option></select></Label>
    </div>
    {(block.type === "text" || block.type === "video") && <div className="flex items-center justify-between gap-3"><Label htmlFor={`collapse-${block.id}`}>Texto oculto até tocar</Label><Switch id={`collapse-${block.id}`} checked={block.collapsed} onCheckedChange={(collapsed) => update({ collapsed })} /></div>}
    {(block.type === "text" || block.type === "heading" || block.type === "subtitle") && <div className="space-y-1">
      <p className="font-medium text-foreground">Tornar este bloco inteiro um link</p>
      <PagePicker value={block.href} onChange={(href) => update({ href })} pages={pages} />
    </div>}
  </div>;
}

export function PageBlockEditor({ blocks, onChange, pages }: { blocks: PageBlock[]; onChange: (blocks: PageBlock[]) => void; pages: CustomPage[] }) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const [optionsFor, setOptionsFor] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const insert = (at: number, type: BlockType) => { const b = newBlock(type); const next = [...blocks]; next.splice(at, 0, b); onChange(next); setFocusId(b.id); };

  return <div className="rounded-xl border border-border bg-background p-3 md:p-5">
    {blocks.length === 0 && <button type="button" className="w-full py-6 text-left font-serif-read text-muted-foreground" onClick={() => insert(0, "text")}>Toque aqui e comece a escrever…</button>}
    {blocks.map((block, index) => <div key={block.id}>
      <Inserter open={openAt === index} setOpen={(v) => setOpenAt(v ? index : null)} onAdd={(t) => insert(index, t)} />
      <div className="group/block relative">
        <div className="mb-1 flex justify-end gap-0.5 opacity-50 transition group-hover/block:opacity-100 group-focus-within/block:opacity-100">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Opções" onClick={() => setOptionsFor(optionsFor === block.id ? null : block.id)}><Settings2 className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Mover para cima" disabled={index === 0} onClick={() => onChange(moveBlock(blocks, index, -1))}><ArrowUp className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Mover para baixo" disabled={index === blocks.length - 1} onClick={() => onChange(moveBlock(blocks, index, 1))}><ArrowDown className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Remover" onClick={() => onChange(blocks.filter((b) => b.id !== block.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
        <Block block={block} pages={pages} autoFocus={focusId === block.id} update={(patch) => onChange(blocks.map((b) => b.id === block.id ? { ...b, ...patch } : b))} />
        {optionsFor === block.id && <div className="mt-2"><Options block={block} pages={pages} update={(patch) => onChange(blocks.map((b) => b.id === block.id ? { ...b, ...patch } : b))} /></div>}
      </div>
    </div>)}
    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
      <span className="w-full text-xs text-muted-foreground">Adicionar no final:</span>
      {INSERT.map(({ type, label, icon: Icon }) => <Button key={type} type="button" size="sm" variant="outline" onClick={() => insert(blocks.length, type)}><Icon /> {label}</Button>)}
    </div>
  </div>;
}
