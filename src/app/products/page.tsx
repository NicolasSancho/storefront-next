import { Suspense } from "react";
import type { Metadata } from "next";
import { Container, Text } from "@nicolassancho/storybook-core";
import { CategoryChips } from "@/components/products/category-chips";
import { ProductResults } from "@/components/products/product-results";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <Container className="flex flex-col gap-8 py-12">
      <Text as="h1" font="display" size="heading" weight="bold" color="darker">
        Products
      </Text>
      {/* searchParams is request-time data. Reading it inside this boundary keeps the heading and
          the fallback in the static shell; only the filtered results stream in. */}
      <Suspense fallback={<ResultsFallback />}>
        <ProductResults searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

// Same chips with none selected and a block that reserves the grid's space, so nothing jumps
// when the results arrive.
function ResultsFallback() {
  return (
    <>
      <CategoryChips />
      <div aria-hidden className="min-h-96" />
    </>
  );
}
