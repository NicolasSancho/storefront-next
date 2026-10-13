import Link from "next/link";
import { Footer } from "@nicolassancho/storybook-core";
import { getShopLinks } from "@/lib/shop-links";
import { projectLinks, siteName, siteTagline } from "@/lib/site";

export async function SiteFooter() {
  const shopLinks = await getShopLinks();

  return (
    <Footer
      brand={
        <>
          <p className="font-display text-xl font-bold text-neutral-900">{siteName}</p>
          <p className="mt-2 text-sm text-neutral-600">{siteTagline}</p>
        </>
      }
      columns={[
        { title: "Shop", links: shopLinks },
        { title: "Project", links: projectLinks },
      ]}
      LinkComponent={Link}
      // No year: `new Date()` cannot run in the static shell, and a hardcoded year goes stale.
      legal="A demo store built to show a design system in a real app. Nothing here is for sale."
    />
  );
}
