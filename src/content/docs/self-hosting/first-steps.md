---
title: First steps
description: Claim a new server, add libraries and give people their own accounts.
---

Libraries and accounts are managed through the API for now, so these steps use `curl`. Every request after setup sends the admin's session token as `Authorization: Bearer <token>`.

```sh
SERVER=https://chek.example.org   # or http://localhost:8080
```

## Create the admin

A server with no accounts accepts one setup request. The token is `CHEK_SETUP_TOKEN` if you set it, or the one-time token in the log otherwise (`docker logs chek`).

```sh
curl -X POST $SERVER/api/v1/setup \
  -H 'content-type: application/json' \
  -d '{"setupToken": "<token>", "name": "admin", "password": "<a long password>"}'
```

The answer is a session. Save its `token`:

```sh
TOKEN=<the token>
```

Once an admin exists, setup answers `409 already_set_up`. To sign in again later, use `POST /api/v1/auth/sign-in` with the same name and password.

## Add libraries

A library is a folder on the server, a [Komga or Kavita server](/self-hosting/komga-and-kavita/), or a source run by an [extension](/self-hosting/extensions/). For a folder, give the path inside the container:

```sh
curl -X POST $SERVER/api/v1/libraries \
  -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"name": "Books", "path": "/library/books"}'
```

The first scan starts at once. Every folder library is scanned again when the server starts, skipping files whose size and modification time haven't changed. To pick up changes while it runs, ask for a scan:

```sh
curl -X POST $SERVER/api/v1/libraries/1/scan -H "Authorization: Bearer $TOKEN"
```

## Add readers

There are two roles. **Admins** manage libraries and accounts and see every library. **Readers** see only the libraries they were granted; anything else answers as not found.

```sh
curl -X POST $SERVER/api/v1/users \
  -H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"name": "sam", "password": "<at least 8 characters>", "role": "reader", "libraryIds": [1, 2]}'
```

Change someone's role, password or libraries with `PATCH /api/v1/users/{userId}`. See [Users and access](/self-hosting/users/) for sessions, sign-in limits and demo accounts.

## Connect

- **Chek app:** add the server's address and sign in. The app reads your libraries, syncs your place, and manages extension repositories and installs.
- **OPDS readers:** see [OPDS](/self-hosting/opds/).
- **Your own code:** see the [API overview](/api/overview/).
