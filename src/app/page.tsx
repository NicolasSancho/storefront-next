import Image from "next/image";
import Link from "next/link";
import { Container, ProductGrid, Text } from "@nicolassancho/storybook-core";
import { toProductCardProps } from "@/components/products/product-card";
import { getProducts } from "@/lib/catalog";

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
        products={products.map(toProductCardProps)}
      />
    </Container>
  );
}
