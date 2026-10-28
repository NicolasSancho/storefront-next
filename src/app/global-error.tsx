"use client";

import { Button, Container, Text } from "@nicolassancho/storybook-core";
import "./globals.css";

// Replaces the root layout when the layout itself fails, so it renders its own <html> and <body>.
// The layout's fonts and shell are not available here; the design system's tokens still are.
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-surface font-sans text-neutral-900">
        <main>
          <Container className="flex flex-col items-start gap-6 py-16">
            <Text as="h1" font="display" size="heading" weight="bold" color="darker">
              Something went wrong
            </Text>
            <Text as="p" color="base">
              The site could not be loaded. Try again.
            </Text>
            <Button onClick={() => retry()}>Try again</Button>
          </Container>
        </main>
      </body>
    </html>
  );
}
