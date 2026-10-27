import NextImage from "next/image";
import { Image, ProductDetails, Text } from "@nicolassancho/storybook-core";
import type { Product } from "@/lib/catalog";
import { stockStatus } from "@/lib/catalog/stock";
import { formatPrice } from "@/lib/format";

interface ProductDetailProps {
  product: Product;
  categoryName: string;
}

export function ProductDetail({ product, categoryName }: ProductDetailProps) {
  const { label: stockLabel } = stockStatus(product.stock);

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
        <section aria-labelledby="colors-title" className="flex flex-col gap-2">
          <h2 id="colors-title">
            <Text as="span" weight="semibold" color="darker">
              Colors
            </Text>
          </h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {product.colors.map(({ name, value }) => (
              <li key={name} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-4 rounded-full border border-neutral-300"
                  style={{ backgroundColor: value }}
                />
                <Text as="span" size="small" color="base">
                  {name}
                </Text>
              </li>
            ))}
          </ul>
        </section>
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
