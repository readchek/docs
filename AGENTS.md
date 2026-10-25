# AGENTS.md

Guidance for anyone changing this repository, human or agent. Read it before writing.

## What this is

The public developer documentation for Chek, served at docs.chek.page. It's for people who self-host Chek server, build on its API, write source extensions, or embed Chek Reader. Product direction lives in [readchek/chek's docs/product.md](https://github.com/readchek/chek/blob/main/docs/product.md); the marketing site is [readchek/chek.page](https://github.com/readchek/chek.page).

## Decisions already made

- **Astro Starlight**, built with Bun and deployed to Cloudflare as static files, like chek.page. Pages are Markdown or MDX in `src/content/docs`. Starlight ships no client framework; if a page ever needs an interactive component, write it in SolidJS through `@astrojs/solid-js`, never React or Vue.
- **Sources of truth stay in their repositories.** The API reference is built by `starlight-openapi` from `openapi.yaml` at the chek release named by `chekRelease` in `astro.config.ts`. Don't copy the spec here. Raise `chekRelease` when the guides have caught up with a new release.
- **Describe what's released.** Pages describe what the release in `chekRelease` does, not what's planned or only on `main`.
- **Public only.** Nothing here names private infrastructure, private repositories or anyone's credentials. Design decisions and internal deploys stay in their own repositories' `docs/`.
- **Brand.** Colors and fonts come from chek.page's tokens, set as Starlight variables in `src/styles/brand.css`. Fonts are served from the site, so the page never calls another origin.

## Layout

| Path | Contents |
| --- | --- |
| `src/content/docs/get-started` | What Chek is and the quick start |
| `src/content/docs/self-hosting` | Installing, configuring and running Chek server |
| `src/content/docs/api` | API guides. The reference under `/api/reference` is generated |
| `astro.config.ts` | Site config, sidebar and the pinned chek release |
| `scripts/cloudflare.ts` | Turns the static build into Cloudflare's prebuilt output |

## Build

```sh
bun install
bun run dev          # http://localhost:4321
bun run lint && bun run format:check && bun run check && bun run build
```

The build fetches `openapi.yaml` from GitHub, so it needs network. `bun run deploy` builds and publishes to Cloudflare, after `cf auth login`.

## Writing

- Write for someone who has never seen Chek: what to do, in order, with commands that work when pasted. Explain why only where it changes what they do.
- Check every setting, endpoint and default against the code or `openapi.yaml` at `chekRelease` before writing it down.
- Short sentences, active voice, second person. Sentence case for titles. Be exact: real variable names, real error codes.
- Every page has a `description` in its front matter, used for search and link previews.
- Link between pages with root-relative paths ending in `/`, such as `/self-hosting/install/`.

## Pull requests

- Branch from `main`, keep each PR to one change, and merge by squash.
- Fill in the PR template with "Before", "After" and "How" in plain language.
- When a change in chek, chek-reader or app alters something these pages describe, open a PR here too.
