---
title: Quick start
description: Run Chek server in Docker on your computer, set it up in the admin panel, add a folder, and read it in the browser and the app.
---

In this tutorial, we run Chek server on your computer, add a folder of comics to it, and read that folder in the browser and in the Chek app. It takes about ten minutes.

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

Next, open `http://localhost:8080/admin` in a browser. The admin panel shows **Set up Chek**.

Paste the token into **Setup token**. Then fill in **Your name** and a password of 8 or more characters, and click **Create admin account**.

The admin panel signs you in and shows **Add a library**.

## Add your folder

Now add the folder as a library. Under **Where your library is**, keep **A folder on this server**.

In **Folder**, enter `/library`. That is the path inside the container, not the path on your computer. You can also click **Browse** and choose the folder.

Type `Comics` in **Name**, and click **Add library**.

The server starts to scan the folder at once. The library's page shows the scan under **Scan**. Books show up as the server finds them, and a large folder takes some minutes.

## Read in the browser

Open `http://localhost:8080/` in a new tab. This is the Chek web app, and the server serves it too.

Sign in with the name and password of the admin account. Then click **Shared**, and open the **Comics** library. Click a comic to read it.

## Read in the app

Finally, open the Chek app on an iPhone or iPad on the same network. Add a server with your computer's address and port, such as `192.168.1.20:8080`, and sign in as the admin. Your comics appear in the app.

The app uses plain HTTP only for addresses on your local network. For any other address, the server needs HTTPS.

You can also read from an OPDS 2 reader, such as Thorium or KOReader. Add `http://<your computer>:8080/opds/v2/catalog` as a catalog, and sign in with the same name and password.

## Next steps

- [Install the server](/self-hosting/install/) with Compose or Dokploy, and choose an image tag.
- [Set up a new server](/self-hosting/first-steps/) with more libraries and accounts for other people.
- Look up a setting in the [configuration reference](/self-hosting/configuration/).
