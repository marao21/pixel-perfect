import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BOOKS } from "@/lib/bible";
import { PLAN_180_RAW } from "@/lib/plan-data";
import {
  DEFAULT_PECADO, TEXT_FIELDS, resetOverride, useOverride, usePecadoDays, usePlanRaw,
  useSaveOverride, type PecadoDay, type PlanRaw,
} from "@/lib/overrides";

const SECTIONS = [
  { id: "textos", label: "Textos das abas" },
  { id: "pecado", label: "Pecado (dias)" },
  { id: "plano", label: "Plano de leitura" },
] as const;

export function OriginalContentEditor() {
  const [sec, setSec] = useState<(typeof SECTIONS)[number]["id"]>("textos");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-secondary p-1">
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setSec(s.id)}
            className={`rounded-lg px-2 py-2 text-xs font-bold ${sec === s.id ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            {s.label}
          </button>
        ))}
      </div>
      {sec === "textos" && <TextsEditor />}
      {sec === "pecado" && <PecadoEditor />}
      {sec === "plano" && <PlanEditor />}
    </div>
  );
}

function useResetter(key: string) {
  const qc = useQueryClient();
  return async () => {
    if (!confirm("Voltar ao conteúdo original?")) return;
    try { await resetOverride(key); await qc.invalidateQueries({ queryKey: ["override", key] }); toast.success("Restaurado"); }
    catch (e) { toast.error((e as Error).message); }
  };
}

function TextsEditor() {
  const { data } = useOverride<Record<string, string>>("texts");
  const save = useSaveOverride();
  const [vals, setVals] = useState<Record<string, string>>({});
  const reset = useResetter("texts");
  useEffect(() => { setVals(data ?? {}); }, [data]);
  return (
    <div className="space-y-5">
      {TEXT_FIELDS.map((t) => (
        <div key={t.tab} className="rounded-xl border border-border bg-card p-3">
          <p className="mb-2 font-display text-lg uppercase text-gold">{t.tab}</p>
          <div className="space-y-2">
            {t.fields.map((f) => (
              <div key={f.key}>
                <Label className="text-xs">{f.label}</Label>
                <Input value={vals[f.key] ?? ""} placeholder={f.def}
                  onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">Campo vazio = usa o texto original (mostrado em cinza).</p>
      <div className="flex gap-2">
        <Button onClick={async () => { try { await save("texts", vals); toast.success("Textos salvos"); } catch (e) { toast.error((e as Error).message); } }}>Salvar textos</Button>
        <Button variant="outline" onClick={reset}>Restaurar original</Button>
      </div>
    </div>
  );
}

function PecadoEditor() {
  const current = usePecadoDays();
  const save = useSaveOverride();
  const reset = useResetter("pecado_days");
  const [days, setDays] = useState<PecadoDay[]>(current);
  useEffect(() => { setDays(current); }, [current]);
  const upd = (i: number, p: Partial<PecadoDay>) => setDays(days.map((d, j) => (j === i ? { ...d, ...p } : d)));
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Os dias abrem o livro de Romanos no capítulo e versículo indicados.</p>
      {days.map((d, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gold">Dia {i + 1}</span>
            <Button size="icon" variant="ghost" aria-label="Remover dia" onClick={() => setDays(days.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div><Label className="text-xs">Referência</Label><Input value={d.ref} onChange={(e) => upd(i, { ref: e.target.value })} /></div>
            <div><Label className="text-xs">Tema</Label><Input value={d.tema} onChange={(e) => upd(i, { tema: e.target.value })} /></div>
            <div><Label className="text-xs">Capítulo de Romanos</Label><Input type="number" min={1} max={16} value={d.chapter} onChange={(e) => upd(i, { chapter: Math.max(1, Number(e.target.value) || 1) })} /></div>
            <div><Label className="text-xs">Versículo inicial</Label><Input type="number" min={1} value={d.verse} onChange={(e) => upd(i, { verse: Math.max(1, Number(e.target.value) || 1) })} /></div>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={() => setDays([...days, { ref: "Romanos ", chapter: 1, tema: "", verse: 1 }])}><Plus className="h-4 w-4" /> Adicionar dia</Button>
      <div className="flex gap-2">
        <Button onClick={async () => { try { await save("pecado_days", days); toast.success("Dias salvos"); } catch (e) { toast.error((e as Error).message); } }}>Salvar dias</Button>
        <Button variant="outline" onClick={reset}>Restaurar original ({DEFAULT_PECADO.length} dias)</Button>
      </div>
    </div>
  );
}

function PlanEditor() {
  const current = usePlanRaw();
  const save = useSaveOverride();
  const reset = useResetter("plan180");
  const [plan, setPlan] = useState<PlanRaw>(current);
  const [day, setDay] = useState(1);
  useEffect(() => { setPlan(current); }, [current]);
  const d = plan[day - 1]!;
  const updDay = (p: Partial<PlanRaw[number]>) => setPlan(plan.map((x, j) => (j === day - 1 ? { ...x, ...p } : x)));
  const updSeg = (k: number, idx: 0 | 1 | 2, v: number) =>
    updDay({ s: d.s.map((seg, j) => (j === k ? (seg.map((n, m) => (m === idx ? v : n)) as [number, number, number]) : seg)) });
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Edite o plano de 180 dias. Os planos de 90 dias e 1 ano são montados automaticamente a partir dele.</p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={day <= 1} onClick={() => setDay(day - 1)}>‹</Button>
        <Label className="text-sm">Dia</Label>
        <Input className="w-24" type="number" min={1} max={180} value={day} onChange={(e) => setDay(Math.min(180, Math.max(1, Number(e.target.value) || 1)))} />
        <span className="text-xs text-muted-foreground">de 180</span>
        <Button variant="outline" size="sm" disabled={day >= 180} onClick={() => setDay(day + 1)}>›</Button>
      </div>
      <div className="rounded-xl border border-border bg-card p-3 space-y-3">
        <div><Label className="text-xs">Nome do dia</Label><Input value={d.label} onChange={(e) => updDay({ label: e.target.value })} /></div>
        {d.s.map(([b, a, z], k) => (
          <div key={k} className="grid grid-cols-[1fr_70px_70px_auto] items-end gap-2">
            <div>
              <Label className="text-xs">Livro</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground" value={b}
                onChange={(e) => updSeg(k, 0, Number(e.target.value))}>
                {BOOKS.map((bk, i) => <option key={i} value={i}>{bk.pt}</option>)}
              </select>
            </div>
            <div><Label className="text-xs">De</Label><Input type="number" min={1} max={BOOKS[b]!.ch} value={a} onChange={(e) => updSeg(k, 1, Math.max(1, Number(e.target.value) || 1))} /></div>
            <div><Label className="text-xs">Até</Label><Input type="number" min={a} max={BOOKS[b]!.ch} value={z} onChange={(e) => updSeg(k, 2, Math.max(a, Math.min(BOOKS[b]!.ch, Number(e.target.value) || a)))} /></div>
            <Button size="icon" variant="ghost" aria-label="Remover trecho" disabled={d.s.length <= 1} onClick={() => updDay({ s: d.s.filter((_, j) => j !== k) })}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => updDay({ s: [...d.s, [0, 1, 1]] })}><Plus className="h-4 w-4" /> Adicionar trecho</Button>
      </div>
      <div className="flex gap-2">
        <Button onClick={async () => { try { await save("plan180", plan); toast.success("Plano salvo"); } catch (e) { toast.error((e as Error).message); } }}>Salvar plano</Button>
        <Button variant="outline" onClick={reset}>Restaurar original</Button>
      </div>
      {plan === PLAN_180_RAW && <p className="text-xs text-muted-foreground">Usando o plano original.</p>}
    </div>
  );
}
