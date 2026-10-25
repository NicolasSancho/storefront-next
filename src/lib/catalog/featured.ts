import type { Product } from "./types";

/** How many products the "New this season" grid shows. */
export const featuredCount = 4;

/**
 * The products to feature: the ones tagged first, then the rest in catalog order, up to `count`.
 * It is a plain function over the cached collection, so no argument becomes a cache key.
 */
export function pickFeatured(products: Product[], count: number): Product[] {
  const tagged = products.filter((product) => product.tag);
  const rest = products.filter((product) => !product.tag);

  return [...tagged, ...rest].slice(0, count);
}
