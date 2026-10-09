import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { PageBlockEditor } from "@/components/PageBlockEditor";
import { PageBlocks } from "@/components/PageBlocks";
import { blocksForPage, blockError, moveBlock, newBlock, safeLink, internalPageSlug } from "@/lib/page-blocks";
import type { CustomPage } from "@/lib/content";
import { useState } from "react";

const page: CustomPage = { id: "p", slug: "lesson", title: "Estudo", body: "Texto anterior", youtube_url: null, videos: [{ url: "https://youtu.be/dQw4w9WgXcQ", title: "Vídeo anterior", text: "Texto oculto" }], position: 0, published: true, show_in_menu: false };

describe("custom page blocks", () => {
  it("preserves legacy videos and their collapsed text", () => {
    const blocks = blocksForPage(page);
    expect(blocks.map((b) => b.type)).toEqual(["video", "text"]);
    expect(blocks[0]?.collapsed).toBe(true);
    expect(blocksForPage({ ...page, content_blocks: [] })).toEqual([]);
  });
  it("rejects executable links and invalid media", () => {
    expect(safeLink("javascript:alert(1)")).toBeNull();
    expect(safeLink("//evil.example")).toBeNull();
    expect(safeLink("/p/lesson")).toBe("/p/lesson");
    expect(internalPageSlug("/p/lesson")).toBe("lesson");
    expect(blockError(newBlock("video"))).toBeTruthy();
    expect(blockError({ ...newBlock("image"), path: "saved.jpg" })).toBeNull();
  });
  it("moves entire blocks without losing their content", () => {
    const blocks = [newBlock("heading"), newBlock("video"), newBlock("image")];
    expect(moveBlock(blocks, 2, -1).map((b) => b.type)).toEqual(["heading", "image", "video"]);
    expect(moveBlock(blocks, 0, -1)).toBe(blocks);
  });
  it("shows collapsed video text only on request", () => {
    render(<PageBlocks blocks={blocksForPage(page)} pageTitle={page.title} />);
    expect(screen.queryByText("Texto oculto")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mostrar texto" }));
    expect(screen.getByText("Texto oculto")).toBeInTheDocument();
  });
  it("adds and reorders items through editor controls", () => {
    function Harness() {
      const [blocks, setBlocks] = useState([newBlock("heading")]);
      return <PageBlockEditor blocks={blocks} onChange={setBlocks} pages={[page]} />;
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: /^Vídeo$/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "Link do YouTube" }), { target: { value: "https://youtu.be/dQw4w9WgXcQ" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Mover para cima" })[1] as HTMLElement);
    expect(screen.getAllByRole("textbox")[0]).toHaveAttribute("aria-label", "Link do YouTube");
    expect(screen.getByRole("textbox", { name: "Link do YouTube" })).toHaveValue("https://youtu.be/dQw4w9WgXcQ");
  });
});