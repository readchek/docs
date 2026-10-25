---
title: API overview
description: How to sign in, page through lists and handle errors in Chek server's HTTP API.
---

Chek server has a JSON API under `/api/v1`. The [Chek app](https://apps.apple.com/us/app/chek-books-comics/id6761271144) and web app use it, and you can build on it too: your own client, a script that adds libraries, a bot that tells you about new chapters.

The API is described by a hand-written OpenAPI 3.1 file, [`openapi.yaml`](https://github.com/readchek/chek/blob/main/openapi.yaml), which is the contract: the server changes in step with it, and each server release tags the version it implements. The [reference](/api/reference/) on this site is built from the file at the release these docs describe. To generate a client, use the file from the tag that matches your server.

## Authentication

Every operation needs a session token, except `GET /health`, `POST /api/v1/setup` and signing in.

```sh
curl -X POST $SERVER/api/v1/auth/sign-in \
  -H 'content-type: application/json' \
  -d '{"name": "sam", "password": "<password>", "device": "My script"}'
```

```json
{ "token": "…", "user": { "id": 2, "name": "sam", "role": "reader", "libraryIds": [1] } }
```

Send the token on every request:

```http
Authorization: Bearer <token>
```

- `device` labels the session in the person's list of signed-in devices. Name your client.
- Sessions last 90 days after their last use. `POST /api/v1/auth/sign-out` ends one.
- HTTP Basic credentials work too, for clients that can't keep a token, such as OPDS readers. Prefer tokens: they can be signed out one at a time, and a password change doesn't break other devices.
- For [sign-in providers](/self-hosting/sign-in-providers/), list them with `GET /api/v1/auth/providers`, then follow the PKCE flow in the reference under `authorize` and `exchange`.

## Access

Admins see every library. Readers see only the libraries they were granted, and everything else answers `404`, as if it didn't exist. Admin-only operations answer `403` for readers.

## Browsers

Browsers may call the API only from the origins in [`CHEK_WEB_ORIGINS`](/self-hosting/configuration/#behind-a-proxy), `https://app.chek.page` by default. Requests carry a bearer token and never cookies. A page served over HTTPS can only call servers on HTTPS.

## Lists

Lists answer `{ "items": [...] }`. Long lists are paged with an opaque cursor:

```sh
curl "$SERVER/api/v1/libraries/1/publications?limit=100" -H "Authorization: Bearer $TOKEN"
```

```json
{ "items": [ ... ], "nextCursor": "…" }
```

Pass `nextCursor` back as `cursor` for the next page. It's absent on the last page. `limit` is 50 by default and clamped to 1 through 200. Search pages by position instead, since relevance has no stable key.

## Errors

Errors answer with an HTTP status and a body you can switch on:

```json
{ "code": "progress_conflict", "message": "Another device saved a newer position." }
```

Switch on `code`, not `message`. Messages explain the problem to a developer and may change. Each operation in the [reference](/api/reference/) lists the codes it can answer, such as `content_changed` when a file changed on disk since its last scan, or `too_many_attempts` after too many wrong passwords.

## Caching

Files, pages and covers carry an `ETag`. Send it back as `If-None-Match` and an unchanged one answers `304`. Files support `Range` requests where the library can serve them.

## OPDS

For reading apps rather than custom clients, the server also speaks [OPDS 2](/self-hosting/opds/) under `/opds/v2`.
