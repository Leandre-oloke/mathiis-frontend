import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExamMarkdown } from "@/components/exam/ExamMarkdown";
import { SAMPLE_EXAM } from "@/lib/sample-exam";

const numbers = (container: HTMLElement) =>
  [...container.querySelectorAll("span.font-semibold")].map((n) => n.textContent).filter((t) => /^\d+\.$/.test(t ?? ""));

describe("ExamMarkdown", () => {
  it("numbers questions continuously across problems", () => {
    const md = "## Problème I\n\n1. Première\n2. Deuxième\n\n## Problème II\n\n1. Troisième\n2. Quatrième\n";
    const { container } = render(<ExamMarkdown text={md} />);
    expect(numbers(container)).toEqual(["1.", "2.", "3.", "4."]);
  });

  it("does not count bullet points as questions", () => {
    const md = "- une remarque\n- une autre\n\n1. Question\n";
    const { container } = render(<ExamMarkdown text={md} />);
    expect(numbers(container)).toEqual(["1."]);
    expect(container.querySelectorAll("ul > li")).toHaveLength(2);
  });

  it("renders the same numbers on every render (server and client agree)", () => {
    const md = "1. A\n2. B\n";
    const { container, rerender } = render(<ExamMarkdown text={md} />);
    rerender(<ExamMarkdown text={md} />);
    expect(numbers(container)).toEqual(["1.", "2."]);
  });

  it("renders formulas with KaTeX instead of raw LaTeX", () => {
    const { container } = render(<ExamMarkdown text={"Soit $A(2;-1;3)$."} />);
    expect(container.querySelector(".katex")).not.toBeNull();
    expect(container.textContent).not.toContain("$A(2;-1;3)$");
  });

  it("draws [FIGURE] markers", () => {
    const { container } = render(<ExamMarkdown text={"[FIGURE: type=repere3d points=A(2,-1,3),B(-1,4,0)]"} />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.textContent).not.toContain("[FIGURE");
  });

  it("hides a half-written formula while streaming", () => {
    render(<ExamMarkdown text={"Calcule $\\frac{1"} streaming />);
    expect(screen.queryByText(/frac/)).toBeNull();
    expect(screen.getByText(/Calcule/)).toBeInTheDocument();
  });

  it("renders the home-page excerpt with its four questions", () => {
    const { container } = render(<ExamMarkdown text={SAMPLE_EXAM.markdown} />);
    expect(numbers(container)).toEqual(["1.", "2.", "3.", "4."]);
    expect(screen.getByText("Contexte")).toBeInTheDocument();
  });
});
