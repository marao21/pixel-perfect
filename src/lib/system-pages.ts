import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/content";
import type { PageBlock } from "@/lib/page-blocks";

export const SYSTEM_TABS = [
  { slug: "home", path: "/", label: "Home" },
  { slug: "plano", path: "/plano", label: "Plano" },
  { slug: "biblia", path: "/biblia", label: "Bíblia" },
  { slug: "oferta", path: "/oferta", label: "Oferta" },
  { slug: "pecado", path: "/pecado", label: "Pecado" },
  { slug: "devocional", path: "/devocional", label: "Devocional" },
  { slug: "tempo-com-deus", path: "/tempo-com-deus", label: "Tempo com Deus" },
] as const;
export type SystemSlug = typeof SYSTEM_TABS[number]["slug"];
export const HOME_SECTIONS = [
  { id: "reading", label: "Leitura do dia" },
  { id: "progress", label: "Progresso e ofensiva" },
  { id: "devotional", label: "Devocional do dia" },
  { id: "feed", label: "Vídeos da Home" },
] as const;
export type HomeSection = { id: typeof HOME_SECTIONS[number]["id"]; visible: boolean };
export type SystemPage = {
  slug: SystemSlug; title: string; intro: string; content_blocks: PageBlock[];
  content_position: "before" | "after"; show_original: boolean;
  home_sections: HomeSection[]; show_announcements: boolean; published: boolean;
};
export function defaultSystemPage(slug: SystemSlug): SystemPage {
  return { slug, title: "", intro: slug === "home" ? "Pronto para a palavra de hoje?" : "",
    content_blocks: [], content_position: "before", show_original: true,
    home_sections: HOME_SECTIONS.map(({ id }) => ({ id, visible: true })),
    show_announcements: true, published: true };
}
export function normalizeHomeSections(sections: HomeSection[] | null | undefined): HomeSection[] {
  const seen = new Set<string>();
  const result: HomeSection[] = [];
  for (const section of sections ?? []) {
    if (HOME_SECTIONS.some(({ id }) => id === section.id) && !seen.has(section.id)) {
      seen.add(section.id); result.push({ id: section.id, visible: section.visible !== false });
    }
  }
  for (const { id } of HOME_SECTIONS) if (!seen.has(id)) result.push({ id, visible: true });
  return result;
}
export function systemPageSlug(pathname: string): SystemSlug | undefined {
  return SYSTEM_TABS.find(({ path }) => path === (pathname.replace(/\/$/, "") || "/"))?.slug;
}
export function useSystemPage(slug: SystemSlug | undefined) {
  return useQuery<SystemPage | null>({
    queryKey: ["system-page", slug], enabled: !!slug,
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await db.from("system_pages").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      if (error) throw error;
      return data as SystemPage | null;
    }, staleTime: 30_000, retry: 1,
  });
}