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
  { id: "almeida", label: "Almeida (PT)", lang: "pt" },
  { id: "kjv", label: "King James (EN)", lang: "en" },
  { id: "web", label: "World English (EN)", lang: "en" },
  { id: "bbe", label: "Basic English (EN)", lang: "en" },
];

export type Verse = { verse: number; text: string };

export async function fetchChapter(bookEn: string, chapter: number, version: string): Promise<Verse[]> {
  const r = await fetch(
    `https://bible-api.com/${encodeURIComponent(`${bookEn} ${chapter}`)}?translation=${version}`,
  );
  if (!r.ok) throw new Error("Não foi possível carregar o capítulo");
  const j = await r.json();
  return (j.verses ?? []).map((v: { verse: number; text: string }) => ({ verse: v.verse, text: v.text.trim() }));
}

export type PlanDay = { day: number; label: string; refs: { book: Book; chapter: number }[] };

export const PLAN: PlanDay[] = (() => {
  const all = BOOKS.flatMap((b) => Array.from({ length: b.ch }, (_, i) => ({ book: b, chapter: i + 1 })));
  const days: PlanDay[] = [];
  for (let d = 0; d < 180; d++) {
    const refs = all.slice(Math.round((d * all.length) / 180), Math.round(((d + 1) * all.length) / 180));
    const first = refs[0]!, last = refs[refs.length - 1]!;
    const label =
      first.book === last.book
        ? `${first.book.pt} ${first.chapter}${first.chapter !== last.chapter ? `–${last.chapter}` : ""}`
        : `${first.book.pt} ${first.chapter} – ${last.book.pt} ${last.chapter}`;
    days.push({ day: d + 1, label, refs });
  }
  return days;
})();
