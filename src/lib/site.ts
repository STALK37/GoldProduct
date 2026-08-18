/**
 * The site's own origin, no trailing slash.
 *
 * Canonical links, Open Graph tags and JSON-LD are all built from this. Set
 * VITE_SITE_URL to your own domain before deploying — a canonical tag naming a
 * domain you do not own hands it the search ranking for your pages, which is
 * the most common way a project exported from a hosted builder quietly loses
 * its SEO.
 */
export const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? "https://goldproduct.org";
