import Image from "next/image";
import Link from "next/link";
import { Container, ProductGrid, Text } from "@nicolassancho/storybook-core";
import { getProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

// Temporary home: a plain grid that exercises the catalog and the product art. Phase 2 replaces
// it with the real home page.
export default async function Home() {
  const products = await getProducts();

  return (
    <Container className="flex flex-col gap-8 py-12">
      <Text as="h1" font="display" size="heading" weight="bold" color="darker">
        New this season
      </Text>
      <ProductGrid
        columns={4}
        gap="large"
        LinkComponent={Link}
        ImageComponent={Image}
        products={products.map((product) => ({
          id: product.slug,
          title: product.title,
          brand: product.brand,
          price: formatPrice(product.priceCents),
          tag: product.tag,
          href: `/products/${product.slug}`,
          imageUrl: `/products/${product.slug}.svg`,
          imageProps: { width: 600, height: 800, sizes: "(min-width: 1280px) 25vw, 50vw" },
        }))}
      />
    </Container>
  );
}
