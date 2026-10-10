import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/content";
import { PLAN_180_RAW } from "@/lib/plan-data";

export type PlanRaw = { label: string; s: [number, number, number][] }[];
export type PecadoDay = { ref: string; chapter: number; tema: string; verse: number };

/** Editable fixed texts per tab: key, label, default value. */
export const TEXT_FIELDS: { tab: string; fields: { key: string; label: string; def: string }[] }[] = [
  { tab: "Home", fields: [
    { key: "home_reading_link", label: "Link da leitura", def: "Abrir texto da leitura" },
    { key: "home_progress", label: "Título do progresso", def: "Progresso" },
    { key: "home_streak", label: "Título da ofensiva", def: "Ofensiva" },
    { key: "home_streak_sub", label: "Texto da ofensiva", def: "dias seguidos" },
    { key: "home_dev_title", label: "Título do devocional", def: "Devocional do dia" },
    { key: "home_dev_link", label: "Link do devocional", def: "Ler completo" },
  ] },
  { tab: "Plano", fields: [{ key: "plano_title", label: "Título", def: "Plano" }] },
  { tab: "Bíblia", fields: [
    { key: "biblia_title", label: "Título", def: "Bíblia" },
    { key: "biblia_kicker", label: "Subtítulo", def: "Palavra de Deus" },
  ] },
  { tab: "Oferta", fields: [
    { key: "oferta_kicker", label: "Subtítulo", def: "Igreja Batista Belém" },
    { key: "oferta_title", label: "Título", def: "Oferta" },
    { key: "oferta_headline", label: "Chamada", def: "Ofertar é um ato de gratidão" },
    { key: "oferta_help", label: "Instrução", def: "Aponte a câmera do seu banco para o QR Code ou copie a chave Pix." },
  ] },
  { tab: "Pecado", fields: [
    { key: "pecado_kicker", label: "Subtítulo", def: "2ª temporada · Romanos" },
    { key: "pecado_title", label: "Título", def: "Pecado, aqui não!" },
    { key: "pecado_headline", label: "Chamada", def: "21 dias de oração, leitura da Palavra e testemunho" },
    { key: "pecado_sub", label: "Texto destaque", def: "Debulhando o livro de Romanos" },
    { key: "pecado_footer", label: "Rodapé", def: "Ore • Leia • Reflita • Pratique • Testemunhe" },
  ] },
  { tab: "Devocional", fields: [
    { key: "dev_kicker", label: "Subtítulo", def: "Todos os dias do ano" },
    { key: "dev_title", label: "Título", def: "Devocional Diário" },
  ] },
  { tab: "Tempo com Deus", fields: [
    { key: "tempo_title", label: "Título", def: "Tempo com Deus" },
    { key: "tempo_quote", label: "Frase", def: "“Separe alguns minutos do seu dia para estar na presença de Deus.”" },
    { key: "tempo_choose", label: "Escolha o tempo", def: "Escolha o tempo" },
    { key: "tempo_done", label: "Mensagem final", def: "Tempo com Deus concluído ❤️" },
  ] },
];
const DEFAULT_TEXTS = Object.fromEntries(TEXT_FIELDS.flatMap((t) => t.fields.map((f) => [f.key, f.def])));

export const DEFAULT_PECADO: PecadoDay[] = ([
  ["Romanos 1:14-17", 1, "Não me envergonho do Evangelho", 14],
  ["Romanos 1:28-32", 1, "Desprezaram o conhecimento de Deus", 28],
  ["Romanos 2:1-11", 2, "Em Deus não há parcialidade", 1],
  ["Romanos 2:17-24", 2, "O nome de Deus é blasfemado...", 17],
  ["Romanos 3:9-20", 3, "Ninguém é justo", 9],
  ["Romanos 3:21-26", 3, "Todos pecaram", 21],
  ["Romanos 4:1-8", 4, "Feliz quem tem pecados perdoados", 1],
  ["Romanos 4:18-25", 4, "A promessa recebida pela fé", 18],
  ["Romanos 5:1-11", 5, "Os frutos da paz de Deus", 1],
  ["Romanos 5:12-21", 5, "Morte em Adão, vida em Cristo", 12],
  ["Romanos 6:1-14", 6, "Mortos para o pecado, vivos para Deus", 1],
  ["Romanos 6:15-23", 6, "O salário do pecado é a morte", 15],
  ["Romanos 7:1-6", 7, "O casamento e a lei", 1],
  ["Romanos 7:12-20", 7, "A luta contra o pecado", 12],
  ["Romanos 8:1-17", 8, "Vida controlada pelo Espírito", 1],
  ["Romanos 8:18-27", 8, "A glória futura", 18],
  ["Romanos 8:28-39", 8, "Mais que vencedores", 28],
  ["Romanos 9:14-21", 9, "A escolha soberana de Deus", 14],
  ["Romanos 10:1-11", 10, "Quem nele confia não se envergonha", 1],
  ["Romanos 11:33-36", 11, "A Ele seja a glória para sempre", 33],
  ["Romanos 12:1-2 / 9-21", 12, "Vença o mal com o bem", 1],
] as [string, number, string, number][]).map(([ref, chapter, tema, verse]) => ({ ref, chapter, tema, verse }));

export function useOverride<T>(key: string) {
  return useQuery<T | null>({
    queryKey: ["override", key],
    queryFn: async () => {
      const { data, error } = await db.from("content_overrides").select("data").eq("key", key).maybeSingle();
      if (error) throw error;
      return (data?.data as T) ?? null;
    },
    staleTime: 60_000,
    retry: 1,
  });
}

export function useSaveOverride() {
  const qc = useQueryClient();
  return async (key: string, data: unknown) => {
    const { error } = await db.from("content_overrides").upsert({ key, data });
    if (error) throw error;
    await qc.invalidateQueries({ queryKey: ["override", key] });
  };
}

export async function resetOverride(key: string) {
  const { error } = await db.from("content_overrides").delete().eq("key", key);
  if (error) throw error;
}

export function useTexts() {
  const { data } = useOverride<Record<string, string>>("texts");
  return (key: string) => (data?.[key]?.trim() ? data[key]! : DEFAULT_TEXTS[key] ?? key);
}

export function usePecadoDays(): PecadoDay[] {
  const { data } = useOverride<PecadoDay[]>("pecado_days");
  return Array.isArray(data) && data.length ? data : DEFAULT_PECADO;
}

export function usePlanRaw(): PlanRaw {
  const { data } = useOverride<PlanRaw>("plan180");
  return Array.isArray(data) && data.length === 180 ? data : PLAN_180_RAW;
}
