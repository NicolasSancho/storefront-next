import Link from "next/link";
import { CartIcon } from "@nicolassancho/storybook-core";
import { getCartCount } from "@/lib/cart";
import { linkStyles } from "./link-styles";

// The link to the cart, named by the icon ("Shopping cart, 2 items").
export function CartLink({ count }: { count: number }) {
  return (
    <Link href="/cart" className={linkStyles({ kind: "icon" })}>
      <CartIcon count={count} />
    </Link>
  );
}

// Reads the cart cookie, so it is dynamic: render it inside <Suspense> with `<CartLink count={0} />`
// as the fallback, and the rest of the header stays in the static shell.
export async function CartLinkLoader() {
  return <CartLink count={await getCartCount()} />;
}
