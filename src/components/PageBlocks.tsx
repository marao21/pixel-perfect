import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { youtubeId } from "@/lib/content";
import { internalPageSlug, safeLink, type PageBlock } from "@/lib/page-blocks";

export function ContentLink({ url, children }: { url: string; children: ReactNode }) {
  const href = safeLink(url);
  if (!href) return <>{children}</>;
  const slug = internalPageSlug(href);
  const className = "text-primary underline underline-offset-4 break-words";
  if (slug) return <Link to="/p/$slug" params={{ slug }} className={className}>{children}</Link>;
  return <a href={href} className={className} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a>;
}

export function LinkedText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]\n]+\]\([^\s)]+\))/g);
  return <>{parts.map((part, index) => {
    const match = part.match(/^\[([^\]\n]+)\]\(([^\s)]+)\)$/);
    return match?.[1] && match[2] ? <ContentLink key={index} url={match[2]}>{match[1]}</ContentLink> : part;
  })}</>;
}

function BlockImage({ block }: { block: PageBlock }) {
  const [src, setSrc] = useState(block.path ? "" : block.url);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setError(false);
    if (!block.path) { setSrc(/^https:\/\//.test(block.url) ? block.url : ""); return; }
    setSrc("");
    supabase.storage.from("page-images").createSignedUrl(block.path, 3600).then(({ data, error }) => {
      if (active) { setSrc(data?.signedUrl ?? ""); setError(!!error); }
    });
    return () => { active = false; };
  }, [block.path, block.url]);
  if (error) return <p className="text-sm text-muted-foreground">Não foi possível carregar esta imagem.</p>;
  return <figure>{src ? <img src={src} alt={block.alt || block.title} className="h-auto w-full rounded-lg" loading="lazy" onError={() => setError(true)} /> : <div className="aspect-video animate-pulse bg-muted rounded-lg" />}{block.title && <figcaption className="mt-2 text-sm text-muted-foreground">{block.title}</figcaption>}</figure>;
}

function TextBody({ text }: { text: string }) {
  return <div className="whitespace-pre-wrap break-words font-serif-read text-[17px] leading-relaxed text-foreground"><LinkedText text={text} /></div>;
}

function TextSection({ text, collapsed }: { text: string; collapsed: boolean }) {
  const [open, setOpen] = useState(false);
  return <>
    {collapsed && <Button variant="outline" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="w-full justify-start">{open ? "Ocultar texto" : "Mostrar texto"}</Button>}
    {(!collapsed || open) && <TextBody text={text} />}
  </>;
}

export function PageBlocks({ blocks, pageTitle }: { blocks: PageBlock[]; pageTitle: string }) {
  return <div className="space-y-5">{blocks.map((block) => {
    const align = { left: "mr-auto text-left", center: "mx-auto text-center", right: "ml-auto text-right" }[block.align] ?? "text-left";
    const width = { full: "w-full", medium: "w-full sm:w-3/4", small: "w-full sm:w-1/2" }[block.width] ?? "w-full";
    const id = block.type === "video" ? youtubeId(block.url) : null;
    const linked = block.href && ["heading", "subtitle", "text"].includes(block.type);
    return <section key={block.id} className={`${align} ${width} min-w-0 space-y-3`}>
      {block.type === "heading" && <h2 className="font-display text-2xl text-foreground break-words">{linked ? <ContentLink url={block.href}><LinkedText text={block.text} /></ContentLink> : <LinkedText text={block.text} />}</h2>}
      {block.type === "subtitle" && <h3 className="font-display text-xl text-gold break-words">{linked ? <ContentLink url={block.href}><LinkedText text={block.text} /></ContentLink> : <LinkedText text={block.text} />}</h3>}
      {block.type === "text" && (linked ? <ContentLink url={block.href}><TextBody text={block.text} /></ContentLink> : <TextSection text={block.text} collapsed={block.collapsed} />)}
      {block.type === "link" && <ContentLink url={block.url}>{block.text}</ContentLink>}
      {block.type === "image" && <BlockImage block={block} />}
      {block.type === "video" && id && <>
        {block.title && <h2 className="font-display text-xl text-foreground break-words">{block.title}</h2>}
        <div className="aspect-video overflow-hidden rounded-lg border border-border bg-card"><iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`} title={block.title || `${pageTitle} — vídeo`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
        {block.text && <TextSection text={block.text} collapsed={block.collapsed} />}
      </>}
    </section>;
  })}</div>;
}