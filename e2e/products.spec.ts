import { expect, test, type Page } from "@playwright/test";
import { products } from "../src/lib/catalog/data";

const titlesIn = (category: string) =>
  products.filter((product) => product.category === category).map(({ title }) => title);

test.describe("product listing", () => {
  const chips = (page: Page) => page.getByRole("navigation", { name: "Filter by category" });

  test("lists every product, in catalog order", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByRole("heading", { level: 3 })).toHaveText(
      products.map(({ title }) => title)
    );
    await expect(chips(page).getByRole("link", { name: "All", exact: true })).toHaveAttribute(
      "aria-current",
      "true"
    );
  });

  test("a category chip filters the list and marks itself as current", async ({ page }) => {
    await page.goto("/products");

    await chips(page).getByRole("link", { name: "Glassware" }).click();

    await expect(page).toHaveURL("/products?category=glassware");
    await expect(page.getByRole("heading", { level: 3 })).toHaveText(titlesIn("glassware"));
    await expect(chips(page).getByRole("link", { name: "Glassware" })).toHaveAttribute(
      "aria-current",
      "true"
    );
    await expect(chips(page).getByRole("link", { name: "All", exact: true })).not.toHaveAttribute(
      "aria-current",
      "true"
    );
  });

  test("a category in the URL is applied on the first load", async ({ page }) => {
    await page.goto("/products?category=lighting");

    await expect(page.getByRole("heading", { level: 3 })).toHaveText(titlesIn("lighting"));
  });

  test("an unknown category in the URL is ignored", async ({ page }) => {
    await page.goto("/products?category=furniture");

    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(products.length);
    await expect(chips(page).getByRole("link", { name: "All", exact: true })).toHaveAttribute(
      "aria-current",
      "true"
    );
  });

  test("search matches the title", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("searchbox", { name: "Search products" }).fill("mug");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page).toHaveURL("/products?q=mug");
    await expect(page.getByText("Results for “mug”")).toBeVisible();
    await expect(page.getByRole("heading", { level: 3 })).toHaveText(["Stoneware mug"]);
  });

  test("search also matches the description, ignoring case and surrounding spaces", async ({
    page,
  }) => {
    await page.goto("/products");

    await page.getByRole("searchbox", { name: "Search products" }).fill("  LINEN ");
    await page.getByRole("button", { name: "Search" }).click();

    // The table lamp has no "linen" in its title, only in its description ("a linen shade").
    await expect(page.getByRole("heading", { level: 3 })).toHaveText(["Table lamp", "Linen throw"]);
  });

  test("a search with no match says so and offers the full list", async ({ page }) => {
    await page.goto("/products?q=zzzz");

    await expect(page.getByText("No products match your search.")).toBeVisible();
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(0);

    await page.getByRole("link", { name: "Show all products" }).click();

    await expect(page).toHaveURL("/products");
    await expect(page.getByRole("heading", { level: 3 })).toHaveCount(products.length);
  });

  test("a product card links to its page", async ({ page }) => {
    await page.goto("/products");

    await page.getByRole("link", { name: /Stoneware mug/ }).click();

    await expect(page).toHaveURL("/products/stoneware-mug");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Stoneware mug");
  });
});
