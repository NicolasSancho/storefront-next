import { getCategories } from "@/lib/catalog";

export interface ShopLink {
  label: string;
  href: string;
}

/**
 * "All products" plus one link per category, shared by the header navigation and the footer so
 * the two never drift apart. The categories come from the cached catalog, so it stays static.
 */
export async function getShopLinks(): Promise<ShopLink[]> {
  const categories = await getCategories();

  return [
    { label: "All products", href: "/products" },
    ...categories.map(({ slug, name }) => ({ label: name, href: `/products?category=${slug}` })),
  ];
}
