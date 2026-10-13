export type CategorySlug = "ceramics" | "glassware" | "lighting" | "textiles";

export interface Category {
  slug: CategorySlug;
  name: string;
}

export interface ProductColor {
  name: string;
  /** Swatch color. Product content, so a fixed value, not a design token. */
  value: string;
}

export interface Product {
  slug: string;
  title: string;
  brand: string;
  /** Price in cents, so it never goes through floating point. Use `formatPrice` to show it. */
  priceCents: number;
  category: CategorySlug;
  colors: ProductColor[];
  /** Units in stock. 0 means sold out. */
  stock: number;
  /** A badge for the card, such as "New". */
  tag?: string;
  description: string;
  specs: { label: string; value: string }[];
  /** Text alternative for the product image, used where the image is not decorative. */
  imageAlt: string;
}

export interface ProductFilters {
  category?: CategorySlug;
  /** Free text, matched against title, description and category name. */
  q?: string;
}
