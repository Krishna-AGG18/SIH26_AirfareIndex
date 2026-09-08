import { describe, expect, it } from "vitest";
import { previewSeries } from "@/lib/mock-data";

describe("preview airfare series", () => {
  it("starts from a rebased index of 100", () => {
    expect(previewSeries[0].index).toBe(100);
  });

  it("contains positive observations for every point", () => {
    expect(previewSeries.every((point) => point.observations > 0)).toBe(true);
  });
});
