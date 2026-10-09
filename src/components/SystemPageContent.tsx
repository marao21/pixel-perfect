import type { ReactNode } from "react";
import { PageBlocks, LinkedText } from "@/components/PageBlocks";
import type { SystemPage } from "@/lib/system-pages";

export function SystemPageContent({ page, children }: { page: SystemPage; children: ReactNode }) {
  const content = page.content_blocks.length > 0 ? <div className="my-5"><PageBlocks blocks={page.content_blocks} pageTitle={page.title || page.slug} /></div> : null;
  return <>
    {page.title && <h1 className="mb-3 break-words font-display text-3xl text-foreground">{page.title}</h1>}
    {page.intro && <p className="mb-5 whitespace-pre-wrap break-words text-muted-foreground"><LinkedText text={page.intro} /></p>}
    {page.content_position === "before" && content}
    {page.show_original && children}
    {page.content_position === "after" && content}
  </>;
}