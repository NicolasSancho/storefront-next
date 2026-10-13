import { tv } from "tailwind-variants";

// Hidden until it takes keyboard focus, then shown over the page. It has to be the first
// focusable element, so keyboard users can jump past the header on every page.
const skipLinkStyles = tv({
  base: "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-primary focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
});

export function SkipLink() {
  return (
    <a href="#main-content" className={skipLinkStyles()}>
      Skip to main content
    </a>
  );
}
