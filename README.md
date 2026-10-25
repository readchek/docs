<p align="center">
  <img src="https://raw.githubusercontent.com/readchek/chek.page/main/public/assets/logos/mark.svg" alt="Chek" width="80" height="80" />
</p>

<h1 align="center">Chek Docs</h1>

<p align="center">Developer documentation for Chek, at <a href="https://docs.chek.page">docs.chek.page</a>.</p>

Guides for running your own Chek server, building on its API, writing source extensions and embedding Chek Reader, with the API reference built from the server's `openapi.yaml`.

## Run it

```sh
bun install
bun run dev        # http://localhost:4321
```

Before a pull request, run `bun run lint`, `bun run format:check`, `bun run check` and `bun run build`; CI runs them too. [AGENTS.md](AGENTS.md) covers how the site is built and how to write for it.

## Deploy

Every push to `main` publishes the site to Cloudflare at docs.chek.page through the Deploy workflow, after the same checks CI runs. It signs in with the `CLOUDFLARE_API_TOKEN` repository secret. To redeploy without a push, run the workflow from the Actions tab.

To deploy from your own machine, run `bun run deploy` after `cf auth login`.
