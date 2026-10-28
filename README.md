# storefront-next

**Live: https://storefront-next-orpin.vercel.app/**

[![CI](https://github.com/NicolasSancho/storefront-next/actions/workflows/ci.yml/badge.svg)](https://github.com/NicolasSancho/storefront-next/actions/workflows/ci.yml)

A storefront built with the Next.js App Router, TypeScript and Tailwind CSS v4. Its UI comes from
[`@nicolassancho/storybook-core`](https://www.npmjs.com/package/@nicolassancho/storybook-core), a
design system I publish and document in
[Storybook](https://nicolassancho.github.io/Storybook-core/) ([source](https://github.com/NicolasSancho/Storybook-core)).

The goal is to show the design system working in a real app: Server Components by default, client
code only where interaction needs it, and no design-system code copied into the app.

## Scope

This is a showcase for the design system, not a shop. The catalog is 12 fixed sample products in
`src/lib/catalog/`, and there is no checkout, no accounts and no database. The data functions
(`getProducts`, `getProduct`) are the only place that knows where products come from, so
replacing them with an API call would not touch the pages.

It is not built for a large catalog. The cart page and the header count load the whole catalog,
the listing has no pagination, and search and filters run in memory. A real shop would fetch only
the products in the cart, paginate and search on the server, and reserve stock at checkout. The
cart cookie also holds at most about 4 KB of lines.

## Performance

Lighthouse 13.0.0 against the live site, mobile profile with the default throttling, on
2026-10-28. Each number is the median of 5 runs. JavaScript is the compressed size transferred on
the first load.

| Page                      | Performance | Accessibility | Best practices | SEO | LCP    | CLS   | TBT   | JavaScript |
| ------------------------- | ----------- | ------------- | -------------- | --- | ------ | ----- | ----- | ---------- |
| `/`                       | 99          | 100           | 100            | 100 | 1.84 s | 0     | 75 ms | 146 KB     |
| `/products`               | 99          | 100           | 100            | 100 | 1.84 s | 0.038 | 79 ms | 160 KB     |
| `/products/stoneware-mug` | 98          | 100           | 100            | 100 | 2.11 s | 0     | 96 ms | 160 KB     |

Lab results from one machine and network: they will vary on yours.

## Routes

| Route              | What it shows                                                  | Rendering                                             |
| ------------------ | -------------------------------------------------------------- | ----------------------------------------------------- |
| `/`                | Hero, new arrivals, category links                             | Static page content, with the header cart streamed in |
| `/products`        | The catalog, filtered by `?category=` and `?q=`                | Static heading, the filtered results stream in        |
| `/products/[slug]` | One product: price, stock, colors, specs, breadcrumbs, JSON-LD | All 12 pages prerendered with `generateStaticParams`  |
| `/cart`            | The cart lines, quantity controls and subtotal                 | Static heading, the lines stream in from the cookie   |

An unknown URL returns a 404 with the branded `src/app/not-found.tsx`. An unknown product slug renders
its own `not-found.tsx`. With Cache Components the first request returns
200 with `noindex` and later ones return 404, because the page shell streams before `notFound()`
runs. The catalog is fixed and nothing links to unknown slugs, so a Proxy check was not added.

## The cart

The cart is a cookie of `{ slug, color, quantity }` lines, written by Server Actions
(`src/lib/cart-actions.ts`). An action is a public POST endpoint, so each one checks the product,
the color and the stock on the server (stock belongs to the product, so its colors share it), and prices are always read from the catalog, never from the
request. The add-to-cart form is the only client component. It is there for feedback (the pending
state and an announced result message): a plain form would add to the cart too, without either. The add-to-cart form works without JavaScript. The streamed
parts of a page (the cart lines, the filtered results, the header count) are in the HTML but only
become visible once JavaScript runs.

## Stack

- Next.js 16 (App Router, Turbopack, Cache Components) and React 19
- TypeScript in strict mode
- Tailwind CSS v4, with the design tokens imported from the library
- `next/font` for Hanken Grotesk (body) and Bricolage Grotesque (headings)
- ESLint with `next/core-web-vitals` and the TypeScript rules

## How it uses the design system

- The library is installed from npm. Its tokens are imported in `src/app/globals.css`, and
  `@source` lets Tailwind find the classes in its compiled output.
- Its components are stateless, so they render from Server Components with no `"use client"`.
  `next/link` and `next/image` are passed in through the `LinkComponent` and `ImageComponent` props.
- Interactive pieces (anything that takes an event handler) live in small client components,
  because a Server Component cannot pass functions.
- The dark theme follows the operating system.

## Getting started

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

| Command                | What it does                                         |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Development server                                   |
| `npm run build`        | Production build                                     |
| `npm start`            | Serve the production build                           |
| `npm run lint`         | ESLint                                               |
| `npm run format`       | Format with Prettier                                 |
| `npm run format:check` | Check the formatting (CI)                            |
| `npm test`             | Unit tests (Vitest)                                  |
| `npm run test:e2e`     | End-to-end tests (Playwright), after `npm run build` |

## Testing

- **Unit tests** (Vitest) cover the pure logic in `src/lib`: catalog filtering and search, the
  featured selection, the stock line, price formatting, and the cart (cookie parser, quantity
  rules, joining lines with the catalog, subtotal).
- **End-to-end tests** (Playwright, Chromium) cover the home page, the product listing with its
  filters and search, the product page (details, breadcrumbs, stock states, structured data, the
  not-found page), the cart (adding, quantities, stock limits, removing, a tampered form or cookie,
  adding without JavaScript), the keyboard skip link, and an axe accessibility check of the main
  pages at phone and desktop width in light and dark. Run `npm run build` first: they test the
  production build.
- CI runs both in two parallel jobs, `checks` and `e2e`. A failing end-to-end run uploads the
  Playwright report (with traces) as an artifact for seven days.
