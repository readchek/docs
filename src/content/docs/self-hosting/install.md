---
title: Install
description: Run Chek server with Docker, Docker Compose or Dokploy, or build it from source.
---

Chek server runs as a single process with an SQLite database, so one container and one volume is a whole install.

## Images

CI publishes `ghcr.io/readchek/chek` for amd64 and arm64.

| Tag | What you get |
| --- | --- |
| `latest` | The newest release |
| A version, such as `0.3.0` | That release, for pinning |
| `edge` | The newest commit on `main` |
| Any of the above with `-browser`, such as `latest-browser` | The same server with Chromium, for [browser-backed extensions](/self-hosting/extensions/#sites-behind-a-challenge) |

The plain image is small and has no browser. Use a `-browser` tag only if you run extensions that need one, and only extensions you trust.

In the image, the server listens on `0.0.0.0:8080`, keeps its data in `/data` and runs as an unprivileged `chek` user (uid 10001).

## Docker

```sh
docker run -d --name chek --restart unless-stopped -p 8080:8080 \
  -e CHEK_SETUP_TOKEN=<32 or more random characters> \
  -v chek-data:/data \
  -v /srv/books:/library/books:ro \
  -v /srv/comics:/library/comics:ro \
  ghcr.io/readchek/chek:latest
```

Mount each folder you want to read under `/library`, read-only unless you want admins to [upload](/self-hosting/uploads/) into it. Setting `CHEK_SETUP_TOKEN` saves reading it from the log on first start.

## Docker Compose

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

```sh
CHEK_SETUP_TOKEN=$(openssl rand -hex 24) docker compose up -d
```

Behind a reverse proxy on the same Docker network, replace `ports` with `expose: ["8080"]` and set [`CHEK_TRUSTED_PROXIES`](/self-hosting/reverse-proxy/).

For browser-backed extensions, use a `-browser` tag and give the container more shared memory for Chromium:

```yaml
    image: ghcr.io/readchek/chek:latest-browser
    shm_size: 1gb
```

## Dokploy

The chek repository has a Compose file ready for Dokploy at [`deploy/server/compose.yaml`](https://github.com/readchek/chek/blob/main/deploy/server/compose.yaml). It runs the `edge-browser` image behind Dokploy's proxy.

1. Create a **Compose** application from `readchek/chek` and select `deploy/server/compose.yaml`.
2. In **Environment**, set `CHEK_SETUP_TOKEN` to 32 or more random characters. To pin a release instead of following `main`, set `CHEK_IMAGE`, such as `ghcr.io/readchek/chek:0.3.0-browser`.
3. Route your domain to service `chek`, port `8080`, with HTTPS.
4. Deploy, then [create the admin](/self-hosting/first-steps/).

That file mounts no book folders. To read local files, add a read-only bind mount such as `/srv/books:/library/books:ro`.

## From source

You need a recent stable Rust, [libvips](https://www.libvips.org) for cover thumbnails and [libarchive](https://www.libarchive.org) for RAR and 7-Zip comics.

```sh
apt install libvips-dev libarchive-dev   # Debian or Ubuntu
brew install vips libarchive             # macOS

git clone https://github.com/readchek/chek
cd chek
cargo run --release --bin chek
```

Run from source, the server listens on `127.0.0.1:8080` and keeps its data in `./data`. Change both with [`CHEK_BIND` and `CHEK_DATA_DIR`](/self-hosting/configuration/).

To build the image yourself, run `docker build -t chek .` in the repository, or `docker build --target browser -t chek-browser .` for the browser image.
