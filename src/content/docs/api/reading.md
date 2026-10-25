---
title: Read and sync
description: Walk a library, fetch pages and files, and keep a reading position in step across devices.
---

This walks through what a reading client does, using `curl`. Every request sends `Authorization: Bearer $TOKEN`; it's left out below for brevity.

## Find something to read

```sh
GET /api/v1/libraries                         # the libraries you can open
GET /api/v1/libraries/{libraryId}/series      # a library's series, in title order
GET /api/v1/series/{seriesId}/publications    # a series' publications, in reading order
GET /api/v1/me/continue-reading               # started and not finished, newest first
GET /api/v1/recently-added                    # newest first
GET /api/v1/search?q=saga                     # titles, series, contributors and publishers
```

Each publication has a `format`. Comic archives (`cbz`, `cbr`, `cb7`, `cbt`) and extension chapters (`remote`) are read a page at a time. Everything else is read as a whole file. Pick how to open a publication from `format`, never from a URL or file name.

`available: false` means the file has gone from disk or its source. It keeps its reading position in case it comes back.

## Comics: pages

```sh
GET /api/v1/publications/{publicationId}/pages
```

```json
{ "items": [{ "index": 0, "mediaType": "image/jpeg", "size": 412331 }, ...] }
```

Then fetch each page by its zero-based index. The bytes are the original image, unchanged.

```sh
GET /api/v1/publications/{publicationId}/pages/0
```

## Books: the file

```sh
GET /api/v1/publications/{publicationId}/file
```

The file is sent as it is on disk, with `Range` support, so a reader can open a large EPUB or PDF without downloading all of it first. Keep the `ETag` and send it as `If-None-Match` to check a downloaded copy is still current.

Covers come from `GET /api/v1/publications/{publicationId}/cover` as JPEG thumbnails up to 400 by 600 pixels. `hasCover` says whether there is one.

## Positions

A reading position is a [Readium Locator](https://readium.org/architecture/models/locators/), stored as you send it, up to 16 KiB. [Chek Reader](https://github.com/readchek/chek-reader) and Readium's toolkits produce them as they are.

```sh
GET /api/v1/publications/{publicationId}/progress
```

```json
{ "revision": 4, "locator": { "href": "chapter3.xhtml", "type": "application/xhtml+xml", "locations": { "totalProgression": 0.31 } }, "device": "iPad", "updatedAt": "2026-10-25T09:12:00Z" }
```

Revision `0` with a `null` locator means nothing is saved yet.

To save, send the revision you last read:

```sh
PUT /api/v1/publications/{publicationId}/progress
{ "expectedRevision": 4, "locator": { ... } }
```

If another device saved since, the answer is `409 progress_conflict` with that device's position in `current`:

```json
{ "code": "progress_conflict", "message": "…", "current": { "revision": 5, "locator": { ... }, "device": "iPhone" } }
```

Ask the reader which position to keep, then save again with `expectedRevision` set to `current.revision`. The server never decides for them, because going back to reread something is as deliberate as reading on.

A `totalProgression` of 1 marks a publication finished, which takes it off Continue reading.

## Bookmarks and highlights

```sh
GET  /api/v1/publications/{publicationId}/annotations
POST /api/v1/publications/{publicationId}/annotations
{ "kind": "highlight", "locator": { ..., "text": { "highlight": "the words" } }, "color": "yellow", "note": "…" }
```

Change one with `PATCH /api/v1/annotations/{annotationId}` and remove it with `DELETE`. The last save wins. Fetch the whole list when opening a publication, so deletions made on another device show up. A publication holds up to 5,000 annotations per person.
