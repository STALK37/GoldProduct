import { describe, it, expect, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import SEO from "@/components/SEO";

// A canonical tag naming a domain you do not own hands that domain the search
// ranking for your pages. Projects exported from a hosted builder routinely
// ship one pointing at the builder's preview URL. VITE_SITE_URL is set to
// https://test.example.com in vitest.config.ts.
const head = (selector: string) => document.head.querySelector(selector);

beforeEach(() => {
  document.head.querySelectorAll("link[rel=canonical], meta, title").forEach((n) => n.remove());
});

const renderSEO = (props: Partial<React.ComponentProps<typeof SEO>> = {}) =>
  render(
    <HelmetProvider>
      <SEO title="Каталог — GoldProduct" description="Натуральні снеки" path="/catalog" {...props} />
    </HelmetProvider>,
  );

describe("SEO", () => {
  it("builds the canonical URL from VITE_SITE_URL", async () => {
    renderSEO();
    await waitFor(() =>
      expect(head("link[rel=canonical]")?.getAttribute("href")).toBe(
        "https://test.example.com/catalog",
      ),
    );
  });

  it("never points anywhere but the configured origin", async () => {
    renderSEO();
    await waitFor(() => expect(head("link[rel=canonical]")).not.toBeNull());

    for (const el of document.head.querySelectorAll("link[rel=canonical], meta[property^='og:'], meta[name^='twitter:']")) {
      const value = el.getAttribute("href") ?? el.getAttribute("content") ?? "";
      if (value.startsWith("http")) {
        expect(value).toMatch(/^https:\/\/test\.example\.com/);
      }
    }
  });

  it("falls back to the site's own OG image", async () => {
    renderSEO();
    await waitFor(() =>
      expect(head("meta[property='og:image']")?.getAttribute("content")).toBe(
        "https://test.example.com/og-image.jpg",
      ),
    );
  });

  it("uses an explicit image when given one", async () => {
    renderSEO({ image: "https://test.example.com/products/chips.jpg" });
    await waitFor(() =>
      expect(head("meta[property='og:image']")?.getAttribute("content")).toBe(
        "https://test.example.com/products/chips.jpg",
      ),
    );
  });

  // Open Graph has no "product" type; emitting one makes crawlers fall back to
  // an unpredictable default.
  it("maps the product type onto og:type website", async () => {
    renderSEO({ type: "product" });
    await waitFor(() =>
      expect(head("meta[property='og:type']")?.getAttribute("content")).toBe("website"),
    );
  });

  it("emits each JSON-LD block it is handed", async () => {
    renderSEO({
      jsonLd: [
        { "@context": "https://schema.org", "@type": "Organization", name: "GoldProduct" },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [] },
      ],
    });

    await waitFor(() => {
      const blocks = [...document.head.querySelectorAll("script[type='application/ld+json']")];
      expect(blocks).toHaveLength(2);
      expect(JSON.parse(blocks[0].textContent ?? "{}")["@type"]).toBe("Organization");
      expect(JSON.parse(blocks[1].textContent ?? "{}")["@type"]).toBe("BreadcrumbList");
    });
  });
});
