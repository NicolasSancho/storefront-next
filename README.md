# storefront-next

A storefront built with the Next.js App Router, TypeScript and Tailwind CSS v4. Its UI comes from
[`@nicolassancho/storybook-core`](https://www.npmjs.com/package/@nicolassancho/storybook-core), a
design system I publish and document in
[Storybook](https://nicolassancho.github.io/Storybook-core/) ([source](https://github.com/NicolasSancho/Storybook-core)).

The goal is to show the design system working in a real app: Server Components by default, client
code only where interaction needs it, and no design-system code copied into the app.

> Work in progress. The app currently has a single page that renders library components from a
> Server Component. Product pages, the header and the cart are next.

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

| Command         | What it does                      |
| --------------- | --------------------------------- |
| `npm run dev`   | Development server                |
| `npm run build` | Production build                  |
| `npm start`     | Serve the production build        |
| `npm run lint`  | ESLint                            |
