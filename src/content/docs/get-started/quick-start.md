---
title: Quick start
description: Run Chek server in Docker on your computer, create the admin account, add a folder, and read it in the app.
---

In this tutorial, we run Chek server on your computer, add a folder of comics to it, and read that folder in the Chek app. It takes about ten minutes.

This setup is for trying Chek on your home network. Before other people use your server over the internet, follow [Install the server](/self-hosting/install/) and [Serve Chek over HTTPS](/self-hosting/reverse-proxy/).

You need [Docker](https://docs.docker.com/get-docker/) and a folder of books or comics.

## Start the server

First, start the server. Replace `/path/to/comics` with your folder.

```sh
docker run -d --name chek -p 8080:8080 \
	-v chek-data:/data \
	-v /path/to/comics:/library:ro \
	ghcr.io/readchek/chek:latest
```

The `chek-data` volume holds the database and the covers. The second `-v` mounts your folder at `/library`. The `:ro` makes it read-only, so the server can't change your files.

Now check that the server answers:

```sh
curl localhost:8080/health
```

You should see this:

```json
{"status":"ok"}
```

If `curl` can't connect, run `docker logs chek` to see why the server stopped.

## Create the admin account

A new server has no accounts. When it starts, it writes a one-time setup token to its log. Only a person who can read the log can create the first account.

Find the token in the log:

```sh
docker logs chek
```

Next, send the token with the name and password of the admin account. Replace the two values in angle brackets.

```sh
curl -X POST localhost:8080/api/v1/setup \
	-H 'content-type: application/json' \
	-d '{"setupToken": "<token from the log>", "name": "admin", "password": "<a long password>"}'
```

The response is a JSON object with a `token` field. Save the token in a shell variable, because the next steps use it:

```sh
TOKEN=<the token from the response>
```

## Add your folder

Now add the folder as a library. Use the path inside the container, `/library`, not the path on your computer.

```sh
curl -X POST localhost:8080/api/v1/libraries \
	-H "Authorization: Bearer $TOKEN" \
	-H 'content-type: application/json' \
	-d '{"name": "Comics", "path": "/library"}'
```

The server starts to scan the folder at once. A large folder takes some minutes. To see how far the scan is, list the libraries:

```sh
curl localhost:8080/api/v1/libraries -H "Authorization: Bearer $TOKEN"
```

Each library in the response has a `scan` field with the state of its scan.

## Read in the app

Finally, open the Chek app on a device on the same network. Add a server with your computer's address and port, such as `192.168.1.20:8080`, and sign in as `admin`. Your comics appear in the app.

The app uses plain HTTP only for addresses on your local network. For any other address, the server needs HTTPS.

You can also read from an OPDS 2 reader, such as Thorium or KOReader. Add `http://<your computer>:8080/opds/v2/catalog` as a catalog, and sign in with the same name and password.

## Next steps

- [Install the server](/self-hosting/install/) with Compose or Dokploy, and choose an image tag.
- [Set up a new server](/self-hosting/first-steps/) with more libraries and accounts for other people.
- Look up a setting in the [configuration reference](/self-hosting/configuration/).
