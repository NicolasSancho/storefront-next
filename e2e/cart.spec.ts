import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

interface Line {
  slug: string;
  color: string;
  quantity: number;
}

// Writes the cart cookie the way the app does, so a test can start from a known cart.
async function seedCart(context: BrowserContext, value: Line[] | string) {
  await context.addCookies([
    {
      name: "cart",
      value: encodeURIComponent(typeof value === "string" ? value : JSON.stringify(value)),
      url: "http://localhost:3100",
    },
  ]);
}

async function readCartCookie(context: BrowserContext): Promise<unknown> {
  const cookie = (await context.cookies()).find(({ name }) => name === "cart");
  return cookie ? JSON.parse(decodeURIComponent(cookie.value)) : undefined;
}

function addButton(page: Page) {
  return page.getByRole("button", { name: "Add to cart" });
}

// The cart's lines are the list items of the main content; the header's menu has list items too.
function lines(page: Page) {
  return page.getByRole("main").getByRole("listitem");
}

function row(page: Page, title: string, color: string) {
  return lines(page).filter({ hasText: title }).filter({ hasText: color });
}

// The line total can show the same amount as the subtotal, so the subtotal is found by its label.
function subtotal(page: Page) {
  return page.getByText("Subtotal").locator("xpath=..");
}

test.describe("adding to the cart", () => {
  test("adds the chosen color and shows it in the cart", async ({ page }) => {
    await page.goto("/products/stoneware-mug");
    await page.getByRole("radio", { name: "Slate" }).check();
    await addButton(page).click();

    await expect(page.getByText("Added to your cart. You have 1 of this item.")).toBeVisible();

    await page.goto("/cart");

    await expect(row(page, "Stoneware mug", "Slate")).toContainText("Quantity: 1");
    await expect(row(page, "Stoneware mug", "Slate")).toContainText("€18 each");
    await expect(subtotal(page)).toContainText("€18");
  });

  test("keeps the chosen color selected after adding", async ({ page }) => {
    await page.goto("/products/stoneware-mug");
    await expect(page.getByRole("radio", { name: "Sand" })).toBeChecked();

    await page.getByRole("radio", { name: "Slate" }).check();
    await addButton(page).click();
    await expect(page.getByText("Added to your cart.")).toBeVisible();

    await expect(page.getByRole("radio", { name: "Slate" })).toBeChecked();
  });

  test("announces every repeated add with the new count", async ({ page }) => {
    await page.goto("/products/stoneware-mug");

    await addButton(page).click();
    await expect(page.getByText("You have 1 of this item.")).toBeVisible();

    await addButton(page).click();
    await expect(page.getByText("You have 2 of this item.")).toBeVisible();
  });

  test("updates the count on the header's cart link", async ({ page }) => {
    await page.goto("/products/stoneware-mug");
    const cartLink = page.getByRole("link", { name: /Shopping cart/ });

    await addButton(page).click();
    await expect(page.getByText("You have 1 of this item.")).toBeVisible();
    await addButton(page).click();
    await expect(page.getByText("You have 2 of this item.")).toBeVisible();

    await expect(cartLink).toHaveAccessibleName("Shopping cart, 2 items");
  });

  test("keeps the cart after a reload", async ({ page }) => {
    await page.goto("/products/table-lamp");
    await addButton(page).click();
    await expect(page.getByText("Added to your cart.")).toBeVisible();

    await page.goto("/cart");
    await page.reload();

    await expect(row(page, "Table lamp", "Brass")).toContainText("Quantity: 1");
  });

  test("stops at the stock of the product", async ({ page }) => {
    await page.goto("/products/bud-vase");

    for (const count of [1, 2, 3]) {
      await addButton(page).click();
      await expect(page.getByText(`You have ${count} of this item.`)).toBeVisible();
    }
    await addButton(page).click();

    await expect(
      page.getByText("You already have the most we can offer in your cart.")
    ).toBeVisible();
  });

  test("stops at ten of one product, however much is in stock", async ({ page, context }) => {
    await seedCart(context, [{ slug: "stoneware-mug", color: "Sand", quantity: 10 }]);
    await page.goto("/products/stoneware-mug");

    await addButton(page).click();

    await expect(
      page.getByText("You already have the most we can offer in your cart.")
    ).toBeVisible();
  });

  // The table lamp has 9 in stock and two colors: stock belongs to the lamp, not to a color.
  test("shares the stock between a product's colors", async ({ page, context }) => {
    await seedCart(context, [{ slug: "table-lamp", color: "Brass", quantity: 9 }]);
    await page.goto("/products/table-lamp");
    await page.getByRole("radio", { name: "Black" }).check();

    await addButton(page).click();

    await expect(
      page.getByText("You already have the most we can offer in your cart.")
    ).toBeVisible();
    expect(await readCartCookie(context)).toEqual([
      { slug: "table-lamp", color: "Brass", quantity: 9 },
    ]);
  });

  test("cannot add a sold-out product", async ({ page }) => {
    await page.goto("/products/serving-jug");

    await expect(page.getByRole("button", { name: "Sold out" })).toBeDisabled();
  });

  test("stores the cart in a cookie that scripts cannot read", async ({ page, context }) => {
    await page.goto("/products/stoneware-mug");
    await addButton(page).click();
    await expect(page.getByText("Added to your cart.")).toBeVisible();

    const cookie = (await context.cookies()).find(({ name }) => name === "cart");

    expect(cookie).toMatchObject({ httpOnly: true, sameSite: "Lax", path: "/" });
  });

  test("works without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("http://localhost:3100/products/stoneware-mug");

    await page.getByRole("radio", { name: "Slate" }).check();
    await addButton(page).click();

    await expect
      .poll(() => readCartCookie(context))
      .toEqual([{ slug: "stoneware-mug", color: "Slate", quantity: 1 }]);
    await context.close();
  });
});

test.describe("the server checks what the form sends", () => {
  test("rejects a color the product does not have", async ({ page, context }) => {
    await page.goto("/products/stoneware-mug");
    await page.getByRole("radio", { name: "Slate" }).check();
    await page.getByRole("radio", { name: "Slate" }).evaluate((input: HTMLInputElement) => {
      input.value = "Neon";
    });

    await addButton(page).click();

    await expect(page.getByText("We could not add that product.")).toBeVisible();
    expect(await readCartCookie(context)).toBeUndefined();
  });

  test("rejects a product that does not exist", async ({ page, context }) => {
    await page.goto("/products/stoneware-mug");
    await page.locator('input[name="slug"]').evaluate((input: HTMLInputElement) => {
      input.value = "no-such-product";
    });

    await addButton(page).click();

    await expect(page.getByText("We could not add that product.")).toBeVisible();
    expect(await readCartCookie(context)).toBeUndefined();
  });
});

test.describe("the cart page", () => {
  test("shows an empty cart with a way back to the products", async ({ page }) => {
    await page.goto("/cart");

    await expect(page.getByText("Your cart is empty.")).toBeVisible();

    await page.getByRole("link", { name: "Browse all products" }).click();

    await expect(page).toHaveURL("/products");
  });

  test("lists each line with its price and a subtotal", async ({ page, context }) => {
    await seedCart(context, [
      { slug: "stoneware-mug", color: "Sand", quantity: 2 },
      { slug: "table-lamp", color: "Brass", quantity: 1 },
    ]);
    await page.goto("/cart");

    await expect(lines(page)).toHaveCount(2);
    await expect(row(page, "Stoneware mug", "Sand")).toContainText("€18 each");
    await expect(row(page, "Stoneware mug", "Sand")).toContainText("€36");
    await expect(row(page, "Table lamp", "Brass")).toContainText("€89 each");
    // 2 × €18 + €89
    await expect(subtotal(page)).toContainText("€125");
  });

  test("keeps one product in two colors as two lines", async ({ page, context }) => {
    await seedCart(context, [
      { slug: "stoneware-mug", color: "Sand", quantity: 1 },
      { slug: "stoneware-mug", color: "Slate", quantity: 2 },
    ]);
    await page.goto("/cart");

    await expect(row(page, "Stoneware mug", "Sand")).toContainText("Quantity: 1");
    await expect(row(page, "Stoneware mug", "Slate")).toContainText("Quantity: 2");
  });

  test("changes a quantity with + and −, and keeps the line where it is", async ({
    page,
    context,
  }) => {
    await seedCart(context, [
      { slug: "stoneware-mug", color: "Sand", quantity: 1 },
      { slug: "table-lamp", color: "Brass", quantity: 1 },
    ]);
    await page.goto("/cart");

    await page.getByRole("button", { name: "Increase quantity of Stoneware mug, Sand" }).click();

    await expect(row(page, "Stoneware mug", "Sand")).toContainText("Quantity: 2");
    await expect(subtotal(page)).toContainText("€125");
    await expect(lines(page).first()).toContainText("Stoneware mug");

    await page.getByRole("button", { name: "Decrease quantity of Stoneware mug, Sand" }).click();

    await expect(row(page, "Stoneware mug", "Sand")).toContainText("Quantity: 1");
    await expect(subtotal(page)).toContainText("€107");
  });

  test("ignores a quantity change that is not one up or down", async ({ page, context }) => {
    await seedCart(context, [{ slug: "stoneware-mug", color: "Sand", quantity: 1 }]);
    await page.goto("/cart");
    await page
      .getByRole("button", { name: "Increase quantity of Stoneware mug, Sand" })
      .evaluate((button: HTMLButtonElement) => {
        button.value = "5";
      });

    // Wait for the action itself: its answer is the same page, so nothing on screen would change.
    const actionDone = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" && new URL(response.url()).pathname === "/cart"
    );
    await page.getByRole("button", { name: "Increase quantity of Stoneware mug, Sand" }).click();
    await actionDone;

    expect(await readCartCookie(context)).toEqual([
      { slug: "stoneware-mug", color: "Sand", quantity: 1 },
    ]);
    await page.reload();
    await expect(row(page, "Stoneware mug", "Sand")).toContainText("Quantity: 1");
  });

  test("gives a product's colors one stock between them", async ({ page, context }) => {
    // Table lamp: 9 in stock. The cookie holds 5 Brass and 9 Black, so Black gets what is left.
    await seedCart(context, [
      { slug: "table-lamp", color: "Brass", quantity: 5 },
      { slug: "table-lamp", color: "Black", quantity: 9 },
    ]);
    await page.goto("/cart");

    await expect(row(page, "Table lamp", "Brass")).toContainText("Quantity: 5");
    await expect(row(page, "Table lamp", "Black")).toContainText("Quantity: 4");
    await expect(
      page.getByRole("button", { name: "Increase quantity of Table lamp, Brass" })
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: "Increase quantity of Table lamp, Black" })
    ).toBeDisabled();
    // 9 lamps at €89
    await expect(subtotal(page)).toContainText("€801");
  });

  test("keeps a forced + from going over the shared stock", async ({ page, context }) => {
    await seedCart(context, [
      { slug: "table-lamp", color: "Brass", quantity: 5 },
      { slug: "table-lamp", color: "Black", quantity: 4 },
    ]);
    await page.goto("/cart");
    const increase = page.getByRole("button", { name: "Increase quantity of Table lamp, Brass" });
    await expect(increase).toBeDisabled();
    await increase.evaluate((button: HTMLButtonElement) => {
      button.disabled = false;
    });

    const actionDone = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" && new URL(response.url()).pathname === "/cart"
    );
    await increase.click();
    await actionDone;

    expect(await readCartCookie(context)).toEqual([
      { slug: "table-lamp", color: "Brass", quantity: 5 },
      { slug: "table-lamp", color: "Black", quantity: 4 },
    ]);
  });

  test("lets one color grow into what the other leaves free", async ({ page, context }) => {
    await seedCart(context, [
      { slug: "table-lamp", color: "Brass", quantity: 1 },
      { slug: "table-lamp", color: "Black", quantity: 1 },
    ]);
    await page.goto("/cart");

    await page.getByRole("button", { name: "Increase quantity of Table lamp, Brass" }).click();

    await expect(row(page, "Table lamp", "Brass")).toContainText("Quantity: 2");
    await expect(row(page, "Table lamp", "Black")).toContainText("Quantity: 1");
  });

  test("disables − at one and + at the stock", async ({ page, context }) => {
    await seedCart(context, [{ slug: "bud-vase", color: "Oat", quantity: 3 }]);
    await page.goto("/cart");

    await expect(
      page.getByRole("button", { name: /Increase quantity of Bud vase/ })
    ).toBeDisabled();
    await expect(page.getByRole("button", { name: /Decrease quantity of Bud vase/ })).toBeEnabled();

    await page.getByRole("button", { name: /Decrease quantity of Bud vase/ }).click();
    await page.getByRole("button", { name: /Decrease quantity of Bud vase/ }).click();

    await expect(row(page, "Bud vase", "Oat")).toContainText("Quantity: 1");
    await expect(
      page.getByRole("button", { name: /Decrease quantity of Bud vase/ })
    ).toBeDisabled();
  });

  test("removes a line, and shows the empty cart after the last one", async ({ page, context }) => {
    await seedCart(context, [
      { slug: "stoneware-mug", color: "Sand", quantity: 2 },
      { slug: "table-lamp", color: "Brass", quantity: 1 },
    ]);
    await page.goto("/cart");

    await page.getByRole("button", { name: "Remove Stoneware mug, Sand" }).click();

    await expect(row(page, "Stoneware mug", "Sand")).toHaveCount(0);
    await expect(row(page, "Table lamp", "Brass")).toBeVisible();

    await page.getByRole("button", { name: "Remove Table lamp, Brass" }).click();

    await expect(page.getByText("Your cart is empty.")).toBeVisible();
  });
});

test.describe("a cart cookie the app did not write", () => {
  test("is cut down to the stock", async ({ page, context }) => {
    await seedCart(context, [{ slug: "bud-vase", color: "Oat", quantity: 99 }]);
    await page.goto("/cart");

    await expect(row(page, "Bud vase", "Oat")).toContainText("Quantity: 3");
    await expect(subtotal(page)).toContainText("€96");
  });

  test("loses lines for products that do not exist or are sold out", async ({ page, context }) => {
    await seedCart(context, [
      { slug: "no-such-product", color: "Sand", quantity: 1 },
      { slug: "serving-jug", color: "Clear", quantity: 1 },
      { slug: "tea-towel", color: "Natural", quantity: 1 },
    ]);
    await page.goto("/cart");

    await expect(row(page, "Tea towel", "Natural")).toBeVisible();
    await expect(lines(page)).toHaveCount(1);
  });

  test("is counted in the header like the cart page counts it", async ({ page, context }) => {
    await seedCart(context, [
      { slug: "bud-vase", color: "Oat", quantity: 99 },
      { slug: "no-such-product", color: "Sand", quantity: 4 },
    ]);
    await page.goto("/");

    await expect(page.getByRole("link", { name: /Shopping cart/ })).toHaveAccessibleName(
      "Shopping cart, 3 items"
    );
  });

  test("that is not JSON gives an empty cart instead of an error", async ({ page, context }) => {
    await seedCart(context, "{not json");
    await page.goto("/cart");

    await expect(page.getByText("Your cart is empty.")).toBeVisible();
  });
});

for (const scheme of ["light", "dark"] as const) {
  test.describe(`${scheme} theme`, () => {
    test.use({ colorScheme: scheme });

    test(`the cart page with items has no WCAG A or AA violations`, async ({ page, context }) => {
      await seedCart(context, [
        { slug: "stoneware-mug", color: "Sand", quantity: 2 },
        { slug: "table-lamp", color: "Brass", quantity: 1 },
      ]);
      await page.goto("/cart");
      await expect(row(page, "Stoneware mug", "Sand")).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(results.violations).toEqual([]);
      expect(results.passes.length).toBeGreaterThan(10);
    });
  });
}
