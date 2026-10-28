import { describe, expect, it } from "vitest";
import {
  buildCartItems,
  cartSubtotalCents,
  getQuantity,
  lineLimit,
  parseCart,
  quantityLimit,
  setQuantity,
  type CartLine,
} from "./cart";
import type { Product } from "./catalog";

function product(slug: string, priceCents: number, stock: number): Product {
  return {
    slug,
    title: slug,
    brand: "Plainfield",
    priceCents,
    category: "ceramics",
    colors: [],
    stock,
    description: "",
    specs: [],
    imageAlt: "",
  };
}

const mugSand: CartLine = { slug: "mug", color: "Sand", quantity: 2 };
const mugSlate: CartLine = { slug: "mug", color: "Slate", quantity: 1 };
const lamp: CartLine = { slug: "lamp", color: "Brass", quantity: 3 };

describe("quantityLimit", () => {
  it.each([
    { stock: 0, limit: 0 },
    { stock: 3, limit: 3 },
    { stock: 10, limit: 10 },
    { stock: 11, limit: 10 },
    { stock: 60, limit: 10 },
  ])("stock $stock allows $limit", ({ stock, limit }) => {
    expect(quantityLimit(stock)).toBe(limit);
  });
});

describe("parseCart", () => {
  it("reads a list of lines", () => {
    const value = JSON.stringify([
      { slug: "stoneware-mug", color: "Sand", quantity: 2 },
      { slug: "table-lamp", color: "Brass", quantity: 1 },
    ]);

    expect(parseCart(value)).toEqual([
      { slug: "stoneware-mug", color: "Sand", quantity: 2 },
      { slug: "table-lamp", color: "Brass", quantity: 1 },
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
      { slug: "stoneware-mug", color: "Sand", quantity: 1 },
      { slug: "table-lamp", color: "Brass", quantity: 0 },
      { slug: "bud-vase", color: "Oat", quantity: -2 },
      { slug: "linen-throw", color: "Sand", quantity: 1.5 },
      { slug: "tea-towel", color: "Natural", quantity: "2" },
      { slug: "water-carafe", quantity: 1 },
      { slug: "candle-holder", color: 7, quantity: 1 },
      { color: "Sand", quantity: 3 },
      { slug: 7, color: "Sand", quantity: 1 },
      null,
      "mug",
      { slug: "pendant-light", color: "Graphite", quantity: 4 },
    ]);

    expect(parseCart(value)).toEqual([
      { slug: "stoneware-mug", color: "Sand", quantity: 1 },
      { slug: "pendant-light", color: "Graphite", quantity: 4 },
    ]);
  });
});

describe("getQuantity", () => {
  const lines = [mugSand, mugSlate, lamp];

  it("returns the quantity of the line with that product and color", () => {
    expect(getQuantity(lines, { slug: "mug", color: "Slate" })).toBe(1);
    expect(getQuantity(lines, { slug: "lamp", color: "Brass" })).toBe(3);
  });

  it("returns 0 for a color that is not in the cart, even if the product is", () => {
    expect(getQuantity(lines, { slug: "lamp", color: "Black" })).toBe(0);
  });

  it("returns 0 for a product that is not in the cart", () => {
    expect(getQuantity(lines, { slug: "vase", color: "Oat" })).toBe(0);
  });
});

describe("lineLimit", () => {
  it("is the whole product limit when the product has no other color in the cart", () => {
    expect(lineLimit([mugSand, lamp], { slug: "mug", color: "Sand" }, 10)).toBe(10);
    expect(lineLimit([], { slug: "mug", color: "Sand" }, 10)).toBe(10);
  });

  it("takes away the units of the product's other colors", () => {
    // 1 Slate is in the cart, so a Sand line can hold 9 of the 10.
    expect(lineLimit([mugSand, mugSlate], { slug: "mug", color: "Sand" }, 10)).toBe(9);
    expect(lineLimit([mugSand, mugSlate], { slug: "mug", color: "Slate" }, 10)).toBe(8);
  });

  it("ignores the units of other products", () => {
    expect(lineLimit([lamp], { slug: "mug", color: "Sand" }, 10)).toBe(10);
  });

  it("is never negative, even when the other colors already hold more than the limit", () => {
    expect(lineLimit([mugSand, mugSlate], { slug: "mug", color: "Sand" }, 0)).toBe(0);
  });
});

describe("setQuantity", () => {
  it("adds a line that is not in the cart yet", () => {
    expect(setQuantity([mugSand], { slug: "lamp", color: "Brass" }, 1, 5)).toEqual([
      mugSand,
      { slug: "lamp", color: "Brass", quantity: 1 },
    ]);
  });

  it("changes the quantity of a line and keeps the cart in the same order", () => {
    expect(setQuantity([mugSand, mugSlate, lamp], { slug: "mug", color: "Sand" }, 4, 10)).toEqual([
      { slug: "mug", color: "Sand", quantity: 4 },
      mugSlate,
      lamp,
    ]);
  });

  it("keeps a product in two colors as two lines", () => {
    const lines = setQuantity([mugSand], { slug: "mug", color: "Slate" }, 1, 10);

    expect(lines).toEqual([mugSand, { slug: "mug", color: "Slate", quantity: 1 }]);
  });

  it("clamps the quantity to the limit", () => {
    expect(setQuantity([], { slug: "mug", color: "Sand" }, 25, 10)).toEqual([
      { slug: "mug", color: "Sand", quantity: 10 },
    ]);
  });

  it.each([0, -1])("removes the line when the quantity is %i", (quantity) => {
    expect(setQuantity([mugSand, lamp], { slug: "mug", color: "Sand" }, quantity, 10)).toEqual([
      lamp,
    ]);
  });

  it("removes nothing when the line to remove is not in the cart", () => {
    expect(setQuantity([mugSand], { slug: "lamp", color: "Brass" }, 0, 10)).toEqual([mugSand]);
  });

  it("adds nothing when the limit is 0", () => {
    expect(setQuantity([mugSand], { slug: "lamp", color: "Brass" }, 1, 0)).toEqual([mugSand]);
  });

  it("does not change the lines it was given", () => {
    const lines = [mugSand];

    setQuantity(lines, { slug: "mug", color: "Sand" }, 5, 10);

    expect(lines).toEqual([{ slug: "mug", color: "Sand", quantity: 2 }]);
  });
});

describe("buildCartItems", () => {
  const catalog = [product("mug", 1800, 24), product("lamp", 7900, 2), product("jug", 3400, 0)];

  it("joins each line with its product, in cart order, with the line total", () => {
    const items = buildCartItems([lamp, mugSand], catalog);

    expect(
      items.map(({ product: { slug }, color, quantity, lineTotalCents }) => ({
        slug,
        color,
        quantity,
        lineTotalCents,
      }))
    ).toEqual([
      { slug: "lamp", color: "Brass", quantity: 2, lineTotalCents: 15800 },
      { slug: "mug", color: "Sand", quantity: 2, lineTotalCents: 3600 },
    ]);
  });

  it("reduces a quantity to the stock the product has now", () => {
    const [item] = buildCartItems([{ slug: "lamp", color: "Brass", quantity: 3 }], catalog);

    expect(item).toMatchObject({ quantity: 2, limit: 2, lineTotalCents: 15800 });
  });

  it("caps the limit at the most one line can hold", () => {
    const [item] = buildCartItems([{ slug: "mug", color: "Sand", quantity: 1 }], catalog);

    expect(item.limit).toBe(10);
  });

  it("shares a product's stock between its colors, in cart order", () => {
    const items = buildCartItems(
      [
        { slug: "lamp", color: "Brass", quantity: 3 },
        { slug: "lamp", color: "Black", quantity: 4 },
      ],
      [product("lamp", 7900, 5)]
    );

    expect(items.map(({ color, quantity }) => ({ color, quantity }))).toEqual([
      { color: "Brass", quantity: 3 },
      { color: "Black", quantity: 2 },
    ]);
    expect(items.map(({ limit }) => limit)).toEqual([3, 2]);
  });

  it("lets each color grow into what the others leave free", () => {
    const items = buildCartItems(
      [
        { slug: "lamp", color: "Brass", quantity: 1 },
        { slug: "lamp", color: "Black", quantity: 1 },
      ],
      [product("lamp", 7900, 5)]
    );

    expect(items.map(({ limit }) => limit)).toEqual([4, 4]);
  });

  it("does not let one product's colors use another product's stock", () => {
    const items = buildCartItems(
      [
        { slug: "lamp", color: "Brass", quantity: 2 },
        { slug: "mug", color: "Sand", quantity: 2 },
      ],
      [product("lamp", 7900, 2), product("mug", 1800, 24)]
    );

    expect(items.map(({ quantity }) => quantity)).toEqual([2, 2]);
  });

  it("drops a line whose product no longer exists", () => {
    expect(
      buildCartItems([{ slug: "gone", color: "Sand", quantity: 1 }, mugSand], catalog)
    ).toHaveLength(1);
  });

  it("drops a line whose product is sold out", () => {
    expect(buildCartItems([{ slug: "jug", color: "Clear", quantity: 1 }], catalog)).toEqual([]);
  });

  it("gives no items for an empty cart", () => {
    expect(buildCartItems([], catalog)).toEqual([]);
  });
});

describe("cartSubtotalCents", () => {
  const catalog = [product("mug", 1800, 24), product("lamp", 7900, 5)];

  it("adds the line totals", () => {
    const items = buildCartItems([mugSand, lamp], catalog);

    expect(cartSubtotalCents(items)).toBe(2 * 1800 + 3 * 7900);
  });

  it("is 0 for an empty cart", () => {
    expect(cartSubtotalCents([])).toBe(0);
  });
});
