import { describe, expect, it } from "vitest";
import { parseCart } from "./cart";

describe("parseCart", () => {
  it("reads a list of lines", () => {
    const value = JSON.stringify([
      { slug: "stoneware-mug", quantity: 2 },
      { slug: "table-lamp", quantity: 1 },
    ]);

    expect(parseCart(value)).toEqual([
      { slug: "stoneware-mug", quantity: 2 },
      { slug: "table-lamp", quantity: 1 },
    ]);
  });

  it.each([undefined, ""])("gives an empty cart for %j", (value) => {
    expect(parseCart(value)).toEqual([]);
  });

  it("gives an empty cart for text that is not JSON", () => {
    expect(parseCart("{not json")).toEqual([]);
  });

  it.each(["{}", '"mug"', "42", "null"])(
    "gives an empty cart when the JSON is %s, not a list",
    (value) => {
      expect(parseCart(value)).toEqual([]);
    }
  );

  it("drops lines that are not valid and keeps the valid ones around them", () => {
    const value = JSON.stringify([
      { slug: "stoneware-mug", quantity: 1 },
      { slug: "table-lamp", quantity: 0 },
      { slug: "bud-vase", quantity: -2 },
      { slug: "linen-throw", quantity: 1.5 },
      { slug: "tea-towel", quantity: "2" },
      { quantity: 3 },
      { slug: 7, quantity: 1 },
      null,
      "mug",
      { slug: "pendant-light", quantity: 4 },
    ]);

    expect(parseCart(value)).toEqual([
      { slug: "stoneware-mug", quantity: 1 },
      { slug: "pendant-light", quantity: 4 },
    ]);
  });
});
