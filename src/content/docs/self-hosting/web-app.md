---
title: Read in a browser
description: Open the Chek web app that your server serves, or use app.chek.page with a server that has an HTTPS address.
---

The Chek web app reads the libraries on your server in a browser. It runs in two places:

- Your server serves it at `/`, with the admin panel at `/admin`. It connects only to that server.
- [app.chek.page](https://app.chek.page) serves the same app. It connects to any server with an HTTPS address, and it can sign in to more than one server.

## Open the app on your server

Open the server's address in a browser, such as `http://192.168.1.20:8080/` or `https://chek.example.org/`. Sign in with your Chek name and password.

The Docker image includes the app, so this works on plain HTTP too. A server on your home network needs no HTTPS address for it.

If you sign in to Chek with a [sign-in provider](/self-hosting/sign-in-providers/), set a password in the Chek app first. The web app signs in only with a name and password.

## Use app.chek.page

1. Check that the server has an HTTPS address. A page on HTTPS can't call a server on plain HTTP, so app.chek.page can't reach a server at an address such as `http://192.168.1.20:8080`.
2. Open [app.chek.page](https://app.chek.page).
3. Enter the server's address in **Server address**, and sign in.

To add another server, open **Settings** and click **Add a server**.

The server answers browser requests only from the origins in `CHEK_WEB_ORIGINS`. The default is `https://app.chek.page`, so you change it only if you host the web app at another address. The app on your own server calls its own origin, so it needs no entry in `CHEK_WEB_ORIGINS`.

## Run the app from a source build

The server serves the app only when `CHEK_WEB_DIR` points at the app's build. The image sets it. To build the app for a server that you run from source:

1. Clone [readchek/app](https://github.com/readchek/app).
2. In its `web` folder, run `bun install`, and then `bun run build:server`.
3. Set `CHEK_WEB_DIR` to the `dist-server` folder that the build makes, and start the server.

Without `CHEK_WEB_DIR`, the server serves only the API and OPDS, and `/admin` answers `404`.
