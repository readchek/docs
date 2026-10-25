---
title: Read and sync from a client
description: Find publications, fetch pages and files, and keep reading positions and annotations in step across devices.
---

This guide shows the requests that a reading client makes. Each request needs the `Authorization: Bearer <token>` header. The examples leave it out to stay short.

## Find something to read

These requests list what a person can read:

```http
GET /api/v1/libraries
GET /api/v1/libraries/{libraryId}/series
GET /api/v1/series/{seriesId}/publications
GET /api/v1/me/continue-reading
GET /api/v1/recently-added
GET /api/v1/search?q=saga
```

- A library's series come in title order. A series' publications come in reading order.
- Continue reading lists publications that the person started and didn't finish, newest first.
- Search matches titles, series names, contributors, and publishers.

## Choose how to open a publication

Each publication has a `format`. Choose the reader from `format`, never from a URL or a file name.

- For comic archives, `cbz`, `cbr`, `cb7`, and `cbt`, and for extension chapters, `remote`, fetch one page at a time.
- For every other format, fetch the whole file.

If `available` is `false`, the file is gone from disk or from its source. The server keeps its reading position in case it comes back.

## Fetch the pages of a comic

First, list the pages:

```http
GET /api/v1/publications/{publicationId}/pages
```

```json
{ "items": [{ "index": 0, "mediaType": "image/jpeg", "size": 412331 }] }
```

Then fetch each page by its index, starting at `0`. The server sends the original image bytes.

```http
GET /api/v1/publications/{publicationId}/pages/0
```

## Fetch the file of a book

```http
GET /api/v1/publications/{publicationId}/file
```

The server sends the file as it is on disk and accepts `Range` requests. A reader can open a large EPUB or PDF before the whole file arrives. Keep the `ETag`. To check that a downloaded copy is current, send the tag in `If-None-Match`.

To show a cover, fetch `GET /api/v1/publications/{publicationId}/cover` if `hasCover` is `true`. Covers are JPEG thumbnails that fit in 400 by 600 pixels.

## Get the reading position

A reading position is a [Readium Locator](https://readium.org/architecture/models/locators/). The server stores it as the client sent it, up to 16 KiB. [Chek Reader](https://github.com/readchek/chek-reader) and Readium's toolkits make locators in this form.

```http
GET /api/v1/publications/{publicationId}/progress
```

```json
{
	"revision": 4,
	"locator": {
		"href": "chapter3.xhtml",
		"type": "application/xhtml+xml",
		"locations": { "totalProgression": 0.31 }
	},
	"device": "iPad",
	"updatedAt": "2026-10-25T09:12:00Z"
}
```

If nothing is saved, `revision` is `0` and `locator` is `null`.

## Save the reading position

Send the new locator with the revision that the client last read:

```http
PUT /api/v1/publications/{publicationId}/progress
```

```json
{ "expectedRevision": 4, "locator": { "href": "chapter3.xhtml", "type": "application/xhtml+xml" } }
```

If another device saved after that revision, the server answers `409 progress_conflict`. The `current` field holds the other device's position:

```json
{
	"code": "progress_conflict",
	"message": "…",
	"current": { "revision": 5, "locator": {}, "device": "iPhone", "updatedAt": "…" }
}
```

To resolve the conflict, follow these steps:

1. Ask the reader which position to keep.
2. Save that position again with `expectedRevision` set to `current.revision`.

The server never picks a position itself. A reader who goes back to reread a chapter meant to go back.

When `totalProgression` is `1`, the publication is finished, and it leaves Continue reading.

## Sync bookmarks and highlights

To list a publication's bookmarks and highlights, send this request:

```http
GET /api/v1/publications/{publicationId}/annotations
```

To add a highlight, send its locator with the highlighted text in `text.highlight`:

```http
POST /api/v1/publications/{publicationId}/annotations
```

```json
{
	"kind": "highlight",
	"locator": { "href": "chapter3.xhtml", "type": "application/xhtml+xml", "text": { "highlight": "the words" } },
	"color": "yellow",
	"note": "A note"
}
```

To change an annotation, send `PATCH /api/v1/annotations/{annotationId}`. To remove it, send `DELETE` to the same path.

The last save wins. Fetch the whole list each time a publication opens, so that deletions from other devices appear. Each person can keep up to 5,000 annotations on one publication.
