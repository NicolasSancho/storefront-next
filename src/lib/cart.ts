import { cookies } from "next/headers";
import { getProducts, type Product } from "@/lib/catalog";

export const CART_COOKIE = "cart";

// The most of one product (all its colors together) a single cart can hold, whatever the stock.
export const maxQuantity = 10;

export interface CartLine {
  slug: string;
  color: string;
  quantity: number;
}

export interface CartItem {
  product: Product;
  color: string;
  quantity: number;
  /** How many units this line may hold: what the product allows, less its other colors' units. */
  limit: number;
  lineTotalCents: number;
}

/** How many units of a product a cart may hold in total: the stock, capped at `maxQuantity`. */
export function quantityLimit(stock: number): number {
  return Math.min(stock, maxQuantity);
}

function isCartLine(line: unknown): line is CartLine {
  if (typeof line !== "object" || line === null) return false;
  const { slug, color, quantity } = line as Record<string, unknown>;
  return (
    typeof slug === "string" &&
    typeof color === "string" &&
    Number.isInteger(quantity) &&
    (quantity as number) > 0
  );
}

/**
 * Reads the cart cookie value. Anything that is not a list of valid lines gives an empty cart, so
 * a hand-edited or stale cookie can never break a page.
 */
export function parseCart(value: string | undefined): CartLine[] {
  if (!value) return [];
  try {
    const data: unknown = JSON.parse(value);
    return Array.isArray(data) ? data.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

export type LineKey = Pick<CartLine, "slug" | "color">;

function isSameLine(line: CartLine, key: LineKey): boolean {
  return line.slug === key.slug && line.color === key.color;
}

/**
 * How many units one line may hold. Stock belongs to the product, not to a color, so the units of
 * the product's other colors count against `productLimit` too.
 */
export function lineLimit(lines: CartLine[], key: LineKey, productLimit: number): number {
  const others = lines
    .filter((line) => line.slug === key.slug && line.color !== key.color)
    .reduce((total, line) => total + line.quantity, 0);

  return Math.max(0, productLimit - others);
}

/** Sets a line's quantity, clamped to `limit`. A quantity below 1 removes the line. */
export function setQuantity(
  lines: CartLine[],
  key: LineKey,
  quantity: number,
  limit: number
): CartLine[] {
  const clamped = Math.min(quantity, limit);

  if (clamped < 1) return lines.filter((line) => !isSameLine(line, key));
  if (!lines.some((line) => isSameLine(line, key)))
    return [...lines, { ...key, quantity: clamped }];

  return lines.map((line) => (isSameLine(line, key) ? { ...line, quantity: clamped } : line));
}

export function getQuantity(lines: CartLine[], key: LineKey): number {
  return lines.find((line) => isSameLine(line, key))?.quantity ?? 0;
}

/**
 * Joins the cart lines with the catalog. Lines for products that no longer exist are dropped, and
 * a product's lines share its stock: in cart order, each takes what is left of it.
 */
export function buildCartItems(lines: CartLine[], products: Product[]): CartItem[] {
  const left = new Map<string, number>();

  const held = lines.flatMap(({ slug, color, quantity }) => {
    const product = products.find((candidate) => candidate.slug === slug);
    if (!product) return [];

    const available = left.get(slug) ?? quantityLimit(product.stock);
    const clamped = Math.min(quantity, available);
    if (clamped < 1) return [];

    left.set(slug, available - clamped);
    return [{ product, color, quantity: clamped }];
  });

  return held.map(({ product, color, quantity }) => ({
    product,
    color,
    quantity,
    limit: quantity + (left.get(product.slug) ?? 0),
    lineTotalCents: product.priceCents * quantity,
  }));
}

export function cartSubtotalCents(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.lineTotalCents, 0);
}

/**
 * The lines in the request's cart cookie. It reads cookies, so it is dynamic: call it only from a
 * component wrapped in `<Suspense>`, which keeps it out of the static shell.
 */
export async function getCartLines(): Promise<CartLine[]> {
  const cookieStore = await cookies();
  return parseCart(cookieStore.get(CART_COOKIE)?.value);
}

/**
 * Total number of items in the cart, counted like the cart page does, so the header never shows a
 * number the page does not. Dynamic, like `getCartLines`.
 */
export async function getCartCount(): Promise<number> {
  const [lines, products] = await Promise.all([getCartLines(), getProducts()]);
  return buildCartItems(lines, products).reduce((total, item) => total + item.quantity, 0);
}
