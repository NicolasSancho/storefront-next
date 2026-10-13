import { cookies } from "next/headers";

export const CART_COOKIE = "cart";

export interface CartLine {
  slug: string;
  quantity: number;
}

function isCartLine(line: unknown): line is CartLine {
  if (typeof line !== "object" || line === null) return false;
  const { slug, quantity } = line as Record<string, unknown>;
  return typeof slug === "string" && Number.isInteger(quantity) && (quantity as number) > 0;
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

/**
 * Total number of items in the cart. It reads the request's cookies, so it is dynamic: call it
 * only from a component wrapped in `<Suspense>`, which keeps it out of the static shell.
 */
export async function getCartCount(): Promise<number> {
  const cookieStore = await cookies();
  return parseCart(cookieStore.get(CART_COOKIE)?.value).reduce(
    (total, line) => total + line.quantity,
    0
  );
}
