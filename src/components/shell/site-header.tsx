import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@nicolassancho/storybook-core";
import { siteName } from "@/lib/site";
import { CartLink, CartLinkLoader } from "./cart-link";
import { linkStyles } from "./link-styles";
import { SearchForm } from "./search-form";

// Global navigation only: one way into the catalog from any page. The category links live in the
// filter chips on /products and in the footer, so they are not repeated here.
const navItems = [{ label: "Shop", href: "/products" }];

export function SiteHeader() {
  return (
    <Header
      brand={
        <Link href="/" className={linkStyles({ kind: "brand" })}>
          {siteName}
        </Link>
      }
      navItems={navItems}
      LinkComponent={Link}
      actions={
        <>
          <SearchForm />
          <Suspense fallback={<CartLink count={0} />}>
            <CartLinkLoader />
          </Suspense>
        </>
      }
    />
  );
}
