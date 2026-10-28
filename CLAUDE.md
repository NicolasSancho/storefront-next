# storefront-next

A storefront built with the Next.js App Router, TypeScript and Tailwind CSS v4. Its UI comes from
the design system `@nicolassancho/storybook-core`, installed from npm (public repo:
https://github.com/NicolasSancho/Storybook-core, Storybook: https://nicolassancho.github.io/Storybook-core/).

Every change should be explainable: simple, idiomatic and typed end to end. The app shows the
design system working in a real product; it is not a feature-rich shop.

## Working rules

- Read this file before making changes. Read `AGENTS.md` too: Next.js 16 differs from older
  versions, so read the matching guide in `node_modules/next/dist/docs/` before writing Next code.
- Discuss before acting. Propose a spec for each step and wait for approval.
- Do not change architecture, conventions or tooling unless asked. If a step conflicts with this
  file, explain the conflict first and update this file in the same pass.
- Explain Next-specific decisions (Server and Client boundaries, caching, routing) in the PR or
  commit body, not only in the code.
- Never edit `.next/` or `node_modules/`.

## Stack

- Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript strict, Tailwind v4, ESLint
  (`next/core-web-vitals` and the TypeScript rules). Code lives in `src/`, alias `@/*`.
- Cache Components and partial prefetching are on in `next.config.ts`. Dynamic data goes behind
  `<Suspense>`, and caching is opt-in with `"use cache"`. Do not turn them off without asking.
- Fonts: `next/font` loads Hanken Grotesk (`--font-body`) and Bricolage Grotesque
  (`--font-heading`) in `src/app/layout.tsx`. `@theme inline` in `globals.css` maps them to the
  library's `--font-sans` and `--font-display`.
- Prettier formats everything (`.prettierrc`: double quotes, semicolons, 100 columns, ES5 trailing
  commas, the same as the design system). Run `npm run format` before committing. ESLint has no
  formatting rules, so the two do not conflict.
- Tests: Vitest for unit tests and Playwright (Chromium) for end-to-end tests, see "Testing" below.

## Using the design system

- Never fork or copy library code into the app. Change the library first, release it, then update
  the dependency here (use `npm link` only to try an unreleased change).
- `src/app/globals.css` imports Tailwind, then the library's `theme.css`, then `@source` for the
  library's `dist`. Keep that order.
- Use the library's tokens and components, not raw values: `bg-surface`, `text-neutral-900`,
  `bg-primary text-on-primary`, the closed type scale (`text-xs` to `text-4xl`). No `bg-white`,
  `text-white`, `gray-*`, arbitrary `text-[..px]` sizes or `dark:` classes. Dark mode follows the
  OS and is handled by the tokens. If a design needs a token that does not exist, ask: it is a
  library change.
- Headings use `font-display` (in `Text`, `font="display"`), body text uses `font-sans`.
- Library components are stateless and have no `"use client"`, so they render from Server
  Components. Pass `next/link` as `LinkComponent` and `next/image` as `ImageComponent`.
- Server Components cannot pass functions. Put anything that needs an event handler (for example
  `RadioGroup`, `SearchInput`) in a small `"use client"` file next to where it is used, and keep
  that file as low in the tree as possible. Tested: handing `onChange` to `RadioGroup` from a
  Server Component fails the build.

## Next.js rules

- Server Components by default. `"use client"` only for state, effects, browser APIs or event
  handlers, and only at the leaf.
- `"use cache"` goes on functions whose arguments come from a bounded set (none, or a slug). The
  arguments are part of the cache key, so never pass user input such as `searchParams` into a
  cached function: cache the collection and filter outside it (`filterProducts`).
- `searchParams` is request-time data. A page reads it only inside a `<Suspense>` boundary (the
  page passes the promise down and a child awaits it), so the rest of the page stays static.
- Dynamic routes declare their pages with `generateStaticParams` (it must return at least one
  value with Cache Components) and await `params`. `dynamicParams = false` is not allowed with
  Cache Components. An unknown slug calls `notFound()`; the first request returns 200 with
  `noindex` because the shell has already streamed, and that gap is known and documented.
- Business rules that a page needs (`stockStatus`, `pickFeatured`, `filterProducts`) are plain
  functions in `src/lib/`. Hooks are for stateful Client Components only, so they are not used to
  split logic from Server Components.
- Structured data is a `<script type="application/ld+json">` in a server component, with `<` escaped
  as `\u003c`. Absolute URLs come from `siteUrl` in `src/lib/site.ts`.
- Mutations are Server Actions in `src/lib/*-actions.ts` (`"use server"`). An action is a public
  POST endpoint: validate every field (the product, the option and the quantity against the
  catalog), never read a price from the request, and return only what the UI renders. The cart is
  the `cart` cookie, written with `httpOnly`, `sameSite: "lax"` and `secure` in production.
- React resets a form after its action. A control the user chose (the color) must come back from the
  action's state as the new `defaultValue`, or it jumps back to the first option.
- The only client component is `add-to-cart-form.tsx` (`useActionState` for the pending state and the
  announced message). It is there for feedback; a plain form would work without it. Add another only
  for state, effects or handlers.
- Content behind `<Suspense>` (the cart lines, the filtered results, the header count) is in the
  HTML but stays hidden until JavaScript runs. The add-to-cart form works without JavaScript, but the
  page that shows the result does not. This is a known trade-off of the static shell.
- `src/app/not-found.tsx` is the branded 404 for unknown URLs, `error.tsx` is the boundary inside the
  layout (header and footer stay) and `global-error.tsx` replaces the layout if it fails, so it
  renders its own `<html>` and `<body>`. In 16.4 the error components receive `{ error, retry }`:
  call `retry()`, not the older `reset()`. There is no `loading.tsx`: every dynamic part already
  has its own `<Suspense>` fallback, and a route-level one would wrap the whole page in a single
  boundary and fight the static shell.
- Define `LinkComponent`, `ImageComponent` and other injected components outside render functions.
- Type routes and props with the generated helpers (`LayoutProps`, `PageProps`).
- Accessibility is a requirement: semantic HTML, visible focus, accessible names, and a text
  contrast of at least 4.5:1 in both themes.

## Checks

Before considering a task done, run `npm run typecheck`, `npm run lint`, `npm run format:check`,
`npm test`, `npm run build` and `npm run test:e2e` (it needs the build). CI
(`.github/workflows/ci.yml`) runs the same scripts on every pull request in two jobs: `checks`
(typecheck, lint, format, unit tests, build) and `e2e` (build, Chromium, end-to-end tests). Both
are required status checks on `main`. Keep the workflow and these scripts in step. For UI
changes, also look at the page in a browser in light and dark, and at phone width. Server and
Client behavior cannot be proved by a type check, only by a real build and run.

## Testing

- Unit tests (`*.test.ts` next to the code, Vitest, node environment) cover pure functions in
  `src/lib`. Async Server Components are not supported by Vitest, so pages and flows are covered by
  Playwright specs in `e2e/`, which run against the production build.
- Do not mock Next. A function that needs Next's runtime (`"use cache"`, `cookies()`) is covered
  end to end. That is why the logic worth testing lives in plain functions.
- Write the expected value by hand. Never recompute it with the code under test, and no snapshots.
- Test the boundaries (0, 1, 5 and 6 units; an empty, a repeated and a too long query), not only
  the happy path.
- Every test must be able to fail: break the code under test and watch it fail before trusting it.
- In Playwright, query by role and accessible name, use web-first assertions and never
  `waitForTimeout`. Each test stands alone and does not depend on another.
- The accessibility specs check that the page has content and that axe evaluated rules, so a blank
  page cannot pass. Do not assert the status code of an unknown product (see the README).
- No coverage threshold: a percentage invites tests that exist only to raise it.

## Git

- Work on a branch from `main`: `feat/<kebab-description>` or `fix/<kebab-description>`, with
  pull requests to `main`. The first commits went straight to `main` because the repo was empty.
- One concern per commit: imperative subject of 72 characters or fewer, and a body that explains
  why when it is not obvious. Stage files by name, never `git add .`.
- Commit only when asked. A conditional request ("commit if OK") approves only the clean case: if
  you find an issue, report it and wait.
- Never push without asking, and push only after a yes. A tag push needs the same permission.
  Never delete a remote branch. Never open a pull request: draft the title and description for the
  owner to open.

## Known issues

- `npm audit` reports high-severity findings in `braces`, pulled in by `eslint-config-next`. It is
  a development-only chain, and the suggested fix downgrades Next's lint config. Re-check after
  Next patch releases instead of running `npm audit fix --force`.
