# storefront-next

**Live: https://storefront-next-orpin.vercel.app/**

[![CI](https://github.com/NicolasSancho/storefront-next/actions/workflows/ci.yml/badge.svg)](https://github.com/NicolasSancho/storefront-next/actions/workflows/ci.yml)

A storefront built with the Next.js App Router, TypeScript and Tailwind CSS v4. Its UI comes from
[`@nicolassancho/storybook-core`](https://www.npmjs.com/package/@nicolassancho/storybook-core), a
design system I publish and document in
[Storybook](https://nicolassancho.github.io/Storybook-core/) ([source](https://github.com/NicolasSancho/Storybook-core)).

The goal is to show the design system working in a real app: Server Components by default, client
code only where interaction needs it, and no design-system code copied into the app.

> Work in progress. The home page, the product listing (with category and search filters) and the
> product pages are built. Loading and error states and the cart (Server Actions) are next.

## Routes

| Route              | What it shows                                                  | Rendering                                             |
| ------------------ | -------------------------------------------------------------- | ----------------------------------------------------- |
| `/`                | Hero, new arrivals, category links                             | Static page content, with the header cart streamed in |
| `/products`        | The catalog, filtered by `?category=` and `?q=`                | Static heading, the filtered results stream in        |
| `/products/[slug]` | One product: price, stock, colors, specs, breadcrumbs, JSON-LD | All 12 pages prerendered with `generateStaticParams`  |

An unknown product slug renders `not-found.tsx`. With Cache Components the first request returns
200 with `noindex` and later ones return 404, because the page shell streams before `notFound()`
runs. The catalog is fixed and nothing links to unknown slugs, so a Proxy check was not added.

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
  featured selection, the stock line, price formatting and the cart cookie parser.
- **End-to-end tests** (Playwright, Chromium) cover the home page, the product listing with its
  filters and search, the product page (details, breadcrumbs, stock states, structured data, the
  not-found page), the keyboard skip link, and an axe accessibility check of four pages at phone
  and desktop width in light and dark. Run `npm run build` first: they test the production build.
- CI runs both in two parallel jobs, `checks` and `e2e`. A failing end-to-end run uploads the
  Playwright report (with traces) as an artifact for seven days.
