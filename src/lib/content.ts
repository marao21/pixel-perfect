import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DailyDevotional } from "@/lib/devotionals";
import type { PageBlock } from "@/lib/page-blocks";

// Tables created after the generated types; use an untyped handle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;

export type PixOption = {
  id: string;
  label: string;
  key: string;
  receiver: string;
  amount: number | null;
  qr: string;
};
export type Settings = {
  pix_key: string | null;
  pix_receiver: string | null;
  pix_qr_url: string | null;
  pix_options?: PixOption[] | null;
};
export type Video = {
  id: string;
  title: string;
  youtube_url: string;
  description: string | null;
  position: number;
  published: boolean;
};
export type Announcement = {
  id: string;
  title: string;
  body: string | null;
  published: boolean;
  created_at: string;
};
export type DevOverride = {
  day_of_year: number;
  title: string;
  verse: string | null;
  reference: string | null;
  body: string;
  author: string | null;
};

export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m?.[1] ?? (/^[\w-]{11}$/.test(url.trim()) ? url.trim() : null);
}

export function useSettings() {
  const [s, setS] = useState<Settings | null>(null);
  useEffect(() => {
    db.from("app_settings")
      .select("pix_key,pix_receiver,pix_qr_url,pix_options")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }: { data: Settings | null }) => setS(data));
  }, []);
  return s;
}

export function usePublished<T>(
  table: "videos" | "announcements",
  order: string,
  ascending: boolean,
) {
  const [rows, setRows] = useState<T[]>([]);
  useEffect(() => {
    db.from(table)
      .select("*")
      .eq("published", true)
      .order(order, { ascending })
      .then(({ data }: { data: T[] | null }) => setRows(data ?? []));
  }, [table, order, ascending]);
  return rows;
}

export function useDevotionalOverride(day: number, fallback: DailyDevotional): DailyDevotional {
  const [o, setO] = useState<DevOverride | null>(null);
  useEffect(() => {
    setO(null);
    db.from("devotional_overrides")
      .select("*")
      .eq("day_of_year", day)
      .maybeSingle()
      .then(({ data }: { data: DevOverride | null }) => setO(data));
  }, [day]);
  if (!o) return fallback;
  return {
    ...fallback,
    title: o.title,
    verse: o.verse ?? fallback.verse,
    ref: o.reference ?? fallback.ref,
    body: o.body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
    author: o.author ?? fallback.author,
  };
}

export type PageVideo = { url: string; title: string; text: string };
export type CustomPage = {
  id: string;
  slug: string;
  title: string;
  body: string | null;
  youtube_url: string | null;
  youtube_urls?: string[] | null;
  videos?: PageVideo[] | null;
  content_blocks?: PageBlock[] | null;
  show_in_menu?: boolean;
  position: number;
  published: boolean;
};

export function pageVideos(p: CustomPage): PageVideo[] {
  if (p.videos?.length) return p.videos;
  const urls = p.youtube_urls?.length ? p.youtube_urls : p.youtube_url ? [p.youtube_url] : [];
  return urls.map((url) => ({ url, title: "", text: "" }));
}

export function useCustomPages() {
  const [rows, setRows] = useState<CustomPage[]>([]);
  useEffect(() => {
    db.from("custom_pages")
      .select("*")
      .eq("published", true)
      .eq("show_in_menu", true)
      .order("position")
      .order("created_at")
      .then(({ data }: { data: CustomPage[] | null }) => setRows(data ?? []));
  }, []);
  return rows;
}

export function slugify(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "pagina"
  );
}
