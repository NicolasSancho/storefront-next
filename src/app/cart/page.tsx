import { Suspense } from "react";
import type { Metadata } from "next";
import { Container, Text } from "@nicolassancho/storybook-core";
import { CartContents } from "@/components/cart/cart-contents";

export const metadata: Metadata = { title: "Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <Container className="flex flex-col gap-8 py-12">
      <Text as="h1" font="display" size="heading" weight="bold" color="darker">
        Cart
      </Text>
      {/* The cart is read from a cookie, which is request-time data. Inside this boundary the heading
          stays in the static shell and only the lines stream in. */}
      <Suspense fallback={<div aria-hidden className="min-h-64" />}>
        <CartContents />
      </Suspense>
    </Container>
  );
}
