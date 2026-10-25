import Link from "next/link";
import { ChipLink, Text } from "@nicolassancho/storybook-core";
import { getCategories } from "@/lib/catalog";

export async function CategoryLinks() {
  const categories = await getCategories();

  return (
    <section aria-labelledby="categories-title" className="flex flex-col gap-4 py-8">
      <h2 id="categories-title">
        <Text as="span" font="display" size="heading" weight="bold" color="darker">
          Shop by category
        </Text>
      </h2>
      <nav aria-labelledby="categories-title">
        <ul className="flex flex-wrap gap-2">
          {categories.map(({ slug, name }) => (
            <li key={slug}>
              <ChipLink href={`/products?category=${slug}`} LinkComponent={Link}>
                {name}
              </ChipLink>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
