import Image from "next/image";
import Link from "next/link";
import { ProductGrid, Text } from "@nicolassancho/storybook-core";
import { toProductCardProps } from "@/components/products/product-card";
import { linkStyles } from "@/components/shell/link-styles";
import { featuredCount, getProducts, pickFeatured } from "@/lib/catalog";

export async function NewArrivals() {
  const featured = pickFeatured(await getProducts(), featuredCount);

  return (
    <section aria-labelledby="new-title" className="flex flex-col gap-6 py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="new-title">
          <Text as="span" font="display" size="heading" weight="bold" color="darker">
            New this season
          </Text>
        </h2>
        <Link
          href="/products"
          className={linkStyles({ className: "text-sm font-semibold text-primary" })}
        >
          View all products
        </Link>
      </div>
      <ProductGrid
        columns={4}
        gap="large"
        LinkComponent={Link}
        ImageComponent={Image}
        products={featured.map(toProductCardProps)}
      />
    </section>
  );
}
