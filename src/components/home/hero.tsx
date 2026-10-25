import Image from "next/image";
import Link from "next/link";
import { ButtonLink, Text } from "@nicolassancho/storybook-core";
import { getHeroProducts } from "@/lib/catalog";

export async function Hero() {
  const products = await getHeroProducts();

  return (
    <section
      aria-labelledby="hero-title"
      className="grid items-center gap-10 py-12 md:grid-cols-2"
    >
      <div className="flex flex-col items-start gap-5">
        <Text
          as="p"
          size="small"
          weight="semibold"
          color="primary"
          className="uppercase tracking-wider"
        >
          Autumn collection
        </Text>
        <h1 id="hero-title">
          <Text as="span" font="display" size="display" weight="bold" color="darker">
            Quiet objects for rooms you live in.
          </Text>
        </h1>
        <Text as="p" size="large" color="base" className="max-w-[46ch]">
          Ceramics, glassware, lighting and textiles, made in small runs and priced fairly.
        </Text>
        <ButtonLink href="/products" LinkComponent={Link} size="large">
          Shop the collection
        </ButtonLink>
      </div>
      {/* Decorative: the products are named and linked in the grid below. */}
      <div aria-hidden className="grid grid-cols-3 gap-3">
        {products.map(({ slug }) => (
          <Image
            key={slug}
            src={`/products/${slug}.svg`}
            alt=""
            width={600}
            height={800}
            sizes="(min-width: 768px) 16vw, 30vw"
            loading="eager"
            className="h-auto w-full rounded-lg"
          />
        ))}
      </div>
    </section>
  );
}
