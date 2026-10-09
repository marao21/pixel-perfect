import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Link2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import type { CustomPage } from "@/lib/content";
import { blockLabels, moveBlock, newBlock, safeLink, type BlockType, type PageBlock } from "@/lib/page-blocks";

const selectClass = "h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm text-foreground";

function BlockFields({ block, update, pages }: { block: PageBlock; update: (patch: Partial<PageBlock>) => void; pages: CustomPage[] }) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const canText = ["heading", "subtitle", "text", "video", "link"].includes(block.type);
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
  return <div className="space-y-3">
    {block.type === "video" && <><Input aria-label="Link do YouTube" placeholder="Link do YouTube" value={block.url} onChange={(e) => update({ url: e.target.value })} /><Input aria-label="Título do vídeo" placeholder="Título do vídeo (opcional)" value={block.title} onChange={(e) => update({ title: e.target.value })} /></>}
    {block.type === "image" && <>
      <Label className="flex items-center gap-2"><ImagePlus className="h-4 w-4" /> Enviar imagem</Label>
      <Input type="file" aria-label="Enviar imagem" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploading} onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} />
      {uploading && <p className="text-sm text-muted-foreground">Enviando imagem…</p>}
      {block.path && <p className="text-sm text-primary">Imagem enviada ✓</p>}
      <Input aria-label="Endereço da imagem" placeholder="Ou endereço HTTPS da imagem" value={block.url} onChange={(e) => update({ url: e.target.value, path: "" })} />
      <Input aria-label="Descrição da imagem" placeholder="Descrição da imagem" value={block.alt} onChange={(e) => update({ alt: e.target.value })} />
      <Input aria-label="Legenda da imagem" placeholder="Legenda (opcional)" value={block.title} onChange={(e) => update({ title: e.target.value })} />
    </>}
    {canText && <>
      <Textarea ref={textRef} aria-label={`Conteúdo de ${blockLabels[block.type]}`} rows={block.type === "text" || block.type === "video" ? 5 : 2} placeholder={block.type === "video" ? "Texto deste vídeo (opcional)" : blockLabels[block.type]} value={block.text} onChange={(e) => update({ text: e.target.value })} onSelect={() => {
        const field = textRef.current;
        if (field && field.selectionEnd > field.selectionStart) setLinkText(field.value.slice(field.selectionStart, field.selectionEnd));
      }} />
      {block.type !== "link" && <div className="space-y-2 border-l-2 border-border pl-3">
        <Input aria-label="Texto do link" placeholder="Texto do link" value={linkText} onChange={(e) => setLinkText(e.target.value)} />
        <select aria-label="Página de destino do texto" className={selectClass} value={pages.some((p) => `/p/${p.slug}` === linkUrl) ? linkUrl : ""} onChange={(e) => setLinkUrl(e.target.value)}><option value="">Escolher página do app</option>{pages.map((p) => <option key={p.id} value={`/p/${p.slug}`}>{p.title}{p.show_in_menu === false ? " (fora do menu)" : ""}</option>)}</select>
        <Input aria-label="Destino do texto" placeholder="Ou cole o link de destino" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
        <Button type="button" variant="outline" size="sm" disabled={!linkText.trim() || !safeLink(linkUrl)} onClick={() => {
          const field = textRef.current;
          const start = field?.selectionStart ?? block.text.length;
          const end = field?.selectionEnd ?? start;
          const markup = `[${linkText.replace(/[\[\]\n]/g, "")}](${linkUrl.trim()})`;
          update({ text: `${block.text.slice(0, start)}${markup}${block.text.slice(end)}` });
          setLinkText(""); setLinkUrl("");
        }}><Link2 /> Inserir link no texto</Button>
      </div>}
    </>}
    {block.type === "link" && <>
      <select aria-label="Página de destino" className={selectClass} value={pages.some((p) => `/p/${p.slug}` === block.url) ? block.url : ""} onChange={(e) => update({ url: e.target.value })}><option value="">Escolher página do app</option>{pages.map((p) => <option key={p.id} value={`/p/${p.slug}`}>{p.title}{p.show_in_menu === false ? " (fora do menu)" : ""}</option>)}</select>
      <Input aria-label="Destino do link" placeholder="Ou cole o link de destino" value={block.url} onChange={(e) => update({ url: e.target.value })} />
    </>}
    {(block.type === "text" || block.type === "video") && <div className="flex items-center justify-between gap-3"><Label htmlFor={`collapse-${block.id}`}>Texto oculto até tocar</Label><Switch id={`collapse-${block.id}`} checked={block.collapsed} onCheckedChange={(collapsed) => update({ collapsed })} /></div>}
    <div className="grid grid-cols-2 gap-3">
      <Label className="space-y-1">Alinhamento<select aria-label="Alinhamento" className={selectClass} value={block.align} onChange={(e) => update({ align: e.target.value as PageBlock["align"] })}><option value="left">Esquerda</option><option value="center">Centro</option><option value="right">Direita</option></select></Label>
      <Label className="space-y-1">Largura<select aria-label="Largura" className={selectClass} value={block.width} onChange={(e) => update({ width: e.target.value as PageBlock["width"] })}><option value="full">Completa</option><option value="medium">Média</option><option value="small">Pequena</option></select></Label>
    </div>
  </div>;
}

export function PageBlockEditor({ blocks, onChange, pages }: { blocks: PageBlock[]; onChange: (blocks: PageBlock[]) => void; pages: CustomPage[] }) {
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2">{(Object.keys(blockLabels) as BlockType[]).map((type) => <Button key={type} type="button" variant="outline" size="sm" onClick={() => onChange([...blocks, newBlock(type)])}><Plus />{blockLabels[type]}</Button>)}</div>
    {blocks.map((block, index) => <article key={block.id} className="space-y-3 rounded-lg border border-border p-3">
      <header className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold text-foreground">{index + 1}. {blockLabels[block.type]}</h3><div className="flex shrink-0">
        <Button type="button" variant="ghost" size="icon" title="Mover para cima" aria-label="Mover para cima" disabled={index === 0} onClick={() => onChange(moveBlock(blocks, index, -1))}><ArrowUp /></Button>
        <Button type="button" variant="ghost" size="icon" title="Mover para baixo" aria-label="Mover para baixo" disabled={index === blocks.length - 1} onClick={() => onChange(moveBlock(blocks, index, 1))}><ArrowDown /></Button>
        <Button type="button" variant="ghost" size="icon" title="Remover item" aria-label="Remover item" onClick={() => onChange(blocks.filter((b) => b.id !== block.id))}><Trash2 className="text-destructive" /></Button>
      </div></header>
      <BlockFields block={block} pages={pages} update={(patch) => onChange(blocks.map((b) => b.id === block.id ? { ...b, ...patch } : b))} />
    </article>)}
  </div>;
}