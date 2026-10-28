"use client";

import Link from "next/link";
import { Button, ButtonLink, Container, Text } from "@nicolassancho/storybook-core";

// Error boundaries must be Client Components. A server error reaches the browser without its
// message, only a digest, so the page does not show the error itself.
export default function ErrorPage({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Container className="flex flex-col items-start gap-6 py-16">
      <Text as="h1" font="display" size="heading" weight="bold" color="darker">
        Something went wrong
      </Text>
      <Text as="p" color="base">
        The page could not be loaded. Try again, or go back to the home page.
      </Text>
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => retry()}>Try again</Button>
        <ButtonLink href="/" variant="secondary" LinkComponent={Link}>
          Go to the home page
        </ButtonLink>
      </div>
    </Container>
  );
}
