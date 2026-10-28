import { expect, test } from "@playwright/test";

const pages = [
  "/",
  "/products",
  "/products/stoneware-mug",
  "/cart",
  "/products/does-not-exist",
  "/no-such-page",
];

test.describe("site shell", () => {
  test("the skip link is the first tab stop and moves focus to the main content", async ({
    page,
  }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();

    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/#main-content$/);
    await expect(page.getByRole("main")).toBeFocused();
  });

  for (const path of pages) {
    test(`${path} has one main landmark and one level-1 heading`, async ({ page }) => {
      await page.goto(path);

      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    });
  }

  test("the header offers search and a link to the cart", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("search")).toBeVisible();
    await expect(page.getByRole("link", { name: /Shopping cart/ })).toHaveAttribute(
      "href",
      "/cart"
    );
  });

  test("an unknown URL returns 404 with a branded page and a single title", async ({ page }) => {
    const response = await page.goto("/no-such-page");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Go to the home page" })).toHaveAttribute(
      "href",
      "/"
    );
    await expect(page).toHaveTitle("Page not found");
    await expect(page.locator("head title")).toHaveCount(1);
  });
});
