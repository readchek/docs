---
title: Install the server
description: Run Chek server with Docker, Docker Compose, or Dokploy, or build it from source.
---

Chek server is one process with one SQLite database. To install it, you run one container with one data volume.

## Choose an image tag

CI publishes the image `ghcr.io/readchek/chek` for amd64 and arm64.

| Tag | Contents |
| --- | --- |
| `latest` | The newest release |
| A version, such as `0.5.0` | That release |
| A minor series, such as `0.5` | The newest release in that series |
| `edge` | The newest commit on `main` |
| Any tag above with `-browser` added, such as `latest-browser` | The same server with Chromium, for extensions that need a browser |

Use the plain image unless an extension you run needs a browser. The `-browser` images turn off Chromium's own sandbox, so use them only with extensions you trust. For details, read [Let extensions get past site challenges](/self-hosting/extensions/#let-extensions-get-past-site-challenges).

In every image, the server listens on `0.0.0.0:8080` and keeps its data in `/data`. It runs as the user `chek`, with uid 10001.

## Run it with Docker

Mount each folder that you want to read under `/library`:

```sh
docker run -d --name chek --restart unless-stopped -p 8080:8080 \
	-e CHEK_SETUP_TOKEN=<32 or more random characters> \
	-v chek-data:/data \
	-v /srv/books:/library/books:ro \
	-v /srv/comics:/library/comics:ro \
	ghcr.io/readchek/chek:latest
```

`CHEK_SETUP_TOKEN` sets the token that creates the first admin account, so you don't need to read it from the log. Mount a folder read-write, without `:ro`, only if admins [upload files](/self-hosting/uploads/) to it.

## Run it with Docker Compose

Create `compose.yaml`:

```yaml title="compose.yaml"
services:
  chek:
    image: ghcr.io/readchek/chek:latest
    restart: unless-stopped
    ports: ["8080:8080"]
    environment:
      CHEK_SETUP_TOKEN: ${CHEK_SETUP_TOKEN:?set CHEK_SETUP_TOKEN}
    volumes:
      - chek-data:/data
      - /srv/books:/library/books:ro
      - /srv/comics:/library/comics:ro

volumes:
  chek-data:
```

Then start it with a random setup token:

```sh
CHEK_SETUP_TOKEN=$(openssl rand -hex 24) docker compose up -d
```

If a reverse proxy runs on the same Docker network, replace `ports` with `expose: ["8080"]`. Then set `CHEK_TRUSTED_PROXIES`, as [Serve Chek over HTTPS](/self-hosting/reverse-proxy/) describes.

If an extension needs a browser, use a `-browser` tag and give Chromium 1 GB of shared memory:

```yaml
    image: ghcr.io/readchek/chek:latest-browser
    shm_size: 1gb
```

## Run it on Dokploy

The chek repository has a Compose file for Dokploy at [`deploy/server/compose.yaml`](https://github.com/readchek/chek/blob/main/deploy/server/compose.yaml). It runs the `edge-browser` image.

1. Create a Compose application from `readchek/chek`, and select `deploy/server/compose.yaml`.
2. In **Environment**, set `CHEK_SETUP_TOKEN` to 32 or more random characters.
3. To run a release instead of `main`, also set `CHEK_IMAGE`, such as `ghcr.io/readchek/chek:0.5.0-browser`.
4. Route your domain to the service `chek` on port `8080`, with HTTPS.
5. Deploy, then open `/admin` on your domain and [create the admin account](/self-hosting/first-steps/#create-the-admin-account).

The Compose file mounts no folders of books. To read files from the host, add a read-only bind mount, such as `/srv/books:/library/books:ro`.

## Build it from source

To build the server, you need a recent stable Rust and two libraries. Chek uses [libvips](https://www.libvips.org) to make cover thumbnails and [libarchive](https://www.libarchive.org) to read RAR and 7-Zip comics.

1. Install the libraries.

   ```sh
   apt install libvips-dev libarchive-dev   # Debian or Ubuntu
   brew install vips libarchive             # macOS
   ```

2. Clone the repository and run the server.

   ```sh
   git clone https://github.com/readchek/chek
   cd chek
   cargo run --release --bin chek
   ```

A server built from source listens on `127.0.0.1:8080` and keeps its data in `./data`. To change them, set `CHEK_BIND` and `CHEK_DATA_DIR`.

To build the image yourself, run `docker build -t chek .` in the repository. For the image with Chromium, run `docker build --target browser -t chek-browser .`.
