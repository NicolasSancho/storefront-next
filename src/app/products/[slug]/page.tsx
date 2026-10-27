import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, Container } from "@nicolassancho/storybook-core";
import { ProductDetail } from "@/components/products/product-detail";
import { getCategories, getProduct, getProducts } from "@/lib/catalog";

export async function generateStaticParams() {
  const products = await getProducts();

  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return {};

  return {
    title: product.title,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([getProduct(slug), getCategories()]);

  if (!product) notFound();

  const category = categories.find(({ slug: categorySlug }) => categorySlug === product.category);
  if (!category) throw new Error(`Product "${product.slug}" has an unknown category`);

  return (
    <Container className="flex flex-col gap-8 py-8">
      <Breadcrumbs
        LinkComponent={Link}
        items={[
          { label: "Home", href: "/" },
          { label: category.name, href: `/products?category=${category.slug}` },
          { label: product.title },
        ]}
      />
      <ProductDetail product={product} categoryName={category.name} />
    </Container>
  );
}
