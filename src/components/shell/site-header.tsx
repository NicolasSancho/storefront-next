import { Suspense } from "react";
import Link from "next/link";
import { Header } from "@nicolassancho/storybook-core";
import { getShopLinks } from "@/lib/shop-links";
import { siteName } from "@/lib/site";
import { CartLink, CartLinkLoader } from "./cart-link";
import { linkStyles } from "./link-styles";
import { SearchForm } from "./search-form";

export async function SiteHeader() {
  const shopLinks = await getShopLinks();

  return (
    <Header
      brand={
        <Link href="/" className={linkStyles({ kind: "brand" })}>
          {siteName}
        </Link>
      }
      navItems={shopLinks}
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
