---
title: Quick start
description: Run Chek server with Docker, create the admin, add a folder and read it in the app.
---

This gets a server running on your own machine in a few minutes. It's good for trying Chek. Before opening it to other devices outside your home network, follow [Install](/self-hosting/install/) and [HTTPS and reverse proxies](/self-hosting/reverse-proxy/).

You need [Docker](https://docs.docker.com/get-docker/) and a folder of books or comics.

## 1. Start the server

```sh
docker run -d --name chek -p 8080:8080 \
  -v chek-data:/data \
  -v /path/to/comics:/library:ro \
  ghcr.io/readchek/chek:latest
```

- `chek-data` holds the database, covers and installed extensions. Keep it between upgrades.
- Your folder is mounted read-only at `/library`. The server never changes your files.

Check it's up:

```sh
curl localhost:8080/health
```

## 2. Create the admin

A new server has no accounts. It prints a one-time setup token in its log so that only someone who can read the log can claim it:

```sh
docker logs chek
```

Trade the token for the first admin account:

```sh
curl -X POST localhost:8080/api/v1/setup \
  -H 'content-type: application/json' \
  -d '{"setupToken": "<from the log>", "name": "admin", "password": "<a long password>"}'
```

The answer holds a session `token`. Keep it for the next step:

```sh
TOKEN=<the token>
```

## 3. Add your folder

```sh
curl -X POST localhost:8080/api/v1/libraries \
  -H "Authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' \
  -d '{"name": "Comics", "path": "/library"}'
```

The server starts scanning at once. Large folders take a while; the library's `scan` field shows how far it's got:

```sh
curl localhost:8080/api/v1/libraries -H "Authorization: Bearer $TOKEN"
```

## 4. Read

- **In the Chek app**, add a server with your computer's address on your network, such as `192.168.1.20:8080`, and sign in as `admin`. The app uses plain HTTP only for addresses on your local network; anywhere else it needs HTTPS.
- **In an OPDS 2 reader** such as Thorium or KOReader, add `http://<your computer>:8080/opds/v2/catalog` and sign in with the same name and password.

## Next

- [Install](/self-hosting/install/) covers Compose, Dokploy and the image tags.
- [First steps](/self-hosting/first-steps/) adds readers and more libraries.
- [Configuration](/self-hosting/configuration/) lists every setting.
