import { PLAN_180_RAW } from "./plan-data";
import { getOfflineBibleChapter, saveOfflineBibleChapter } from "./offline-db";
export type Book = { pt: string; en: string; ch: number };

export const BOOKS: Book[] = [
  ["Gênesis","genesis",50],["Êxodo","exodus",40],["Levítico","leviticus",27],["Números","numbers",36],["Deuteronômio","deuteronomy",34],
  ["Josué","joshua",24],["Juízes","judges",21],["Rute","ruth",4],["1 Samuel","1 samuel",31],["2 Samuel","2 samuel",24],
  ["1 Reis","1 kings",22],["2 Reis","2 kings",25],["1 Crônicas","1 chronicles",29],["2 Crônicas","2 chronicles",36],["Esdras","ezra",10],
  ["Neemias","nehemiah",13],["Ester","esther",10],["Jó","job",42],["Salmos","psalms",150],["Provérbios","proverbs",31],
  ["Eclesiastes","ecclesiastes",12],["Cantares","song of solomon",8],["Isaías","isaiah",66],["Jeremias","jeremiah",52],["Lamentações","lamentations",5],
  ["Ezequiel","ezekiel",48],["Daniel","daniel",12],["Oséias","hosea",14],["Joel","joel",3],["Amós","amos",9],
  ["Obadias","obadiah",1],["Jonas","jonah",4],["Miquéias","micah",7],["Naum","nahum",3],["Habacuque","habakkuk",3],
  ["Sofonias","zephaniah",3],["Ageu","haggai",2],["Zacarias","zechariah",14],["Malaquias","malachi",4],
  ["Mateus","matthew",28],["Marcos","mark",16],["Lucas","luke",24],["João","john",21],["Atos","acts",28],
  ["Romanos","romans",16],["1 Coríntios","1 corinthians",16],["2 Coríntios","2 corinthians",13],["Gálatas","galatians",6],["Efésios","ephesians",6],
  ["Filipenses","philippians",4],["Colossenses","colossians",4],["1 Tessalonicenses","1 thessalonians",5],["2 Tessalonicenses","2 thessalonians",3],["1 Timóteo","1 timothy",6],
  ["2 Timóteo","2 timothy",4],["Tito","titus",3],["Filemom","philemon",1],["Hebreus","hebrews",13],["Tiago","james",5],
  ["1 Pedro","1 peter",5],["2 Pedro","2 peter",3],["1 João","1 john",5],["2 João","2 john",1],["3 João","3 john",1],
  ["Judas","jude",1],["Apocalipse","revelation",22],
].map(([pt, en, ch]) => ({ pt: pt as string, en: en as string, ch: ch as number }));

export const VERSIONS = [
  { id: "ACF11", label: "ACF", lang: "pt" },
  { id: "ARC09", label: "ARC", lang: "pt" },
  { id: "ARA", label: "ARA", lang: "pt" },
  { id: "NAA", label: "NAA", lang: "pt" },
  { id: "NVIPT", label: "NVI", lang: "pt" },
  { id: "NVT", label: "NVT", lang: "pt" },
  { id: "NTLH", label: "NTLH", lang: "pt" },
];

export type Verse = { verse: number; text: string };

export class OfflineChapterUnavailableError extends Error {
  constructor() {
    super("Este capítulo ainda não foi salvo neste aparelho. Conecte-se à internet para carregá-lo uma vez.");
    this.name = "OfflineChapterUnavailableError";
  }
}

const clean = (t: string) =>
  t.replace(/<sup>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

export async function fetchChapter(bookIndex: number, chapter: number, version: string): Promise<Verse[]> {
  const cacheKey = `${version}:${bookIndex + 1}:${chapter}`;
  const cached = await getOfflineBibleChapter(cacheKey);
  const online = typeof navigator === "undefined" || navigator.onLine;

  if (!online) {
    if (cached) return cached;
    throw new OfflineChapterUnavailableError();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    let response: Response;
    try {
      response = await fetch(`https://bolls.life/get-text/${version}/${bookIndex + 1}/${chapter}/`, { signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) throw new Error("Não foi possível carregar o capítulo");
    const data: { verse: number; text: string }[] = await response.json();
    const verses = data.map((v) => ({ verse: v.verse, text: clean(v.text) }));
    await saveOfflineBibleChapter(cacheKey, verses);
    return verses;
  } catch {
    if (cached) return cached;
    throw new OfflineChapterUnavailableError();
  }
}

export type PlanDay = { day: number; label: string; refs: { book: Book; chapter: number }[] };
export type PlanLength = 90 | 180 | 365;
export const PLAN_LENGTHS: { id: PlanLength; label: string }[] = [
  { id: 90, label: "90 dias" },
  { id: 180, label: "180 dias" },
  { id: 365, label: "1 ano" },
];

type Ref = { book: Book; chapter: number };
const toRefs = (s: [number, number, number][]): Ref[] =>
  s.flatMap(([b, a, z]) => Array.from({ length: z - a + 1 }, (_, k) => ({ book: BOOKS[b]!, chapter: a + k })));

function labelOf(refs: Ref[]): string {
  const parts: string[] = [];
  let i = 0;
  while (i < refs.length) {
    const b = refs[i]!.book, a = refs[i]!.chapter;
    let z = a;
    while (i + 1 < refs.length && refs[i + 1]!.book === b && refs[i + 1]!.chapter === z + 1) { i++; z++; }
    parts.push(z === a ? `${b.pt} ${a}` : `${b.pt} ${a} ao ${z}`);
    i++;
  }
  return parts.join(" / ");
}

const BASE: PlanDay[] = PLAN_180_RAW.map((d, i) => ({ day: i + 1, label: d.label, refs: toRefs(d.s) }));

export function getPlan(len: PlanLength): PlanDay[] {
  if (len === 180) return BASE;
  if (len === 90) {
    return Array.from({ length: 90 }, (_, i) => {
      const refs = [...BASE[i * 2]!.refs, ...BASE[i * 2 + 1]!.refs];
      return { day: i + 1, label: labelOf(refs), refs };
    });
  }
  // 1 ano: cada dia de 180 dividido ao meio (seguindo a mesma ordem), até 365 dias
  const out: Ref[][] = [];
  BASE.forEach((d) => {
    if (d.refs.length < 2) { out.push(d.refs); return; }
    const h = Math.ceil(d.refs.length / 2);
    out.push(d.refs.slice(0, h), d.refs.slice(h));
  });
  while (out.length > 365) {
    let k = 0;
    for (let j = 1; j < out.length - 1; j++) if (out[j]!.length + out[j + 1]!.length < out[k]!.length + out[k + 1]!.length) k = j;
    out.splice(k, 2, [...out[k]!, ...out[k + 1]!]);
  }
  while (out.length < 365) {
    let k = 0;
    out.forEach((r, j) => { if (r.length > out[k]!.length) k = j; });
    const r = out[k]!, h = Math.ceil(r.length / 2);
    out.splice(k, 1, r.slice(0, h), r.slice(h));
  }
  return out.map((refs, i) => ({ day: i + 1, label: labelOf(refs), refs }));
}

export const PLAN: PlanDay[] = BASE;
