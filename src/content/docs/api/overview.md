---
title: API overview
description: Authentication, access, paging, errors, and caching in the Chek server API.
---

Chek server has a JSON API under `/api/v1`. The Chek app and the web app use it, and your own clients can too.

[`openapi.yaml`](https://github.com/readchek/chek/blob/main/openapi.yaml) in the chek repository describes the API in OpenAPI 3.1. It's the contract: a change to the API changes that file in the same pull request. Each server release tags the version of the file that it implements. The [API reference](/api/reference/) on this site comes from the file at release 0.5.0. To generate a client, use the file at the tag that matches your server.

## Authentication

Every operation needs a session token except these three:

- `GET /health`
- `POST /api/v1/setup`
- `POST /api/v1/auth/sign-in`

Sign-in takes a name, a password, and an optional `device` label:

```sh
curl -X POST $SERVER/api/v1/auth/sign-in \
	-H 'content-type: application/json' \
	-d '{"name": "sam", "password": "<password>", "device": "My script"}'
```

The response holds the token and the account:

```json
{
	"token": "…",
	"user": { "id": 2, "name": "sam", "role": "reader", "libraryIds": [1] }
}
```

Every other request sends the token in this header:

```http
Authorization: Bearer <token>
```

| Fact | Value |
| --- | --- |
| Session length | 90 days after the last use |
| End a session | `POST /api/v1/auth/sign-out` |
| Session label | The `device` value. It appears in the person's list of signed-in devices |
| Basic credentials | Accepted on every operation that needs a token. OPDS readers use them |
| Sign-in providers | `GET /api/v1/auth/providers` lists them. The `authorize` and `exchange` operations in the reference carry the PKCE flow |

A session token is safer to keep than a password. A person can end one session without changing the password, and a password change doesn't break other devices.

## Access

| Caller | Sees |
| --- | --- |
| Admin | Every library |
| Reader | The libraries in the account's `libraryIds` |

A library that a reader can't see answers `404`, and so do its series and publications. An admin-only operation answers `403` to a reader.

## Browsers

The API answers browser requests only from the origins in `CHEK_WEB_ORIGINS`. The default is `https://app.chek.page`. The web app that the server serves calls its own origin, so it needs no entry. Requests carry a bearer token and never cookies. A page served over HTTPS can call only HTTPS servers.

## Paging

A list answers with an `items` array. A long list also has a `nextCursor`:

```json
{ "items": [], "nextCursor": "…" }
```

| Parameter | Meaning |
| --- | --- |
| `cursor` | The `nextCursor` from the previous page. The last page has no `nextCursor` |
| `limit` | Items on each page. The default is 50. The server clamps values to the range 1 to 200 |

Search pages by position instead of by cursor, because a relevance order has no stable key.

## Errors

An error has an HTTP status and a JSON body with a `code` and a `message`:

```json
{ "code": "progress_conflict", "message": "Another device saved a newer position." }
```

Clients branch on `code`. The `message` explains the problem to a developer and can change between releases. Each operation in the [API reference](/api/reference/) lists the codes that it returns.

## Caching

Files, pages, and covers have an `ETag`. A request with a matching `If-None-Match` answers `304`. File downloads accept `Range` when the library's source supports it.

## OPDS

For reading apps, the server also serves an OPDS 2 catalog under `/opds/v2`. Read [Browse Chek from an OPDS reader](/self-hosting/opds/).
