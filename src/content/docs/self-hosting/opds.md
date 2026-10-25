---
title: OPDS
description: Browse and read Chek from OPDS 2 apps such as Thorium and KOReader.
---

Chek serves an [OPDS 2](https://drafts.opds.io/opds-2.0) catalog, so reading apps that speak OPDS can browse and download from it.

```
https://chek.example.org/opds/v2/catalog
```

Sign in with a Chek name and password. OPDS apps can't hold session tokens, so they send HTTP Basic credentials. When they don't, the catalog answers `401` with both a Basic challenge, which KOReader follows, and an [Authentication for OPDS](https://drafts.opds.io/authentication-for-opds-1.0) document, which Thorium needs. People who sign in only through a [provider](/self-hosting/sign-in-providers/) need to set a password first.

## What's in it

- **The catalog** leads with Continue reading and Recently added, then lists the libraries you may open.
- **A library** lists its series, after links to All publications and Recently added.
- **A series** lists its publications in reading order, 50 to a page.
- **Search** is offered for the whole catalog and for each library.

Files and covers are served under `/opds/v2` too, so apps send the same credentials they used for the catalog. Publication metadata follows the Readium Web Publication model, so roles such as penciler and translator keep their own names.
