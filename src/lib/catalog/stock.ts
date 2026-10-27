// At or below this many units, the stock line reads "Only N left".
export const lowStockThreshold = 5;

/** The stock line shown on a product page, and whether the product can be bought. */
export function stockStatus(stock: number): { label: string; inStock: boolean } {
  if (stock === 0) return { label: "Sold out", inStock: false };
  if (stock <= lowStockThreshold) return { label: `Only ${stock} left`, inStock: true };
  return { label: "In stock", inStock: true };
}
