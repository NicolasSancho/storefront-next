import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs, Button, Grid, ProductCard, Text } from "@nicolassancho/storybook-core";

// Smoke page: every library component here renders from a Server Component (no "use client").
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <Breadcrumbs
        LinkComponent={Link}
        items={[{ label: "Home", href: "/" }, { label: "Smoke test" }]}
      />
      <Text as="h1" font="display" size="display" weight="bold" color="darker">
        Quiet objects for rooms you live in.
      </Text>
      <Text size="large" color="base">
        Rendered from a Server Component with the design system from npm.
      </Text>
      <div className="flex gap-3">
        <Button variant="primary">Shop the collection</Button>
        <Button variant="secondary">Our materials</Button>
      </div>
      <Grid columns={4} gap="large">
        <ProductCard
          title="Stoneware mug"
          brand="Plainfield"
          price="€18"
          tag="New"
          imageUrl="/next.svg"
          href="/"
          LinkComponent={Link}
          ImageComponent={Image}
          imageProps={{ width: 200, height: 200 }}
        />
      </Grid>
    </main>
  );
}
