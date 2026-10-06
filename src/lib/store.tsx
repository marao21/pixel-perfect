import { createContext, useContext, useState, type ReactNode } from "react";

// Mock state shaped like the future Supabase tables:
// profiles, reading_plan, user_progress, mural_posts, devotionals.
export type Profile = { id: string; name: string; done: number; streak: number };
export type Comment = { author: string; text: string };
export type Post = { id: string; author: string; createdAt: string; text: string; likes: number; liked: boolean; comments: Comment[] };
export type Devotional = { day: number; title: string; verse: string; ref: string; body: string[] };

export const CURRENT_DAY = 23;
export const ME = { id: "me", name: "Andrea" };

const initialDone = new Set(Array.from({ length: 20 }, (_, i) => i + 1));

const PROFILES: Profile[] = [
  { id: "1", name: "Pr. Marcos", done: 23, streak: 23 },
  { id: "2", name: "João Pedro", done: 22, streak: 15 },
  { id: "3", name: "Carlos Henrique", done: 21, streak: 12 },
  { id: "4", name: "Ricardo Alves", done: 18, streak: 6 },
  { id: "5", name: "Felipe Souza", done: 17, streak: 9 },
  { id: "6", name: "Thiago Lima", done: 14, streak: 3 },
  { id: "7", name: "Bruno Costa", done: 11, streak: 1 },
];

export const DEVOTIONALS: Devotional[] = [
  { day: 23, title: "Firmeza no meio da tempestade", verse: "Sede firmes, inabaláveis e sempre abundantes na obra do Senhor.", ref: "1 Coríntios 15:58", body: [
    "Homem de Deus não é medido pela ausência de tempestades, mas pela firmeza com que permanece de pé quando elas chegam.",
    "Hoje, escolha ser constante: na leitura, na oração, no cuidado com sua família. A constância silenciosa constrói legado.",
    "Prática: ore com sua esposa ou filhos antes de dormir. Cinco minutos. Todos os dias desta semana." ] },
  { day: 22, title: "Liderança que serve", verse: "Quem quiser tornar-se grande entre vós, será esse o que vos sirva.", ref: "Mateus 20:26", body: [
    "Cristo inverteu a lógica do poder. Liderar é carregar o peso primeiro, não por último.",
    "Em casa e no trabalho, procure uma oportunidade concreta de servir sem ser notado.",
    "Prática: assuma hoje uma tarefa que normalmente você deixa para outro." ] },
  { day: 21, title: "Integridade no oculto", verse: "O que anda em integridade anda seguro.", ref: "Provérbios 10:9", body: [
    "Integridade é ser o mesmo homem quando ninguém está olhando.",
    "Pequenas concessões abrem grandes brechas. Feche as portas antes que se tornem caminhos.",
    "Prática: confesse a um irmão do grupo uma área em que você precisa de prestação de contas." ] },
  { day: 20, title: "O sacerdote do lar", verse: "Eu e a minha casa serviremos ao Senhor.", ref: "Josué 24:15", body: [
    "Josué não decidiu só por si. Decidiu pela casa. Essa é a vocação do homem cristão.",
    "Sua família precisa ver sua fé em ação, não apenas ouvir sobre ela.",
    "Prática: leia um salmo em voz alta à mesa no jantar de hoje." ] },
];

type Ctx = {
  done: Set<number>;
  toggle: (d: number) => void;
  profiles: Profile[];
  posts: Post[];
  addPost: (t: string) => void;
  like: (id: string) => void;
  comment: (id: string, t: string) => void;
};

const C = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState<Set<number>>(initialDone);
  const [posts, setPosts] = useState<Post[]>([
    { id: "p1", author: "Pr. Marcos", createdAt: "Hoje, 06:12", text: "“Esforça-te e tem bom ânimo.” Js 1:9 — Bom dia, Mamutes! Ninguém fica para trás.", likes: 9, liked: false, comments: [{ author: "João Pedro", text: "Amém, pastor! 🔥" }] },
    { id: "p2", author: "Felipe Souza", createdAt: "Ontem, 21:40", text: "Pedido de oração: minha mãe faz cirurgia na quinta. Contem comigo nas orações.", likes: 14, liked: false, comments: [] },
  ]);

  const toggle = (d: number) => setDone((s) => { const n = new Set(s); n.has(d) ? n.delete(d) : n.add(d); return n; });
  const addPost = (text: string) => setPosts((p) => [{ id: crypto.randomUUID(), author: ME.name, createdAt: "Agora", text, likes: 0, liked: false, comments: [] }, ...p]);
  const like = (id: string) => setPosts((p) => p.map((x) => x.id === id ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x));
  const comment = (id: string, text: string) => setPosts((p) => p.map((x) => x.id === id ? { ...x, comments: [...x.comments, { author: ME.name, text }] } : x));

  let streak = 0;
  for (let d = CURRENT_DAY; d > 0 && done.has(d); d--) streak++;
  if (!done.has(CURRENT_DAY)) { streak = 0; for (let d = CURRENT_DAY - 1; d > 0 && done.has(d); d--) streak++; }
  const profiles = [...PROFILES, { id: ME.id, name: `${ME.name} (você)`, done: done.size, streak }]
    .sort((a, b) => b.done - a.done || b.streak - a.streak);

  return <C.Provider value={{ done, toggle, profiles, posts, addPost, like, comment }}>{children}</C.Provider>;
}

export const useStore = () => {
  const c = useContext(C);
  if (!c) throw new Error("StoreProvider missing");
  return c;
};
