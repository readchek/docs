---
title: What Chek is
description: The app, the server, the extensions and the reading engine, and how they fit together.
---

Chek is a reader for books and comics wherever they're kept. It's made of a few pieces, and you only need the ones that fit what you're doing.

| Piece | What it is | Where it lives |
| --- | --- | --- |
| **Chek app** | The reader for iPhone and iPad, free on the [App Store](https://apps.apple.com/us/app/chek-books-comics/id6761271144). It reads your own files with no account, and connects to a Chek server. | [readchek/app](https://github.com/readchek/app) |
| **Chek web app** | Account and content settings at [app.chek.page](https://app.chek.page), talking to your server from the browser. | [readchek/app](https://github.com/readchek/app/tree/main/web) |
| **Chek server** | An open-source, self-hosted library server written in Rust. It scans folders, reads Komga and Kavita libraries, runs source extensions, syncs reading positions and speaks OPDS 2. | [readchek/chek](https://github.com/readchek/chek) |
| **Extensions** | Sources the server reads series from, built as WebAssembly components and installed from extension repositories. | [readchek/extensions](https://github.com/readchek/extensions) |
| **Chek Reader** | The Swift package that opens, lays out and pages publications in the app. It has no Chek-specific code, so any Apple app can use it. | [readchek/chek-reader](https://github.com/readchek/chek-reader) |

The server is optional. The app reads files on the device without it. A server adds a library that follows you between devices, positions and highlights that sync, and sources from Komga, Kavita and extensions.

## Pick your path

- **I want my own library server.** Start with the [quick start](/get-started/quick-start/), then [install it properly](/self-hosting/install/) behind HTTPS.
- **I want to build a client, script or integration.** Read the [API overview](/api/overview/) and the [API reference](/api/reference/).
- **I want my OPDS reader to browse Chek.** See [OPDS](/self-hosting/opds/).
- **I want to write a source.** The [extension guide](https://github.com/readchek/chek/blob/main/extensions/README.md) covers `chek ext` until its pages land here.
- **I want a reader in my own Swift app.** See [Chek Reader's README](https://github.com/readchek/chek-reader#readme) until its pages land here.
