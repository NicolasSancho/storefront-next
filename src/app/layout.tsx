import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import { PromoBar } from "@/components/shell/promo-bar";
import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { SkipLink } from "@/components/shell/skip-link";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const body = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

const heading = Bricolage_Grotesque({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Storefront",
  description: "A Next.js storefront built on the @nicolassancho/storybook-core design system.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${heading.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-surface font-sans text-neutral-900">
        <SkipLink />
        <PromoBar />
        <SiteHeader />
        {/* The one main landmark of every page. tabIndex lets the skip link move focus here. */}
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-hidden">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
