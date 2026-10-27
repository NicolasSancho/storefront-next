# storefront-next

A storefront built with the Next.js App Router, TypeScript and Tailwind CSS v4. Its UI comes from
the design system `@nicolassancho/storybook-core`, installed from npm (public repo:
https://github.com/NicolasSancho/Storybook-core, Storybook: https://nicolassancho.github.io/Storybook-core/).

The project is a portfolio piece that architects will review, so every change should be
explainable: simple, idiomatic and typed end to end. The app proves the design system works in a
real product; it is not a feature-rich shop.

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
- No test tooling is set up. Do not add any unless asked.

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
  `noindex` because the shell has already streamed, and that gap is accepted and documented.
- Business rules that a page needs (`stockStatus`, `pickFeatured`, `filterProducts`) are plain
  functions in `src/lib/`. Hooks are for stateful Client Components only, so they are not used to
  split logic from Server Components.
- Structured data is a `<script type="application/ld+json">` in a server component, with `<` escaped
  as `\u003c`. Absolute URLs come from `siteUrl` in `src/lib/site.ts`.
- Define `LinkComponent`, `ImageComponent` and other injected components outside render functions.
- Type routes and props with the generated helpers (`LayoutProps`, `PageProps`).
- Accessibility is a requirement: semantic HTML, visible focus, accessible names, and a text
  contrast of at least 4.5:1 in both themes.

## Checks

Before considering a task done, run `npm run typecheck`, `npm run lint`, `npm run format:check` and
`npm run build`. CI (`.github/workflows/ci.yml`) runs the same four scripts on every pull request,
and `CI / checks` is a required status check on `main`. Keep the workflow and these scripts in
step. For UI changes, also look at the page in a browser in light and dark, and at phone width.
Server and Client behavior cannot be proved by a type check, only by a real build and run.

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
