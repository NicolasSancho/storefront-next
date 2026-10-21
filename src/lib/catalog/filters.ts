import type { Category, Product, ProductFilters } from "./types";

const MAX_QUERY_LENGTH = 100;

type SearchParams = Record<string, string | string[] | undefined>;

// A repeated param (`?q=a&q=b`) arrives as an array: use the first value.
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Turns URL search params into catalog filters. The URL is user input, so nothing is trusted: an
 * unknown category is ignored, the query is trimmed and capped, and an empty query means no search.
 */
export function parseFilters(params: SearchParams, categories: Category[]): ProductFilters {
  const category = categories.find(({ slug }) => slug === first(params.category))?.slug;
  const q = first(params.q)?.slice(0, MAX_QUERY_LENGTH).trim() || undefined;

  return { category, q };
}

/**
 * Applies filters to the full catalog. It is a plain function, not cached: the cache holds the
 * collection, and what the visitor typed only chooses what to show from it.
 */
export function filterProducts(
  products: Product[],
  categories: Category[],
  { category, q }: ProductFilters
): Product[] {
  const query = q?.toLowerCase();
  const categoryNames = new Map(categories.map(({ slug, name }) => [slug, name.toLowerCase()]));

  return products.filter((product) => {
    if (category && product.category !== category) return false;
    if (!query) return true;
    return [product.title, product.description, categoryNames.get(product.category)].some((text) =>
      text?.toLowerCase().includes(query)
    );
  });
}
