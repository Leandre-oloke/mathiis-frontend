import { describe, expect, it } from "vitest";
import { trimUnclosedMath } from "@/components/exam/ExamMarkdown";
import { isFigureMarker, parseFigure } from "@/components/exam/Figure3D";

describe("trimUnclosedMath (texte en cours de génération)", () => {
  it("keeps text whose formulas are all closed", () => {
    const text = "Soit $A(2;-1;3)$ et $$x^2$$ fin.";
    expect(trimUnclosedMath(text)).toBe(text);
  });

  it("drops an inline formula that is still being written", () => {
    expect(trimUnclosedMath("Le point $A(2;-1")).toBe("Le point ");
  });

  it("drops a display formula that is still being written", () => {
    expect(trimUnclosedMath("Réduis $$2\\overrightarrow{MA}+")).toBe("Réduis ");
  });

  it("ignores escaped dollar signs", () => {
    expect(trimUnclosedMath("Prix : 5 \\$ et $x$")).toBe("Prix : 5 \\$ et $x$");
  });
});

describe("parseFigure", () => {
  it("reads points, planes, vectors and edges from a model marker", () => {
    const fig = parseFigure("[FIGURE: type=repere3d points=A(1,-1,2),B(5,1,0),D(-1,2,1.5) vecteurs=AB,AD planes=ABD aretes=AB,BD]");
    expect(fig.type).toBe("repere3d");
    expect(fig.points).toEqual({ A: [1, -1, 2], B: [5, 1, 0], D: [-1, 2, 1.5] });
    expect(fig.vectors).toEqual(["AB", "AD"]);
    expect(fig.planes).toEqual(["ABD"]);
    expect(fig.edges).toEqual(["AB", "BD"]);
  });

  it("accepts the French « plans » key with several planes", () => {
    expect(parseFigure("[FIGURE: type=repere3d points=A(0,0,5) plans=ABC;DEF]").planes).toEqual(["ABC", "DEF"]);
  });

  it("recognises figure paragraphs only", () => {
    expect(isFigureMarker("  [FIGURE: type=repere3d]")).toBe(true);
    expect(isFigureMarker("Voir la [FIGURE: ci-dessous]")).toBe(false);
  });
});
