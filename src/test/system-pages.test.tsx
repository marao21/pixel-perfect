import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SystemPagesEditor } from "@/components/SystemPagesEditor";
import { SystemPageContent } from "@/components/SystemPageContent";
import { defaultSystemPage, normalizeHomeSections, systemPageSlug, type SystemPage } from "@/lib/system-pages";
import { newBlock } from "@/lib/page-blocks";

const store = vi.hoisted(() => ({ rows: {} as Record<string, SystemPage>, writes: vi.fn(), fail: false }));
vi.mock("@/lib/content", async (original) => {
  const actual = await original<typeof import("@/lib/content")>();
  return { ...actual, db: { from: (table: string) => {
    let slug = "home";
    let value: SystemPage | undefined;
    const query = {
      select: () => query,
      eq: (_key: string, next: string) => { slug = next; return query; },
      order: () => Promise.resolve({ data: [], error: null }),
      maybeSingle: () => Promise.resolve({ data: store.rows[slug] ?? null, error: null }),
      upsert: (next: SystemPage) => { value = next; return query; },
      single: () => {
        if (store.fail) return Promise.resolve({ data: null, error: { message: "denied" } });
        if (value && table === "system_pages") { store.rows[value.slug] = value; store.writes(value); }
        return Promise.resolve({ data: value, error: null });
      },
    };
    return query;
  } } };
});

afterEach(() => { cleanup(); store.rows = {}; store.writes.mockClear(); store.fail = false; });
function editor() {
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><SystemPagesEditor /></QueryClientProvider>);
}
describe("built-in tab editing", () => {
  it("maps every built-in tab without affecting admin or custom pages", () => {
    expect(systemPageSlug("/")).toBe("home");
    expect(systemPageSlug("/biblia/")).toBe("biblia");
    expect(systemPageSlug("/admin")).toBeUndefined();
    expect(systemPageSlug("/p/lesson")).toBeUndefined();
  });
  it("preserves Home section order and visibility without duplicates", () => {
    const result = normalizeHomeSections([{ id: "devotional", visible: false }, { id: "reading", visible: true }, { id: "reading", visible: false }]);
    expect(result.map((item) => item.id)).toEqual(["devotional", "reading", "progress", "feed"]);
    expect(result[0]?.visible).toBe(false);
  });
  it("renders custom content before/after original and can replace original", () => {
    const page = { ...defaultSystemPage("oferta"), title: "Campanha", content_blocks: [{ ...newBlock("text"), text: "Conteúdo do líder" }] };
    const { container, rerender } = render(<SystemPageContent page={page}><p>Original</p></SystemPageContent>);
    expect(container.textContent).toBe("CampanhaConteúdo do líderOriginal");
    rerender(<SystemPageContent page={{ ...page, content_position: "after" }}><p>Original</p></SystemPageContent>);
    expect(container.textContent).toBe("CampanhaOriginalConteúdo do líder");
    rerender(<SystemPageContent page={{ ...page, show_original: false }}><p>Original</p></SystemPageContent>);
    expect(screen.queryByText("Original")).not.toBeInTheDocument();
  });
  it("edits Home, reorders and hides sections, saves and reads back", async () => {
    editor();
    await screen.findByLabelText("Título de abertura (opcional)");
    fireEvent.change(screen.getByLabelText("Título de abertura (opcional)"), { target: { value: "Nossa Home" } });
    fireEvent.click(screen.getByRole("switch", { name: "Progresso e ofensiva" }));
    fireEvent.click(screen.getByRole("button", { name: "Subir Devocional do dia" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações da aba" }));
    await waitFor(() => expect(store.writes).toHaveBeenCalledOnce());
    expect(store.rows["home"]?.title).toBe("Nossa Home");
    expect(store.rows["home"]?.home_sections.map((section) => section.id)).toEqual(["reading", "devotional", "progress", "feed"]);
    expect(store.rows["home"]?.home_sections.find((section) => section.id === "progress")?.visible).toBe(false);
    fireEvent.change(screen.getByLabelText("Aba"), { target: { value: "plano" } });
    await waitFor(() => expect(screen.getByLabelText("Título de abertura (opcional)")).toHaveValue(""));
    fireEvent.change(screen.getByLabelText("Aba"), { target: { value: "home" } });
    await waitFor(() => expect(screen.getByLabelText("Título de abertura (opcional)")).toHaveValue("Nossa Home"));
  });
  it("keeps edits available after a failed save", async () => {
    store.fail = true;
    editor();
    await screen.findByLabelText("Título de abertura (opcional)");
    fireEvent.change(screen.getByLabelText("Título de abertura (opcional)"), { target: { value: "Não perder" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações da aba" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Salvar alterações da aba" })).not.toBeDisabled());
    expect(screen.getByLabelText("Título de abertura (opcional)")).toHaveValue("Não perder");
    expect(store.writes).not.toHaveBeenCalled();
  });
});