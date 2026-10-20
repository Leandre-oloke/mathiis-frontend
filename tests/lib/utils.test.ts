import { describe, expect, it } from "vitest";
import { cn, formatDate, formatFileSize, STATUS_LABELS } from "@/lib/utils";

describe("cn", () => {
  it("joins classes and lets the last Tailwind class win", () => {
    expect(cn("px-2 py-1", false && "hidden", "px-4")).toBe("py-1 px-4");
  });
});

describe("formatFileSize", () => {
  it.each([
    [512, "512 o"],
    [2048, "2.0 Ko"],
    [245000, "239.3 Ko"],
    [5 * 1024 * 1024, "5.0 Mo"],
  ])("%i octets → %s", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});

describe("formatDate", () => {
  it("writes the date in French", () => {
    expect(formatDate("2026-10-18T09:00:00Z")).toBe("18 octobre 2026");
  });
});

describe("STATUS_LABELS", () => {
  it("has a French label for every exam status", () => {
    expect(Object.keys(STATUS_LABELS).sort()).toEqual(["completed", "failed", "generating", "pending"]);
  });
});
