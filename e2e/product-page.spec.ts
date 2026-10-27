import { expect, test, type Page } from "@playwright/test";

test.describe("product page", () => {
  test("shows the product's details", async ({ page }) => {
    await page.goto("/products/stoneware-mug");

    await expect(page).toHaveTitle("Stoneware mug");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Stoneware mug");
    await expect(page.getByText("€18", { exact: true })).toBeVisible();
    await expect(page.getByText("In stock", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("img", { name: "A sand-colored stoneware mug with a wide handle." })
    ).toBeVisible();

    await expect(page.getByRole("term")).toHaveText(["Capacity", "Material", "Care"]);
    await expect(page.getByRole("definition")).toHaveText([
      "350 ml",
      "Stoneware",
      "Dishwasher safe",
    ]);

    const colors = page.getByRole("region", { name: "Colors" });
    await expect(colors.getByRole("listitem")).toHaveText(["Sand", "Slate"]);
  });

  test("has breadcrumbs back to the category and the home page", async ({ page }) => {
    await page.goto("/products/stoneware-mug");

    const breadcrumbs = page.getByRole("navigation", { name: "Breadcrumb" });

    await expect(breadcrumbs.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    await expect(breadcrumbs.getByRole("link", { name: "Ceramics" })).toHaveAttribute(
      "href",
      "/products?category=ceramics"
    );
    await expect(breadcrumbs.getByText("Stoneware mug")).toBeVisible();
  });

  test.describe("stock line", () => {
    const cases = [
      { slug: "serving-jug", shown: "Sold out" },
      { slug: "bud-vase", shown: "Only 3 left" },
      { slug: "pendant-light", shown: "Only 5 left" },
      { slug: "shallow-bowl", shown: "In stock" },
    ];

    for (const { slug, shown } of cases) {
      test(`${slug}: ${shown}`, async ({ page }) => {
        await page.goto(`/products/${slug}`);

        await expect(page.getByText(shown, { exact: true })).toBeVisible();
      });
    }
  });

  test.describe("structured data", () => {
    async function readJsonLd(page: Page) {
      const text = await page.locator('script[type="application/ld+json"]').textContent();
      return JSON.parse(text ?? "null");
    }

    test("describes an available product", async ({ page }) => {
      await page.goto("/products/stoneware-mug");

      const data = await readJsonLd(page);

      expect(data).toMatchObject({
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Stoneware mug",
        brand: { "@type": "Brand", name: "Plainfield" },
        offers: {
          "@type": "Offer",
          price: "18.00",
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
        },
      });
      expect(data.offers.url).toMatch(/\/products\/stoneware-mug$/);
      expect(data.image).toMatch(/\/products\/stoneware-mug\.svg$/);
    });

    test("marks a sold-out product as out of stock", async ({ page }) => {
      await page.goto("/products/serving-jug");

      const data = await readJsonLd(page);

      expect(data.offers.availability).toBe("https://schema.org/OutOfStock");
    });
  });

  test("links to its own canonical URL", async ({ page }) => {
    await page.goto("/products/table-lamp");

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /\/products\/table-lamp$/
    );
  });

  // The status code is not asserted on purpose: with Cache Components the first request for an
  // unknown slug returns 200 with noindex and later ones 404 (documented in the README).
  test("an unknown product shows the not-found page and is kept out of search results", async ({
    page,
  }) => {
    await page.goto("/products/does-not-exist");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Product not found");
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);

    await page.getByRole("link", { name: "Browse all products" }).click();

    await expect(page).toHaveURL("/products");
  });
});
