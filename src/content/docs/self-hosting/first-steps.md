---
title: Set up a new server
description: Create the admin account, add libraries, and create accounts for other people.
---

The app doesn't manage libraries or accounts yet, so you do these steps with `curl`. After setup, every request sends the admin's session token in an `Authorization: Bearer <token>` header.

Set the server's address in a shell variable first:

```sh
SERVER=https://chek.example.org
```

## Create the admin account

A server with no accounts accepts one setup request. If you set `CHEK_SETUP_TOKEN`, use that value as the token. If you didn't, find the one-time token in the log with `docker logs chek`.

```sh
curl -X POST $SERVER/api/v1/setup \
	-H 'content-type: application/json' \
	-d '{"setupToken": "<token>", "name": "admin", "password": "<a long password>"}'
```

The response is a session. Save its `token`:

```sh
TOKEN=<the token from the response>
```

After the first admin exists, setup answers `409 already_set_up`. To get a new token later, sign in with `POST /api/v1/auth/sign-in` and the same name and password.

## Add a folder library

To add a folder, give its path inside the container:

```sh
curl -X POST $SERVER/api/v1/libraries \
	-H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
	-d '{"name": "Books", "path": "/library/books"}'
```

The server starts the first scan at once. It also scans every folder library each time it starts. That scan skips files whose size and modification time haven't changed.

To pick up changes while the server runs, start a scan:

```sh
curl -X POST $SERVER/api/v1/libraries/1/scan -H "Authorization: Bearer $TOKEN"
```

A library can also read a [Komga or Kavita server](/self-hosting/komga-and-kavita/) or run an [extension](/self-hosting/extensions/#turn-an-extension-into-a-library).

## Create accounts for other people

An account is an admin or a reader. A reader sees only the libraries in its `libraryIds`.

```sh
curl -X POST $SERVER/api/v1/users \
	-H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
	-d '{"name": "sam", "password": "<8 or more characters>", "role": "reader", "libraryIds": [1, 2]}'
```

To change an account's role, password, or libraries, send `PATCH /api/v1/users/{userId}`. For the rules on roles, sessions, and sign-in limits, read [Accounts and access](/self-hosting/users/).

## Connect a client

- In the Chek app, add the server's address and sign in. The app reads your libraries, syncs your place, and manages extension repositories and installs.
- In an OPDS reader, follow [Browse Chek from an OPDS reader](/self-hosting/opds/).
- In your own code, start with the [API overview](/api/overview/).
