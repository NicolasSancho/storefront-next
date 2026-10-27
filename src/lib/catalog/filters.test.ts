import { describe, expect, it } from "vitest";
import { filterProducts, parseFilters } from "./filters";
import type { Category, Product } from "./types";

const categories: Category[] = [
  { slug: "ceramics", name: "Ceramics" },
  { slug: "lighting", name: "Lighting" },
];

function product(
  slug: string,
  title: string,
  category: Product["category"],
  description = ""
): Product {
  return {
    slug,
    title,
    brand: "Plainfield",
    priceCents: 1000,
    category,
    colors: [],
    stock: 10,
    description,
    specs: [],
    imageAlt: "",
  };
}

describe("parseFilters", () => {
  it("reads a known category and a query", () => {
    expect(parseFilters({ category: "ceramics", q: "mug" }, categories)).toEqual({
      category: "ceramics",
      q: "mug",
    });
  });

  it("returns no filters when the params are missing", () => {
    expect(parseFilters({}, categories)).toEqual({ category: undefined, q: undefined });
  });

  it("ignores a category that does not exist", () => {
    expect(parseFilters({ category: "furniture" }, categories).category).toBeUndefined();
  });

  it("ignores a category with the wrong case, since slugs are exact", () => {
    expect(parseFilters({ category: "Ceramics" }, categories).category).toBeUndefined();
  });

  it("uses the first value of a repeated param", () => {
    expect(
      parseFilters({ category: ["lighting", "ceramics"], q: ["lamp", "mug"] }, categories)
    ).toEqual({
      category: "lighting",
      q: "lamp",
    });
  });

  it("trims the query", () => {
    expect(parseFilters({ q: "  mug  " }, categories).q).toBe("mug");
  });

  it.each([{ q: "" }, { q: "   " }])("treats $q as no search", (params) => {
    expect(parseFilters(params, categories).q).toBeUndefined();
  });

  it("caps the query at 100 characters", () => {
    expect(parseFilters({ q: "a".repeat(150) }, categories).q).toHaveLength(100);
  });

  it("caps first and trims after, so a space at the cut does not leave a trailing space", () => {
    const q = parseFilters({ q: `${"a".repeat(99)} ${"b".repeat(50)}` }, categories).q;
    expect(q).toBe("a".repeat(99));
  });
});

describe("filterProducts", () => {
  const mug = product(
    "stoneware-mug",
    "Stoneware mug",
    "ceramics",
    "A heavy mug that keeps coffee warm."
  );
  const bowl = product("shallow-bowl", "Shallow bowl", "ceramics", "A wide, low bowl.");
  const lamp = product(
    "table-lamp",
    "Table lamp",
    "lighting",
    "A small lamp. Sized 50 cm (inner)."
  );
  const catalog = [mug, bowl, lamp];

  it("returns everything, in order, when there are no filters", () => {
    expect(filterProducts(catalog, categories, {})).toEqual([mug, bowl, lamp]);
  });

  it("filters by category", () => {
    expect(filterProducts(catalog, categories, { category: "ceramics" })).toEqual([mug, bowl]);
  });

  it("matches the query in the title, ignoring case", () => {
    expect(filterProducts(catalog, categories, { q: "SHALLOW" })).toEqual([bowl]);
  });

  it("matches the query in the description", () => {
    expect(filterProducts(catalog, categories, { q: "coffee" })).toEqual([mug]);
  });

  it("matches the query in the category name, not only in the product text", () => {
    expect(filterProducts(catalog, categories, { q: "lighting" })).toEqual([lamp]);
  });

  it("combines the category and the query", () => {
    expect(filterProducts(catalog, categories, { category: "ceramics", q: "bowl" })).toEqual([
      bowl,
    ]);
    expect(filterProducts(catalog, categories, { category: "lighting", q: "bowl" })).toEqual([]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterProducts(catalog, categories, { q: "sofa" })).toEqual([]);
  });

  it("matches the query as plain text, not as a pattern", () => {
    expect(filterProducts(catalog, categories, { q: "(inner" })).toEqual([lamp]);
    expect(filterProducts(catalog, categories, { q: ".*" })).toEqual([]);
  });
});
