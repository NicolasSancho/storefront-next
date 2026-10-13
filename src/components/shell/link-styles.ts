import { tv } from "tailwind-variants";

// The header's brand and cart links are app markup, so they carry the design system's focus ring
// themselves (same classes as the library's own links).
export const linkStyles = tv({
  base: "rounded-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
  variants: {
    kind: {
      brand: "whitespace-nowrap font-display text-xl font-bold text-neutral-900",
      icon: "inline-flex p-1",
    },
  },
});
