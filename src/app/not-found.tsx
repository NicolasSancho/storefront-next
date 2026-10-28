import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, Container, Text } from "@nicolassancho/storybook-core";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Container className="flex flex-col items-start gap-6 py-16">
      <Text as="h1" font="display" size="heading" weight="bold" color="darker">
        Page not found
      </Text>
      <Text as="p" color="base">
        We could not find that page. The link may be broken, or the page may have moved.
      </Text>
      <div className="flex flex-wrap gap-4">
        <ButtonLink href="/" LinkComponent={Link}>
          Go to the home page
        </ButtonLink>
        <ButtonLink href="/products" variant="secondary" LinkComponent={Link}>
          Browse all products
        </ButtonLink>
      </div>
    </Container>
  );
}
