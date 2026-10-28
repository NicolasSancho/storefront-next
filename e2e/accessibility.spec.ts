import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  { name: "home", path: "/" },
  { name: "products", path: "/products" },
  { name: "product", path: "/products/stoneware-mug" },
  { name: "empty cart", path: "/cart" },
  { name: "unknown product", path: "/products/does-not-exist" },
  { name: "not found", path: "/no-such-page" },
];
const viewports = [
  { name: "phone", width: 375, height: 800 },
  { name: "desktop", width: 1280, height: 800 },
];
const schemes = ["light", "dark"] as const;

for (const scheme of schemes) {
  for (const viewport of viewports) {
    test.describe(`${scheme} theme, ${viewport.name}`, () => {
      test.use({
        colorScheme: scheme,
        viewport: { width: viewport.width, height: viewport.height },
      });

      for (const { name, path } of pages) {
        test(`${name} page has no WCAG A or AA violations`, async ({ page }) => {
          await page.goto(path);
          // Wait for the page's own content first, so axe never audits an empty shell.
          await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

          const results = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze();

          expect(results.violations).toEqual([]);
          // A run that checked nothing would also have no violations.
          expect(results.passes.length).toBeGreaterThan(10);
        });
      }
    });
  }
}
