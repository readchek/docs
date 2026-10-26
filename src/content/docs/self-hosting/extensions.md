---
title: Run extensions
description: Add extension repositories, turn extensions into libraries, and set up challenge solving and an outbound proxy.
---

An extension is a source that the server reads series from, such as a webcomic's site or a library of public-domain books. Each extension is a WebAssembly component. The server runs it in a sandbox with no file access and no network access except to the sites that the extension declares.

This page is about running extensions on your server. To write one, read the [extension README](https://github.com/readchek/chek/blob/main/extensions/README.md).

Most people manage repositories and installs in the Chek app, so they never call the endpoints on this page. Admins manage server-wide repositories in the admin panel, under **Extensions**.

## Add an extension repository

A repository is an `index.json` file and the components that it lists, served over HTTPS. There are two kinds:

- A server-wide repository belongs to the admins, and every user sees it. A new server starts with the official repository, `https://chek.page/extensions/index.json`. An admin can remove it.
- A personal repository belongs to one user, and only that user sees it.

By default, only admins can add repositories. To let every user add personal repositories, turn on **Let people add any repository** under **Extensions** in the admin panel. With the API, turn on `allowAnyRepository`:

```sh
curl -X PUT $SERVER/api/v1/settings \
	-H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
	-d '{"allowAnyRepository": true}'
```

If you turn the setting off again, the server keeps the personal repositories. It doesn't install or run anything from them.

The server reads every repository's index every six hours, so new versions appear as updates. A private repository takes a bearer token, a user name and password, or a header. The server sends them only to the repository's own origin and never returns them from the API.

## Install an extension

Each user installs extensions for themselves. When a user installs one, the server does these checks:

1. It downloads the component and checks its SHA-256 digest against the index.
2. It checks that the component declares the same id, version, sites, and capabilities as the index.

Because of the second check, a repository can't list one extension and ship another. The server stores components in the data folder under `extensions/`. Users on the same version share one copy.

## Turn an extension into a library

An admin can make a library from an extension that the admin installed. An admin grants the library to readers like any other library.

- The library starts empty. It holds only the series that an admin follows into it.
- It syncs on the same schedule as [Komga and Kavita libraries](/self-hosting/komga-and-kavita/#sync-a-library).
- It runs on the admin's install, so readers don't need the extension.
- If the admin uninstalls the extension, the library answers `source_unavailable` until the admin installs it again.

## Choose content ratings

Each person chooses the content ratings they see. The ratings are Safe, Suggestive, Erotica, and Pornographic. The server passes the choice to the extension's search. Then it removes any result that the extension rated outside the choice, so a source that ignores the choice can't show those results.

Until a person chooses, the person sees Safe and Suggestive. Demo accounts always see Safe and Suggestive.

In the iOS app, a person can only narrow the choice. To turn on Erotica and Pornographic, the person confirms their age in the web app at [app.chek.page](https://app.chek.page).

## Size the image cache

The server fetches covers and pages from extensions. The app never contacts an extension's sites. The server keeps the images on disk in `extensions/images` in the data folder.

`CHEK_EXTENSION_IMAGE_CACHE_MB` sets the size of that folder. The default is 2048. When the folder is full, the server deletes the images that were read least recently. A value of `0` turns off the cache.

## Let extensions get past site challenges

Some sites show a browser challenge before their pages. An extension that declares the `browser` capability can get past a challenge in two ways. The admin sets up both.

To use a solver, set `CHEK_BROWSER_SOLVER_URL` to a [FlareSolverr](https://github.com/FlareSolverr/FlareSolverr)-compatible service:

```sh
CHEK_BROWSER_SOLVER_URL=http://flaresolverr:8191/v1
```

When a request meets a challenge, the server asks the solver to load the page. It keeps the cookies that the solver earned and tries the request once more.

To run a browser in the server, use a `-browser` image and give the container 1 GB of shared memory with `shm_size: 1gb`. These images include Chromium, for extensions that use interactive pages. Chromium's own sandbox is off in these images, so run only extensions that you trust.

A signed-in user can also complete a site's checkbox challenge by hand. The user opens `/verify` on the server and picks an installed source. The server keeps the cookies in the data folder until the site expires them.

## Send extension traffic through a proxy

To send all extension traffic through one HTTP CONNECT proxy, set these variables:

```sh
CHEK_OUTBOUND_PROXY_URL=http://proxy.internal:8888
CHEK_OUTBOUND_PROXY_USERNAME=<name>
CHEK_OUTBOUND_PROXY_PASSWORD=<password>
```

- The proxy must be an HTTP CONNECT proxy. SOCKS proxies and HTTPS proxy endpoints don't work.
- Put the credentials in their own variables, not in the URL.
- The proxy carries source requests, images, and browser traffic. Repository downloads, sign-in providers, and telemetry connect directly.
- If the proxy fails, the requests fail. The server never falls back to a direct connection.
- The proxy resolves the host names that sources ask for. Run it where it can't reach your private network.

Without these variables, sources connect directly. They ignore `HTTP_PROXY` and `HTTPS_PROXY`.
