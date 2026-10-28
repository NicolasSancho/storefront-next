import Link from "next/link";
import { ChipLink } from "@nicolassancho/storybook-core";
import { getCategories, type CategorySlug } from "@/lib/catalog";

interface CategoryChipsProps {
  /** The category in the URL. */
  category?: CategorySlug;
  /** Whether "All" is the current choice, which is only true when nothing is filtered. */
  allSelected?: boolean;
}

/**
 * One link per category, plus "All". They are plain links, so they need no client code.
 * A chip sets only the category: it clears any search, as the search form clears the category.
 */
export async function CategoryChips({ category, allSelected = false }: CategoryChipsProps) {
  const categories = await getCategories();

  return (
    <nav aria-label="Filter by category">
      <ul className="flex flex-wrap gap-2">
        <li>
          <ChipLink href="/products" selected={allSelected} LinkComponent={Link}>
            All
          </ChipLink>
        </li>
        {categories.map(({ slug, name }) => (
          <li key={slug}>
            <ChipLink
              href={`/products?category=${slug}`}
              selected={category === slug}
              LinkComponent={Link}
            >
              {name}
            </ChipLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
