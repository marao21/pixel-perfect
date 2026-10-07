import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DailyDevotional } from "@/lib/devotionals";

// Tables created after the generated types; use an untyped handle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;

export type PixOption = { id: string; label: string; key: string; receiver: string; amount: number | null; qr: string };
export type Settings = { pix_key: string | null; pix_receiver: string | null; pix_qr_url: string | null; pix_options?: PixOption[] | null };
export type Video = { id: string; title: string; youtube_url: string; description: string | null; position: number; published: boolean };
export type Announcement = { id: string; title: string; body: string | null; published: boolean; created_at: string };
export type DevOverride = { day_of_year: number; title: string; verse: string | null; reference: string | null; body: string; author: string | null };

export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1]! : /^[\w-]{11}$/.test(url.trim()) ? url.trim() : null;
}

export function useSettings() {
  const [s, setS] = useState<Settings | null>(null);
  useEffect(() => {
    db.from("app_settings").select("pix_key,pix_receiver,pix_qr_url,pix_options").eq("id", 1).maybeSingle().then(({ data }: { data: Settings | null }) => setS(data));
  }, []);
  return s;
}

export function usePublished<T>(table: "videos" | "announcements", order: string, ascending: boolean) {
  const [rows, setRows] = useState<T[]>([]);
  useEffect(() => {
    db.from(table).select("*").eq("published", true).order(order, { ascending }).then(({ data }: { data: T[] | null }) => setRows(data ?? []));
  }, [table, order, ascending]);
  return rows;
}

export function useDevotionalOverride(day: number, fallback: DailyDevotional): DailyDevotional {
  const [o, setO] = useState<DevOverride | null>(null);
  useEffect(() => {
    setO(null);
    db.from("devotional_overrides").select("*").eq("day_of_year", day).maybeSingle().then(({ data }: { data: DevOverride | null }) => setO(data));
  }, [day]);
  if (!o) return fallback;
  return {
    ...fallback,
    title: o.title,
    verse: o.verse ?? fallback.verse,
    ref: o.reference ?? fallback.ref,
    body: o.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    author: o.author ?? fallback.author,
  };
}
