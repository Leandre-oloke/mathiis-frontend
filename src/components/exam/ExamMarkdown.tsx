"use client";

import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Figure3D, isFigureMarker } from "./Figure3D";

/** While text is still streaming, drops a formula that is not closed yet so raw LaTeX never flashes on screen. */
export function trimUnclosedMath(text: string) {
  const display = text.split("$$").length - 1;
  if (display % 2 === 1) return text.slice(0, text.lastIndexOf("$$"));
  const inline = (text.replace(/\$\$/g, "").match(/(?<!\\)\$/g) ?? []).length;
  if (inline % 2 === 1) return text.slice(0, text.lastIndexOf("$"));
  return text;
}

type HastNode = { type: string; tagName?: string; properties?: Record<string, unknown>; children?: HastNode[] };

/** Numbers the items of every numbered list in document order (data-question), so question numbers stay
 *  continuous across the whole exam even when a list is interrupted by text or a figure (Problème I: 1-5, II: 6-10…).
 *  Bulleted-list items are left alone. Done on the tree, not during rendering, so it is deterministic. */
export function rehypeNumberQuestions() {
  return (tree: HastNode) => {
    let n = 0;
    const walk = (node: HastNode) => {
      for (const child of node.children ?? []) {
        if (node.tagName === "ol" && child.tagName === "li") child.properties = { ...child.properties, dataQuestion: ++n };
        walk(child);
      }
    };
    walk(tree);
  };
}

const textOf = (node: ReactNode): string =>
  typeof node === "string" ? node : Array.isArray(node) ? node.map(textOf).join("") : "";

const baseComponents: Components = {
  h1: ({ children }) => <h1 className="mb-4 mt-8 border-b border-foreground/20 pb-2 font-paper text-2xl font-bold">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-3 mt-7 font-display text-sm font-semibold uppercase tracking-[0.08em]">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-5 font-display text-base font-semibold">{children}</h3>,
  h4: ({ children }) => <h4 className="mb-1 mt-4 text-sm font-semibold">{children}</h4>,
  p: ({ children }) => {
    const text = textOf(children);
    if (isFigureMarker(text)) return <Figure3D spec={text} />;
    return <p className="mb-3 leading-7">{children}</p>;
  },
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="mb-3 list-inside list-disc space-y-1 pl-2">{children}</ul>,
  hr: () => <hr className="my-4 border-foreground/20" />,
  blockquote: ({ children }) => <blockquote className="my-3 border-l-2 border-foreground pl-4 italic">{children}</blockquote>,
  table: ({ children }) => <div className="my-4 overflow-x-auto"><table className="w-full border-collapse border border-foreground/40 text-sm">{children}</table></div>,
  thead: ({ children }) => <thead className="bg-foreground/[0.04]">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-foreground/20">{children}</tr>,
  th: ({ children }) => <th className="border border-foreground/40 px-3 py-2 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-foreground/40 px-3 py-2">{children}</td>,
  code: ({ children, className }) =>
    className?.includes("language-")
      ? <code className="my-3 block overflow-x-auto rounded-lg border border-foreground/20 bg-foreground/[0.03] p-3 font-mono text-sm">{children}</code>
      : <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-sm">{children}</code>,
};

const components: Components = {
  ...baseComponents,
  ol: ({ children }) => <div className="mb-3 space-y-1">{children}</div>,
  li: ({ children, node }) => {
    const number = node?.properties?.dataQuestion;
    if (number === undefined) return <li>{children}</li>;
    return (
      <div className="flex gap-1.5 leading-7">
        <span className="shrink-0 font-semibold">{String(number)}.</span>
        <span>{children}</span>
      </div>
    );
  },
};

/** Renders an exam written by the model: Markdown + LaTeX (KaTeX) + [FIGURE] drawings, on a paper-like sheet. */
export function ExamMarkdown({ text, streaming = false }: { text: string; streaming?: boolean }) {
  return (
    <div className="exam-content font-paper text-[15px]">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeNumberQuestions, rehypeKatex]} components={components}>
        {streaming ? trimUnclosedMath(text) : text}
      </ReactMarkdown>
    </div>
  );
}
