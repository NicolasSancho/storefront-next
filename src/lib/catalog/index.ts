import { cacheLife } from "next/cache";
import { categories, products } from "./data";
import { featuredCount, pickFeatured } from "./featured";
import type { Category, Product } from "./types";

export { featuredCount, pickFeatured } from "./featured";
export { filterProducts, parseFilters } from "./filters";
export type { Category, CategorySlug, Product, ProductColor, ProductFilters } from "./types";

// The catalog is static data behind async functions, as a real API would be. "use cache" with an
// explicit cacheLife makes each result part of the static shell, and swapping this file for
// fetch calls later changes nothing for the pages. With in-memory data the cache saves no work
// today; it is here so the pages are written against the final shape. Only calls with a bounded set
// of arguments are cached (none, or a slug): the arguments are part of the cache key, so user input
// such as a search query never goes in. Filtering happens outside the cache, in `filterProducts`.

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("days");

  return products;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheLife("days");

  return products.find((product) => product.slug === slug);
}

// The hero shows the products that come right after the featured ones, so no image appears twice.
export async function getHeroProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("days");

  return pickFeatured(products, featuredCount + 3).slice(featuredCount);
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("days");

  return categories;
}
