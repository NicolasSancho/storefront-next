import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("has one heading and a call to action that leads to the products", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Quiet objects for rooms you live in."
    );

    await page.getByRole("link", { name: "Shop the collection" }).click();

    await expect(page).toHaveURL("/products");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Products");
  });

  test("features the tagged products first, then fills up to four", async ({ page }) => {
    await page.goto("/");

    const featured = page.getByRole("region", { name: "New this season" });

    await expect(featured.getByRole("heading", { level: 3 })).toHaveText([
      "Stoneware mug",
      "Water carafe",
      "Pendant light",
      "Shallow bowl",
    ]);
  });

  test("category links open the filtered listing", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("navigation", { name: "Shop by category" })
      .getByRole("link", { name: "Ceramics" })
      .click();

    await expect(page).toHaveURL("/products?category=ceramics");
  });
});
