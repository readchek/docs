---
title: Set up a new server
description: Create the admin account, add libraries, and create accounts for other people in the admin panel or with the API.
---

The server serves an admin panel at `/admin`. It sets up a new server and manages its libraries, people, and extension repositories. The Docker image includes it. To set up without a browser, use the API instead, as [Set up with the API](#set-up-with-the-api) describes.

## Open the admin panel

Open `http://<your server>:8080/admin` in a browser. Behind a reverse proxy, open `https://<your domain>/admin`.

If the server has an HTTPS address, you can also manage it from [app.chek.page/admin](https://app.chek.page/admin). Enter the server's address in **Server address**.

## Create the admin account

A server with no accounts shows **Set up Chek**.

1. In **Setup token**, enter the token. If you set `CHEK_SETUP_TOKEN`, use that value. If you didn't, find the one-time token in the log with `docker logs chek`.
2. Fill in **Your name**, **Password**, and **Password again**. The password needs 8 or more characters.
3. Click **Create admin account**.

The admin panel signs you in and opens **Add a library**. After the first admin exists, the admin panel asks for a name and password instead.

## Add a folder library

1. Under **Where your library is**, choose **A folder on this server**.
2. In **Folder**, enter the folder's path inside the container, such as `/library/books`. To choose the folder from a list, click **Browse**.
3. In **Name**, enter the name that readers see.
4. Click **Add library**.

The server starts the first scan at once. It also scans every folder library each time it starts. That scan skips files whose size and modification time haven't changed. To pick up changes while the server runs, open the library in **Libraries** and click **Scan now**.

A library can also read a [Komga or Kavita server](/self-hosting/komga-and-kavita/) or run an [extension](/self-hosting/extensions/#turn-an-extension-into-a-library).

## Create accounts for other people

An account is an admin or a reader. A reader sees only the libraries that you choose for it.

1. Open **People**, and click **Add person**.
2. Enter the person's **Name** and **Password**.
3. Under **Role**, choose **Reader** or **Admin**.
4. For a reader, choose the libraries under **Libraries they can read**.
5. Click **Add person**.

To change an account's role, password, or libraries, open the account in **People**. For the rules on roles, sessions, and sign-in limits, read [Accounts and access](/self-hosting/users/).

## Rename or delete a library

Open the library in **Libraries**.

- To rename it, change the name under **Name** and click **Rename**.
- To delete it, click **Delete library**. Deleting a library deletes everyone's progress, bookmarks, and highlights in it. The files stay in the folder, and the books stay on Komga or Kavita. You can't delete a library while the server scans it.

## Connect a client

- In a browser, open the server's address. The server serves the Chek web app at `/`. Read [Read in a browser](/self-hosting/web-app/).
- In the Chek app, add the server's address and sign in. The app reads your libraries, syncs your place, and manages extension repositories and installs.
- In an OPDS reader, follow [Browse Chek from an OPDS reader](/self-hosting/opds/).
- In your own code, start with the [API overview](/api/overview/).

## Set up with the API

Every step in the admin panel has an endpoint. After setup, every request sends the admin's session token in an `Authorization: Bearer <token>` header.

Set the server's address in a shell variable first:

```sh
SERVER=https://chek.example.org
```

A server with no accounts accepts one setup request. Send the setup token with the admin's name and password:

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

To add a folder, give its path inside the container:

```sh
curl -X POST $SERVER/api/v1/libraries \
	-H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
	-d '{"name": "Books", "path": "/library/books"}'
```

To scan a library again, send `POST /api/v1/libraries/{libraryId}/scan`. To rename it, send `PATCH /api/v1/libraries/{libraryId}`. To delete it, send `DELETE /api/v1/libraries/{libraryId}`.

To create an account, send its name, password, role, and the ids of the libraries that a reader may see:

```sh
curl -X POST $SERVER/api/v1/users \
	-H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
	-d '{"name": "sam", "password": "<8 or more characters>", "role": "reader", "libraryIds": [1, 2]}'
```

To change an account's role, password, or libraries, send `PATCH /api/v1/users/{userId}`.
