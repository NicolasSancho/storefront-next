import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, Container, Text } from "@nicolassancho/storybook-core";

export const metadata: Metadata = { title: "Product not found" };

export default function ProductNotFound() {
  return (
    <Container className="flex flex-col items-start gap-6 py-16">
      <Text as="h1" font="display" size="heading" weight="bold" color="darker">
        Product not found
      </Text>
      <Text as="p" color="base">
        We could not find that product. It may have been removed.
      </Text>
      <ButtonLink href="/products" LinkComponent={Link}>
        Browse all products
      </ButtonLink>
    </Container>
  );
}
