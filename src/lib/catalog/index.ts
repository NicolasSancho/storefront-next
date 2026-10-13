import { cacheLife } from "next/cache";
import { categories, products } from "./data";
import type { Category, Product, ProductFilters } from "./types";

export type { Category, CategorySlug, Product, ProductColor, ProductFilters } from "./types";

// The catalog is static data behind async functions, as a real API would be. "use cache" with an
// explicit cacheLife makes each result part of the static shell, and swapping this file for
// fetch calls later changes nothing for the pages. With in-memory data the cache saves no work
// today; it is here so the pages are written against the final shape.

export async function getProducts({ category, q }: ProductFilters = {}): Promise<Product[]> {
  "use cache";
  cacheLife("days");

  const query = q?.trim().toLowerCase();
  const categoryNames = new Map(categories.map(({ slug, name }) => [slug, name.toLowerCase()]));

  return products.filter((product) => {
    if (category && product.category !== category) return false;
    if (!query) return true;
    return [product.title, product.description, categoryNames.get(product.category)].some((text) =>
      text?.toLowerCase().includes(query)
    );
  });
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheLife("days");

  return products.find((product) => product.slug === slug);
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("days");

  return categories;
}
