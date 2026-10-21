import Image from "next/image";
import Link from "next/link";
import { ProductGrid, Text } from "@nicolassancho/storybook-core";
import { linkStyles } from "@/components/shell/link-styles";
import { filterProducts, getCategories, getProducts, parseFilters } from "@/lib/catalog";
import { CategoryChips } from "./category-chips";
import { toProductCardProps } from "./product-card";

interface ProductResultsProps {
  searchParams: PageProps<"/products">["searchParams"];
}

/**
 * The filtered part of the products page. It awaits `searchParams`, which is request-time data, so
 * the page renders it inside a `<Suspense>` boundary and the rest of the page stays static.
 */
export async function ProductResults({ searchParams }: ProductResultsProps) {
  const categories = await getCategories();
  const { category, q } = parseFilters(await searchParams, categories);
  const products = filterProducts(await getProducts(), categories, { category, q });

  const heading = q
    ? "Search results"
    : (categories.find(({ slug }) => slug === category)?.name ?? "All products");

  return (
    <>
      <CategoryChips category={category} allSelected={!category && !q} />
      {/* The page's h1 is followed by this h2, so the product cards' h3 headings nest correctly. */}
      <Text as="h2" className="sr-only">
        {heading}
      </Text>
      {q && (
        <Text as="p" color="dark">
          Results for “{q}”
        </Text>
      )}
      {products.length > 0 ? (
        <ProductGrid
          columns={4}
          gap="large"
          LinkComponent={Link}
          ImageComponent={Image}
          products={products.map(toProductCardProps)}
        />
      ) : (
        <Text as="p" color="dark">
          No products match your search.{" "}
          <Link href="/products" className={linkStyles({ className: "underline" })}>
            Show all products
          </Link>
        </Text>
      )}
    </>
  );
}
