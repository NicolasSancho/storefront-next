import type { ComponentProps } from "react";
import type { ProductGrid } from "@nicolassancho/storybook-core";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

type ProductCardProps = ComponentProps<typeof ProductGrid>["products"][number];

/** Maps a catalog product to the props of the design system's product card. */
export function toProductCardProps(product: Product): ProductCardProps {
  return {
    id: product.slug,
    title: product.title,
    brand: product.brand,
    price: formatPrice(product.priceCents),
    tag: product.tag,
    href: `/products/${product.slug}`,
    imageUrl: `/products/${product.slug}.svg`,
    imageProps: { width: 600, height: 800, sizes: "(min-width: 1280px) 25vw, 50vw" },
  };
}
