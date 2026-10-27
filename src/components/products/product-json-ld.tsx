import type { Product } from "@/lib/catalog";
import { stockStatus } from "@/lib/catalog/stock";
import { siteUrl } from "@/lib/site";

/** schema.org Product data, so search engines can show the price and availability. */
export function ProductJsonLd({ product }: { product: Product }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: `${siteUrl}/products/${product.slug}.svg`,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      price: (product.priceCents / 100).toFixed(2),
      priceCurrency: "EUR",
      availability: stockStatus(product.stock).inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  // `<` is escaped so a value containing "</script>" cannot close the tag.
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
