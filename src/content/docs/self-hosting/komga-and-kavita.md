---
title: Komga and Kavita
description: Read a Komga or Kavita server's libraries through Chek, with progress written back.
---

An admin can add a [Komga](https://komga.org) or [Kavita](https://www.kavitareader.com) server as a library. Everyone granted that library in Chek reads what one Komga or Kavita account sees, with pages and files fetched through Chek, so Komga or Kavita keeps the only copy.

Use an account made for Chek. Its credentials are checked before the library is added, stored on the server, and never returned by the API.

## Komga

The account needs Komga's **page streaming** and **file download** roles. Use an API key made in Komga for that account, or its email and password.

```sh
curl -X POST $SERVER/api/v1/libraries \
  -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"name": "Komga", "komga": {"url": "http://komga:25600", "apiKey": "<key>"}}'
```

| Field | What it does |
| --- | --- |
| `url` | Komga's address, including any path it's served under |
| `apiKey`, or `username` and `password` | The account to read with |
| `libraryIds` | Komga library ids to read. Leave it out for every library the account sees |
| `writeProgress` | `true` by default. Writes your reading position back to Komga |

A sync reads the series and the books Komga has finished analyzing, with their titles, numbers, summaries, dates, authors, publisher, language and reading direction. Komga always sends whole files, even when asked for part of one.

## Kavita

The account needs Kavita's **download** role for files. Copy its API key from the account's settings page in Kavita.

```sh
curl -X POST $SERVER/api/v1/libraries \
  -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"name": "Kavita", "kavita": {"url": "http://kavita:5000", "apiKey": "<key>"}}'
```

The fields are the same as Komga's, except that Kavita takes only an API key and its `libraryIds` are numbers.

Each Kavita chapter becomes one publication. A file that's a whole volume is called "Volume 1", a loose chapter "Chapter 12", and a special by its name, unless the file's own metadata gives a title.

## Syncing

Komga and Kavita can't tell Chek when something changes, so Chek syncs them:

- when the server starts,
- every `CHEK_SOURCE_SYNC_MINUTES`, 60 by default, or never with `0`,
- and when an admin asks, with `POST /api/v1/libraries/{libraryId}/scan`.

A book is read again only when it, its file or its series changed. Books that disappear are marked unavailable, not deleted, so reading positions survive if they come back. Progress, bookmarks, highlights and an admin's metadata edits are kept in Chek and survive syncs.

## Progress written back

The admin who adds the library has their progress written back to the Komga or Kavita account, so its own apps resume where Chek left off. Only that one person is written back, because everyone reading the library shares the one account. Send `"writeProgress": false` to turn it off.

- **Komga:** EPUB positions go as Readium locators, and comics and PDFs as a page number.
- **Kavita:** comics and PDFs go as a page number. Kavita keeps a book's place in a form a Readium locator can't name, so a book is written back only once it's finished.

Reaching the last page marks a book read. A write that Komga or Kavita refuses is logged, not retried.
