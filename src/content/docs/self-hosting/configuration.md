---
title: Configuration
description: Every environment variable Chek server reads.
---

Chek server is configured only with environment variables, and all of them are optional. A value it can't read stops the server at startup with the variable's name and the reason, so a typo never runs with a default you didn't mean.

## Basics

| Variable | Default | What it does |
| --- | --- | --- |
| `CHEK_BIND` | `127.0.0.1:8080`, or `0.0.0.0:8080` in the image | Address and port to listen on |
| `CHEK_DATA_DIR` | `./data`, or `/data` in the image | Where the database, covers and extensions live |
| `CHEK_SCAN_WORKERS` | cores − 1 | How many files a scan reads at once. Scanning on every core slows down pages for readers |
| `CHEK_SETUP_TOKEN` | logged at start | Your own [setup token](/self-hosting/first-steps/#create-the-admin), 32 characters or more, so you don't need the log |
| `CHEK_MAX_UPLOAD_BYTES` | `2147483648` (2 GiB) | Largest file an admin can [upload](/self-hosting/uploads/) |

## Behind a proxy

See [HTTPS and reverse proxies](/self-hosting/reverse-proxy/).

| Variable | Default | What it does |
| --- | --- | --- |
| `CHEK_TRUSTED_PROXIES` | none | Your proxy's addresses or CIDR ranges, comma-separated, such as `10.0.0.0/8`. Client addresses are read from `X-Forwarded-For` only on requests from these |
| `CHEK_CLIENT_IP_HEADER` | none | A header to read the client address from instead, such as `CF-Connecting-IP` behind Cloudflare |
| `CHEK_WEB_ORIGINS` | `https://app.chek.page` | Comma-separated origins allowed to call the API from a browser. Add yours if you host a web client |

## Sign-in

See [Sign-in providers](/self-hosting/sign-in-providers/).

| Variable | Default | What it does |
| --- | --- | --- |
| `CHEK_PUBLIC_URL` | none | The address people reach the server at. Needed for sign-in providers |
| `CHEK_OIDC_PROVIDERS` | none | Comma-separated provider ids, such as `authentik,google` |
| `CHEK_OIDC_<ID>_*` | | Each provider's settings |
| `CHEK_OIDC_REDIRECTS` | `chek://` | Comma-separated prefixes, besides the public URL, that apps may ask to be sent back to |
| `CHEK_DEMO_USERS` | none | Comma-separated account names to treat as shared [demo accounts](/self-hosting/users/#demo-accounts) |

## Sources and extensions

See [Komga and Kavita](/self-hosting/komga-and-kavita/) and [Extensions](/self-hosting/extensions/).

| Variable | Default | What it does |
| --- | --- | --- |
| `CHEK_SOURCE_SYNC_MINUTES` | `60` | How often Komga, Kavita and extension libraries sync. `0` turns the timer off |
| `CHEK_EXTENSION_IMAGE_CACHE_MB` | `2048` | Disk cache for covers and pages from extensions. `0` turns it off |
| `CHEK_BROWSER_SOLVER_URL` | none | A FlareSolverr-compatible service, for sites behind a challenge |
| `CHEK_BROWSER_EXECUTABLE` | none, set in `-browser` images | Absolute path to Chromium, for extensions that drive interactive pages |
| `CHEK_BROWSER_NATIVE` | `false`, `true` in `-browser` images | Lets Chromium make its own connections through a restricted proxy |
| `CHEK_BROWSER_ARGS` | `["--headless=new"]` | Chromium launch arguments, as a JSON array |
| `CHEK_OUTBOUND_PROXY_URL` | none | An HTTP CONNECT proxy for all extension traffic |
| `CHEK_OUTBOUND_PROXY_USERNAME`, `CHEK_OUTBOUND_PROXY_PASSWORD` | none | The proxy's credentials, set together |

## Logs

See [Logs and tracing](/self-hosting/logs/).

| Variable | What it does |
| --- | --- |
| `RUST_LOG` | Log level, such as `info` or `debug` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Sends logs and traces to an OpenTelemetry collector over OTLP/HTTP. The standard `OTEL_*` variables apply |
