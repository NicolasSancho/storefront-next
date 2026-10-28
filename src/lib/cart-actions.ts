"use server";

import { cookies } from "next/headers";
import { getProduct } from "@/lib/catalog";
import {
  CART_COOKIE,
  getCartLines,
  getQuantity,
  lineLimit,
  quantityLimit,
  setQuantity,
  type CartLine,
  type LineKey,
} from "@/lib/cart";

const thirtyDays = 60 * 60 * 24 * 30;

export interface AddToCartState {
  message: string;
  /** The color that was submitted, so the form can keep it selected. Empty when it was invalid. */
  color: string;
}

async function saveCart(lines: CartLine[]) {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, JSON.stringify(lines), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: thirtyDays,
    path: "/",
  });
}

// An action is a public POST endpoint, so every field is checked here: the product and color must
// exist, and the price is never read from the request.
async function parseLineInput(
  formData: FormData
): Promise<{ key: LineKey; productLimit: number } | undefined> {
  const slug = formData.get("slug");
  const color = formData.get("color");
  if (typeof slug !== "string" || typeof color !== "string") return undefined;

  const product = await getProduct(slug);
  if (!product || !product.colors.some(({ name }) => name === color)) return undefined;

  return { key: { slug, color }, productLimit: quantityLimit(product.stock) };
}

export async function addToCartAction(
  _previous: AddToCartState,
  formData: FormData
): Promise<AddToCartState> {
  const line = await parseLineInput(formData);
  if (!line) return { message: "We could not add that product.", color: "" };

  const { color } = line.key;
  if (line.productLimit === 0) return { message: "That product is sold out.", color };

  const lines = await getCartLines();
  const quantity = getQuantity(lines, line.key);
  const limit = lineLimit(lines, line.key, line.productLimit);
  if (quantity >= limit) {
    return { message: "You already have the most we can offer in your cart.", color };
  }

  await saveCart(setQuantity(lines, line.key, quantity + 1, limit));
  // The count makes each message different, so a screen reader announces every repeated add.
  return { message: `Added to your cart. You have ${quantity + 1} of this item.`, color };
}

export async function changeQuantityAction(formData: FormData) {
  const line = await parseLineInput(formData);
  const change = Number(formData.get("change"));
  if (!line || (change !== 1 && change !== -1)) return;

  const lines = await getCartLines();
  const quantity = getQuantity(lines, line.key);
  if (quantity === 0) return;

  await saveCart(
    setQuantity(lines, line.key, quantity + change, lineLimit(lines, line.key, line.productLimit))
  );
}

export async function removeFromCartAction(formData: FormData) {
  const line = await parseLineInput(formData);
  if (!line) return;

  await saveCart(setQuantity(await getCartLines(), line.key, 0, line.productLimit));
}
