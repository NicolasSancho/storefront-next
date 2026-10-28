import Link from "next/link";
import NextImage from "next/image";
import { Button, Image, Text } from "@nicolassancho/storybook-core";
import { changeQuantityAction, removeFromCartAction } from "@/lib/cart-actions";
import type { CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { linkStyles } from "@/components/shell/link-styles";

// Each form posts to a Server Action, so none of them needs client code. The two quantity buttons
// share one form: a submit button sends its own name and value with the form.
function LineForm({
  item,
  action,
  className,
  children,
}: {
  item: CartItem;
  action: (formData: FormData) => Promise<void>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <form action={action} className={className}>
      <input type="hidden" name="slug" value={item.product.slug} />
      <input type="hidden" name="color" value={item.color} />
      {children}
    </form>
  );
}

export function CartItemRow({ item }: { item: CartItem }) {
  const { product, color, quantity, limit, lineTotalCents } = item;

  return (
    <li className="grid grid-cols-[6rem_1fr] gap-x-4 gap-y-3 py-6 sm:grid-cols-[6rem_1fr_auto]">
      <Image
        src={`/products/${product.slug}.svg`}
        alt={product.imageAlt}
        ImageComponent={NextImage}
        width={600}
        height={800}
        className="h-auto w-full rounded-lg"
      />
      <div className="flex flex-col gap-1">
        <Link
          href={`/products/${product.slug}`}
          className={linkStyles({ className: "font-semibold text-neutral-900 hover:underline" })}
        >
          {product.title}
        </Link>
        <Text as="p" size="small" color="base">
          {color}
        </Text>
        <Text as="p" size="small" color="base">
          {formatPrice(product.priceCents)} each
        </Text>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <LineForm item={item} action={changeQuantityAction} className="flex items-center gap-3">
            <Button
              type="submit"
              name="change"
              value="-1"
              variant="primary"
              size="medium"
              disabled={quantity <= 1}
              aria-label={`Decrease quantity of ${product.title}, ${color}`}
            >
              −
            </Button>
            <Text as="span" weight="semibold" color="darker">
              <span className="sr-only">Quantity: </span>
              {quantity}
            </Text>
            <Button
              type="submit"
              name="change"
              value="1"
              variant="primary"
              size="medium"
              disabled={quantity >= limit}
              aria-label={`Increase quantity of ${product.title}, ${color}`}
            >
              +
            </Button>
          </LineForm>
          <LineForm item={item} action={removeFromCartAction}>
            <Button
              type="submit"
              variant="text"
              size="small"
              aria-label={`Remove ${product.title}, ${color}`}
            >
              Remove
            </Button>
          </LineForm>
        </div>
      </div>
      <Text
        as="p"
        weight="semibold"
        color="darker"
        className="col-start-2 sm:col-start-3 sm:row-start-1"
      >
        {formatPrice(lineTotalCents)}
      </Text>
    </li>
  );
}
