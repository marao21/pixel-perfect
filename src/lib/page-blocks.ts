import type { CustomPage } from "@/lib/content";
import { pageVideos, youtubeId } from "@/lib/content";

export type BlockType = "heading" | "subtitle" | "text" | "link" | "image" | "video";
export type PageBlock = {
  id: string;
  type: BlockType;
  text: string;
  url: string;
  title: string;
  path: string;
  alt: string;
  collapsed: boolean;
  align: "left" | "center" | "right";
  width: "full" | "medium" | "small";
};

export const blockLabels: Record<BlockType, string> = {
  heading: "Título", subtitle: "Subtítulo", text: "Texto", link: "Link",
  image: "Imagem", video: "Vídeo",
};

export function newBlock(type: BlockType): PageBlock {
  return { id: crypto.randomUUID(), type, text: "", url: "", title: "", path: "", alt: "", collapsed: false, align: "left", width: "full" };
}

// Null means the page still uses the original video/body format; [] means deliberately empty.
export function blocksForPage(page: CustomPage): PageBlock[] {
  if (Array.isArray(page.content_blocks)) return page.content_blocks;
  return [
    ...pageVideos(page).map((v, i): PageBlock => ({
      id: `legacy-video-${i}`, type: "video", url: v.url, title: v.title, text: v.text,
      path: "", alt: "", collapsed: true, align: "left", width: "full",
    })),
    ...(page.body ? [{ id: "legacy-body", type: "text" as const, text: page.body, url: "", title: "", path: "", alt: "", collapsed: false, align: "left" as const, width: "full" as const }] : []),
  ];
}

export function safeLink(url: string): string | null {
  const value = url.trim();
  if (/^\/(?!\/)[^\\\s]*$/.test(value)) return value;
  try {
    const parsed = new URL(value);
    return ["https:", "http:", "mailto:", "tel:"].includes(parsed.protocol) ? value : null;
  } catch { return null; }
}

export function internalPageSlug(url: string): string | null {
  const match = url.match(/^\/p\/([^/?#]+)$/);
  if (!match?.[1]) return null;
  try { return decodeURIComponent(match[1]); } catch { return null; }
}

export function blockError(block: PageBlock): string | null {
  if (block.type === "video" && !youtubeId(block.url)) return "Informe um link válido do YouTube.";
  if (block.type === "image" && !block.path && !/^https:\/\//.test(block.url)) return "Envie uma imagem ou informe um endereço HTTPS.";
  if (block.type === "link" && (!block.text.trim() || !safeLink(block.url))) return "Informe o texto e um destino válido para o link.";
  if (["text", "heading", "subtitle"].includes(block.type) && !block.text.trim()) return "Preencha o conteúdo ou remova este item.";
  return null;
}

export function moveBlock(blocks: PageBlock[], index: number, direction: number) {
  const destination = index + direction;
  if (destination < 0 || destination >= blocks.length) return blocks;
  const result = [...blocks];
  const item = result.splice(index, 1)[0];
  if (!item) return blocks;
  result.splice(destination, 0, item);
  return result;
}