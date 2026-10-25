---
title: Browse Chek from an OPDS reader
description: Add Chek to Thorium, KOReader, or another OPDS 2 reader.
---

Chek serves an [OPDS 2](https://drafts.opds.io/opds-2.0) catalog. Reading apps that support OPDS 2 can browse it and download from it.

1. In the reading app, add this catalog address:

   ```
   https://chek.example.org/opds/v2/catalog
   ```

2. Sign in with a Chek name and password.

OPDS apps can't keep a session token, so they sign in with HTTP Basic credentials. If you signed up through a [sign-in provider](/self-hosting/sign-in-providers/), set a password first.

When an app connects without credentials, Chek answers `401` with two kinds of challenge. KOReader follows the Basic challenge. Thorium needs the second one, an [Authentication for OPDS](https://drafts.opds.io/authentication-for-opds-1.0) document.

## What the catalog contains

- The catalog starts with Continue reading and Recently added. Then it lists the libraries you can open.
- A library lists its series, after links to All publications and Recently added.
- A series lists its publications in reading order, 50 on each page.
- The catalog and each library have a search link.

Chek serves files and covers under `/opds/v2` too, so the app sends the same credentials for them. Publication metadata follows the Readium Web Publication model, so roles such as penciler and translator keep their own names.
