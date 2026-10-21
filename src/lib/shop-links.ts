import { getCategories } from "@/lib/catalog";

export interface ShopLink {
  label: string;
  href: string;
}

/**
 * "All products" plus one link per category, used by the footer. The categories come from the
 * cached catalog, so it stays static.
 */
export async function getShopLinks(): Promise<ShopLink[]> {
  const categories = await getCategories();

  return [
    { label: "All products", href: "/products" },
    ...categories.map(({ slug, name }) => ({ label: name, href: `/products?category=${slug}` })),
  ];
}
