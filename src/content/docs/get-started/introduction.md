---
title: What Chek is
description: About the Chek app, Chek server, extensions, and Chek Reader, and how they fit together.
---

Chek is a reader for books and comics. It has five parts. You need only the parts that match what you want to do.

| Part | What it does | Repository |
| --- | --- | --- |
| Chek app | Reads books and comics on iPhone and iPad. It opens files on the device with no account, and it connects to Chek servers. It's free on the [App Store](https://apps.apple.com/us/app/chek-books-comics/id6761271144). | [readchek/app](https://github.com/readchek/app) |
| Chek web app | Reads your server's libraries in a browser, and runs the admin panel that sets up and manages a server. Your server serves it, and so does [app.chek.page](https://app.chek.page). | [readchek/app](https://github.com/readchek/app/tree/main/web) |
| Chek server | Serves a library that you host yourself. It scans folders, reads Komga and Kavita servers, runs source extensions, syncs reading positions, and serves an OPDS 2 catalog. It's written in Rust. | [readchek/chek](https://github.com/readchek/chek) |
| Extensions | Add sources that the server reads series from. Each extension is a WebAssembly component that the server installs from an extension repository. | [readchek/extensions](https://github.com/readchek/extensions) |
| Chek Reader | Opens, lays out, and pages publications in the app. It's a Swift package with no Chek-specific code, so any Apple app can use it. | [readchek/chek-reader](https://github.com/readchek/chek-reader) |

## The server is optional

The app reads files on the device without a server. A server adds three things. Your library is the same on every device. Reading positions, bookmarks, and highlights sync between devices. And the app can read from Komga, Kavita, and extensions through the server.

## Pick your path

- To run your own library server, start with the [quick start](/get-started/quick-start/). Then [install the server](/self-hosting/install/) behind HTTPS.
- To read your server's libraries in a browser, read [Read in a browser](/self-hosting/web-app/).
- To build a client, a script, or an integration, read the [API overview](/api/overview/) and the [API reference](/api/reference/).
- To browse Chek from an OPDS reader, read [Browse Chek from an OPDS reader](/self-hosting/opds/).
- To write a source, read the [extension README](https://github.com/readchek/chek/blob/main/extensions/README.md). It covers the `chek ext` command.
- To add a reader to your own Swift app, read [the Chek Reader README](https://github.com/readchek/chek-reader#readme).
