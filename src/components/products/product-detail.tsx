import NextImage from "next/image";
import { Image, ProductDetails, Text } from "@nicolassancho/storybook-core";
import { AddToCartForm } from "@/components/products/add-to-cart-form";
import type { Product } from "@/lib/catalog";
import { stockStatus } from "@/lib/catalog/stock";
import { formatPrice } from "@/lib/format";

interface ProductDetailProps {
  product: Product;
  categoryName: string;
}

export function ProductDetail({ product, categoryName }: ProductDetailProps) {
  const { label: stockLabel, inStock } = stockStatus(product.stock);

  return (
    <article className="grid items-start gap-10 md:grid-cols-2">
      <Image
        src={`/products/${product.slug}.svg`}
        alt={product.imageAlt}
        ImageComponent={NextImage}
        width={600}
        height={800}
        sizes="(min-width: 768px) 50vw, 100vw"
        loading="eager"
        className="h-auto w-full rounded-lg"
      />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Text
            as="p"
            size="small"
            weight="semibold"
            color="primary"
            className="uppercase tracking-wider"
          >
            {categoryName}
          </Text>
          <Text as="h1" font="display" size="heading" weight="bold" color="darker">
            {product.title}
          </Text>
          <Text as="p" size="small" color="base">
            by {product.brand}
          </Text>
        </div>
        <div className="flex flex-col gap-1">
          <Text as="p" size="large" weight="semibold" color="darker">
            {formatPrice(product.priceCents)}
          </Text>
          <Text as="p" size="small" weight="medium" color="dark">
            {stockLabel}
          </Text>
        </div>
        <Text as="p" color="base" className="max-w-[60ch]">
          {product.description}
        </Text>
        <AddToCartForm
          slug={product.slug}
          colors={product.colors.map(({ name }) => name)}
          soldOut={!inStock}
        />
        <section aria-labelledby="details-title" className="flex flex-col gap-2">
          <h2 id="details-title">
            <Text as="span" weight="semibold" color="darker">
              Details
            </Text>
          </h2>
          <ProductDetails details={product.specs} />
        </section>
      </div>
    </article>
  );
}
