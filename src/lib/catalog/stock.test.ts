import { describe, expect, it } from "vitest";
import { stockStatus } from "./stock";

describe("stockStatus", () => {
  it.each([
    { stock: 0, label: "Sold out", inStock: false },
    { stock: 1, label: "Only 1 left", inStock: true },
    { stock: 5, label: "Only 5 left", inStock: true },
    { stock: 6, label: "In stock", inStock: true },
    { stock: 60, label: "In stock", inStock: true },
  ])("$stock units: $label", ({ stock, label, inStock }) => {
    expect(stockStatus(stock)).toEqual({ label, inStock });
  });
});
