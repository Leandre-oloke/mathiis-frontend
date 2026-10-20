import { describe, expect, it } from "vitest";
import { CLASSES, durationFor, formatDuree, requirement, sampleFor, situationsFor } from "@/lib/exam-generator";
import { MATHS_TLE_D } from "@/lib/sample-exams";
import { faq } from "@/lib/faq";

describe("programme officiel (démo de l'accueil)", () => {
  it("lists the 13 official classes, from 6e to Tle D", () => {
    expect(CLASSES).toHaveLength(13);
    expect(CLASSES[0]).toBe("6e");
    expect(CLASSES).toContain("Tle D");
  });

  it("uses the official duration of each class", () => {
    expect(formatDuree(durationFor("Mathématiques", "Tle D"))).toBe("4H00");
    expect(formatDuree(90)).toBe("1H30");
  });

  it("asks for 3 activities in an exam, 2 or 3 in SVT, 1 or 2 in an exercise", () => {
    expect(requirement("Mathématiques", "epreuve")).toEqual({ min: 3, max: 3 });
    expect(requirement("SVT", "epreuve")).toEqual({ min: 2, max: 3 });
    expect(requirement("PCT", "exercice")).toEqual({ min: 1, max: 2 });
  });

  it("numbers the learning situations of a class, with their activities", () => {
    const sas = situationsFor("Mathématiques", "Tle D");
    expect(sas[0]).toMatchObject({ number: 1, title: "Configurations de l'espace" });
    expect(sas[0].groups.flatMap((g) => g.items)).toContain("Barycentre");
  });

  it("splits PCT into Physique then Chimie", () => {
    const parts = situationsFor("PCT", "Tle D").map((s) => s.part);
    expect(parts[0]).toBe("Physique");
    expect(parts).toContain("Chimie");
    expect(parts.indexOf("Chimie")).toBeGreaterThan(parts.lastIndexOf("Physique"));
  });

  it("only shows real model output: Maths Tle D, nothing invented for other choices", () => {
    expect(sampleFor("Mathématiques", "Tle D", "epreuve")).toBe(MATHS_TLE_D);
    expect(sampleFor("PCT", "Tle D", "epreuve")).toBeNull();
    expect(sampleFor("Mathématiques", "3e", "epreuve")).toBeNull();
    expect(sampleFor("Mathématiques", "Tle D", "exercice")).toBeNull();
  });
});

describe("FAQ", () => {
  it("gives every question a unique id, so palette links open the right answer", () => {
    const ids = faq.flatMap((g) => g.items.map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => /^[a-z0-9-]+$/.test(id))).toBe(true);
  });
});
