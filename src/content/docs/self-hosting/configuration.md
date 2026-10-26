---
title: Configuration
description: Every environment variable that Chek server reads.
---

Chek server reads its settings from environment variables only. Every variable is optional. If the server can't read a value, it doesn't start, and the log names the variable and the reason.

## Basics

| Variable | Default | Effect |
| --- | --- | --- |
| `CHEK_BIND` | `127.0.0.1:8080`. In the image, `0.0.0.0:8080` | The address and port to listen on |
| `CHEK_DATA_DIR` | `./data`. In the image, `/data` | The folder for the database, covers, and extensions |
| `CHEK_SCAN_WORKERS` | One less than the number of cores | The number of files that a scan reads at once |
| `CHEK_SETUP_TOKEN` | A random token, written to the log | The token that creates the first admin account. It must be 32 or more characters |
| `CHEK_WEB_DIR` | None. In the image, `/usr/share/chek/web` | The folder with the [web app's](/self-hosting/web-app/) build. The server serves it at `/`, with the admin panel at `/admin`. `CHEK_ADMIN_DIR` is its old name and still works |
| `CHEK_MAX_UPLOAD_BYTES` | `2147483648`, which is 2 GiB | The largest file that an admin can upload |

## Proxies and browsers

| Variable | Default | Effect |
| --- | --- | --- |
| `CHEK_TRUSTED_PROXIES` | None | Comma-separated addresses or CIDR ranges of your reverse proxies, such as `10.0.0.0/8`. The server reads the client address from `X-Forwarded-For` only on requests from these addresses |
| `CHEK_CLIENT_IP_HEADER` | None | A header to read the client address from, such as `CF-Connecting-IP`. The server reads it only on requests from `CHEK_TRUSTED_PROXIES` |
| `CHEK_WEB_ORIGINS` | `https://app.chek.page` | Comma-separated origins that may call the API from a browser. The web app that the server serves needs no entry |

## Sign-in

| Variable | Default | Effect |
| --- | --- | --- |
| `CHEK_PUBLIC_URL` | None | The address that people use to reach the server. Sign-in providers need it |
| `CHEK_OIDC_PROVIDERS` | None | Comma-separated ids of OpenID Connect providers, such as `authentik,google` |
| `CHEK_OIDC_REDIRECTS` | `chek://` | Comma-separated prefixes, besides `CHEK_PUBLIC_URL`, that an app may give as its redirect URI |
| `CHEK_DEMO_USERS` | None | Comma-separated names of accounts that are shared demo accounts |

### Provider settings

Each provider in `CHEK_OIDC_PROVIDERS` takes the variables below. In each name, replace `<ID>` with the provider's id in upper case, with each `-` changed to `_`.

| Variable | Default | Effect |
| --- | --- | --- |
| `CHEK_OIDC_<ID>_ISSUER` | Required | The issuer URL. It must use HTTPS, except on a loopback address |
| `CHEK_OIDC_<ID>_CLIENT_ID` | Required | The client id |
| `CHEK_OIDC_<ID>_CLIENT_SECRET` | None | The client secret. A public client has none |
| `CHEK_OIDC_<ID>_NAME` | The id | The label on the sign-in button |
| `CHEK_OIDC_<ID>_SCOPES` | `openid profile email` | The scopes to request |
| `CHEK_OIDC_<ID>_CREATE_USERS` | `false` | Whether a person with no account gets a new one |
| `CHEK_OIDC_<ID>_ADMIN_GROUPS` | None | Comma-separated groups. A new account is an admin if the person is in one of them |
| `CHEK_OIDC_<ID>_GROUPS_CLAIM` | `groups` | The claim that lists the person's groups |

## Sources and extensions

| Variable | Default | Effect |
| --- | --- | --- |
| `CHEK_SOURCE_SYNC_MINUTES` | `60` | Minutes between syncs of Komga, Kavita, and extension libraries. `0` turns off the timer |
| `CHEK_EXTENSION_IMAGE_CACHE_MB` | `2048` | The size of the disk cache for images from extensions, in MB. `0` turns off the cache |
| `CHEK_BROWSER_SOLVER_URL` | None | The address of a FlareSolverr-compatible service |
| `CHEK_BROWSER_EXECUTABLE` | None. In `-browser` images, `/usr/bin/chromium` | The absolute path to Chromium |
| `CHEK_BROWSER_NATIVE` | `false`. In `-browser` images, `true` | Whether Chromium makes its own connections through a restricted proxy |
| `CHEK_BROWSER_ARGS` | `["--headless=new"]` | Chromium launch arguments, as a JSON array |
| `CHEK_OUTBOUND_PROXY_URL` | None | The address of an HTTP CONNECT proxy for all extension traffic |
| `CHEK_OUTBOUND_PROXY_USERNAME` | None | The proxy's user name. Set it with `CHEK_OUTBOUND_PROXY_PASSWORD` |
| `CHEK_OUTBOUND_PROXY_PASSWORD` | None | The proxy's password. Set it with `CHEK_OUTBOUND_PROXY_USERNAME` |

## Logs

| Variable | Default | Effect |
| --- | --- | --- |
| `RUST_LOG` | `info` | The log level, such as `debug` or `warn` |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | None | The OpenTelemetry collector that receives logs and traces over OTLP/HTTP. The other standard `OTEL_*` variables apply too |
