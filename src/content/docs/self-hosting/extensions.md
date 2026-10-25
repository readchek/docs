---
title: Extensions on your server
description: Repositories, installs, extension libraries, content ratings and sites behind a challenge.
---

Extensions are sources the server reads series from, such as a webcomic's site or a public-domain library. Each one is a WebAssembly component that runs in a sandbox inside the server, with no files and no network except the sites it declares. This page covers running them. Writing one is covered in the [extension guide](https://github.com/readchek/chek/blob/main/extensions/README.md) until its pages land here.

## Repositories

Extensions are installed from repositories: an `index.json` and the components it lists, served over HTTPS.

- **Server-wide repositories** are the admin's allow list, and everyone sees them. A new server starts with the official one, `https://chek.page/extensions/index.json`, which an admin can remove.
- **Personal repositories** are added by people other than admins, and only they see them. This is off until an admin turns on `allowAnyRepository`:

  ```sh
  curl -X PUT $SERVER/api/v1/settings \
    -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
    -d '{"allowAnyRepository": true}'
  ```

  Turning it off again keeps those repositories but nothing is installed or run from them.

The server reads every index again every six hours, so new versions show up as updates. Private repositories take a bearer token, a username and password, or a header, which are sent only to the repository's own origin and never returned by the API.

The Chek app manages repositories and installs, so most people never call these endpoints themselves.

## Installs

Everyone installs extensions for themselves. Installing downloads the component, checks its SHA-256 digest, and checks that it declares the same id, version, sites and capabilities as the index, so a repository can't list one thing and ship another. Components are kept in the data folder under `extensions/`, shared by everyone on the same version.

## Extension libraries

An admin can turn an extension they installed into a library that readers are granted like any other. It starts empty and holds only the series an admin follows into it, synced on the same schedule as [Komga and Kavita](/self-hosting/komga-and-kavita/#syncing). It runs on that admin's install, so readers don't need the extension. If the admin uninstalls it, the library answers `source_unavailable` until it's installed again.

## Content ratings

Each person chooses which content ratings they see, from Safe and Suggestive through Erotica and Pornographic. Search passes the choice to the extension and drops results rated outside it, so a source that ignores the choice still can't show them. Until someone chooses, and always on demo accounts, they see Safe and Suggestive.

The iOS app only narrows the choice. Erotica and Pornographic are turned on in the web app at [app.chek.page](https://app.chek.page), after the person confirms they're an adult.

## Images

Covers and pages from extensions are fetched by the server, never by the app, and kept on disk in `extensions/images` in the data folder. `CHEK_EXTENSION_IMAGE_CACHE_MB` caps it, 2048 by default; the least recently read images go first. `0` turns the cache off.

## Sites behind a challenge

Some sites put a browser challenge in front of their pages. Extensions that declare the `browser` capability can get past one in two ways, and both are the admin's to set up.

- **A solver.** Point `CHEK_BROWSER_SOLVER_URL` at a [FlareSolverr](https://github.com/FlareSolverr/FlareSolverr)-compatible service, such as `http://flaresolverr:8191/v1`. When a request meets a challenge, the server has the solver load the page, keeps the cookies it earned and retries once.
- **A browser in the server.** The `-browser` images include Chromium, for extensions that drive interactive pages. Give the container `shm_size: 1gb`. Chromium's own sandbox is turned off for container compatibility, so run only extensions you trust with these images.

A signed-in person can open `/verify` on the server to complete a site's checkbox challenge themselves for an installed source. The cookies are kept in the data folder until the site expires them.

## Outbound proxy

To send all extension traffic through one HTTP CONNECT proxy:

```sh
CHEK_OUTBOUND_PROXY_URL=http://proxy.internal:8888
CHEK_OUTBOUND_PROXY_USERNAME=<name>
CHEK_OUTBOUND_PROXY_PASSWORD=<password>
```

- Only HTTP CONNECT proxies work, not SOCKS or HTTPS proxy endpoints. Keep credentials in their own variables, not in the URL.
- It covers source requests, images and browser traffic. Repository downloads, sign-in providers and telemetry connect directly.
- If the proxy fails, requests fail. They never fall back to a direct connection.
- Run the proxy where it can't reach your private network, since it resolves the names sources ask for.
- Without it, sources connect directly and ignore `HTTP_PROXY` and `HTTPS_PROXY`.
