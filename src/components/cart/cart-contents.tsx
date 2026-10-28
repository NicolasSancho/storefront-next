import Link from "next/link";
import { ButtonLink, Text } from "@nicolassancho/storybook-core";
import { buildCartItems, cartSubtotalCents, getCartLines } from "@/lib/cart";
import { getProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { CartItemRow } from "./cart-item-row";

export async function CartContents() {
  const [lines, products] = await Promise.all([getCartLines(), getProducts()]);
  const items = buildCartItems(lines, products);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <Text as="p" color="base">
          Your cart is empty.
        </Text>
        <ButtonLink href="/products" LinkComponent={Link}>
          Browse all products
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <ul className="flex flex-col divide-y divide-neutral-200">
        {items.map((item) => (
          <CartItemRow key={`${item.product.slug}-${item.color}`} item={item} />
        ))}
      </ul>
      <div className="flex items-baseline justify-between gap-4 border-t border-neutral-300 pt-4">
        <Text as="p" weight="semibold" color="darker">
          Subtotal
        </Text>
        <Text as="p" size="large" weight="semibold" color="darker">
          {formatPrice(cartSubtotalCents(items))}
        </Text>
      </div>
    </div>
  );
}
