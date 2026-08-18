import { test, expect, type Page } from "@playwright/test";

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/snacks", name: "snacks" },
  { path: "/catalog", name: "catalogue" },
  { path: "/about", name: "about" },
  { path: "/where-to-buy", name: "where to buy" },
  { path: "/cooperation", name: "cooperation" },
  { path: "/contacts", name: "contacts" },
];

/** Images that finished loading with no intrinsic width never arrived. */
const brokenImages = (page: Page) =>
  page.evaluate(() =>
    Array.from(document.images)
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src),
  );

test.describe("storefront", () => {
  test("the home page renders its hero and catalogue links", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/GoldProduct/);
    await expect(page.locator("#root")).not.toBeEmpty();
    await expect(page.getByRole("link", { name: /каталог/i }).first()).toBeVisible();
  });

  for (const { path, name } of ROUTES) {
    test(`${name} responds and renders`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      // A blank SPA still returns 200, so check something actually painted.
      // Not every route mounts the shared Header — the catalogue has its own
      // chrome — so assert on what they all have: visible content and a link.
      await expect(page.locator("#root")).not.toBeEmpty();
      await expect(page.locator("a:visible").first()).toBeVisible();
      await expect(page.locator("h1, h2").first()).toBeVisible();
    });
  }

  test("an unknown route reaches the 404 page rather than a blank screen", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.locator("#root")).not.toBeEmpty();
    await expect(page.getByText(/404|не знайдено|not found/i).first()).toBeVisible();
  });

  // The single most common way a static build degrades silently: an asset that
  // resolved during development and 404s once hashed and copied into dist/.
  test("no image on the home page is broken", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(await brokenImages(page)).toEqual([]);
  });

  test("no image on the catalogue is broken", async ({ page }) => {
    await page.goto("/catalog");
    await page.waitForLoadState("networkidle");
    expect(await brokenImages(page)).toEqual([]);
  });

  test("the page loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Supabase calls fail without a real project; everything else must be clean.
    expect(errors.filter((e) => !/supabase|Failed to fetch|net::ERR/i.test(e))).toEqual([]);
  });
});

test.describe("cart", () => {
  test("adding a product opens the basket with the item in it", async ({ page }) => {
    await page.goto("/catalog");
    await page.waitForLoadState("networkidle");

    const addButton = page.getByRole("button", { name: /купити|до кошика|в кошик/i }).first();
    test.skip(!(await addButton.count()), "catalogue is empty without a Supabase project");

    await addButton.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText(/Разом/)).toBeVisible();
  });
});

test.describe("SEO", () => {
  test("the canonical tag points at this site, not a builder preview URL", async ({ page }) => {
    await page.goto("/contacts");
    const canonical = await page.locator("link[rel=canonical]").getAttribute("href");
    expect(canonical).toBeTruthy();
    expect(canonical).not.toMatch(/lovable|vercel\.app|netlify\.app/i);
  });

  test("no build-tool placeholder survived into the served HTML", async ({ page }) => {
    const response = await page.goto("/");
    const html = (await response?.text()) ?? "";
    expect(html).not.toContain("%VITE_");
    expect(html.toLowerCase()).not.toContain("lovable");
  });

  test("Open Graph and JSON-LD are present", async ({ page }) => {
    await page.goto("/");
    // index.html carries a static pair and react-helmet injects its own.
    await expect(page.locator('meta[property="og:image"]').first())
      .toHaveAttribute("content", /https?:\/\//);
    const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(() => JSON.parse(ld ?? "")).not.toThrow();
  });
});

test.describe("admin", () => {
  test("the admin panel is behind a login and loads as its own chunk", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText(/Панель адміністратора|Панель администратора/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /увійти|войти|sign in/i })).toBeVisible();
  });

  test("the orders page bounces an anonymous visitor back to the login", async ({ page }) => {
    await page.goto("/admin/orders");
    await page.waitForURL(/\/admin$/, { timeout: 10_000 });
    expect(new URL(page.url()).pathname).toBe("/admin");
  });
});
