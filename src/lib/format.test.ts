import { describe, expect, it } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it.each([
    { cents: 1800, shown: "€18" },
    { cents: 1850, shown: "€18.50" },
    { cents: 1999, shown: "€19.99" },
    { cents: 5, shown: "€0.05" },
    { cents: 0, shown: "€0" },
    { cents: 100000, shown: "€1,000" },
  ])("$cents cents is $shown", ({ cents, shown }) => {
    expect(formatPrice(cents)).toBe(shown);
  });
});
