import { describe, expect, it } from "vitest";
import { pickFeatured } from "./featured";
import type { Product } from "./types";

// Only the fields the function reads matter; the rest is filled in to satisfy the type.
function product(slug: string, tag?: string): Product {
  return {
    slug,
    title: slug,
    brand: "Plainfield",
    priceCents: 1000,
    category: "ceramics",
    colors: [],
    stock: 10,
    tag,
    description: "",
    specs: [],
    imageAlt: "",
  };
}

const slugs = (products: Product[]) => products.map(({ slug }) => slug);

describe("pickFeatured", () => {
  const catalog = [
    product("a"),
    product("b", "New"),
    product("c"),
    product("d", "New"),
    product("e"),
  ];

  it("puts tagged products first, then the rest in catalog order", () => {
    expect(slugs(pickFeatured(catalog, 5))).toEqual(["b", "d", "a", "c", "e"]);
  });

  it("stops at the count, even in the middle of the tagged products", () => {
    expect(slugs(pickFeatured(catalog, 1))).toEqual(["b"]);
    expect(slugs(pickFeatured(catalog, 3))).toEqual(["b", "d", "a"]);
  });

  it("returns every product when the count is larger than the catalog", () => {
    expect(pickFeatured(catalog, 50)).toHaveLength(5);
  });

  it("returns nothing for a count of 0", () => {
    expect(pickFeatured(catalog, 0)).toEqual([]);
  });

  it("keeps the catalog order when nothing is tagged", () => {
    expect(slugs(pickFeatured([product("x"), product("y"), product("z")], 2))).toEqual(["x", "y"]);
  });

  it("does not reorder the list it was given", () => {
    const input = [product("a"), product("b", "New")];
    pickFeatured(input, 2);
    expect(slugs(input)).toEqual(["a", "b"]);
  });
});
