---
title: Updating and backups
description: Move between releases and keep a copy of what can't be rebuilt.
---

## Updating

Releases are tags on `main`, such as `0.3.0`, and each has an image of the same name. `latest` follows releases and `edge` follows `main`.

```sh
docker pull ghcr.io/readchek/chek:latest
docker stop chek && docker rm chek
# Run the same `docker run` as before, with the same volumes.
```

With Compose, `docker compose pull && docker compose up -d`. With Dokploy, redeploy the application.

Keep the data volume. The database migrates itself when a new version starts. When a release reads files differently, the migration asks for a rescan, so the first start after an upgrade may scan every library again.

To stay on one release, use its tag, such as `ghcr.io/readchek/chek:0.3.0`, and change it when you're ready. Release notes are on [GitHub](https://github.com/readchek/chek/releases).

## What's in the data folder

| Path | What it is | If you lose it |
| --- | --- | --- |
| `chek.db` | Accounts, libraries, reading positions, bookmarks, highlights, metadata edits and settings, in SQLite | Gone for good. **Back this up** |
| `extensions/state.db` | Extensions' caches and cookie jars | Extensions start over; people may need to verify sites again |
| `extensions/*.wasm` | Installed extension components | Downloaded again on reinstall |
| `extensions/images/` | Cached covers and pages from extensions | Fetched again |
| `covers/` | Cover thumbnails | Made again on the next scan |

Your books stay in your own folders, which Chek only reads.

## Backing up

The database runs in SQLite's WAL mode, so copying `chek.db` while the server runs can catch it halfway through a write. Either stop the server and copy the folder:

```sh
docker stop chek
docker run --rm -v chek-data:/data -v "$PWD":/backup debian:trixie-slim \
  tar czf /backup/chek-data.tgz -C /data chek.db extensions/state.db
docker start chek
```

Or take a consistent copy while it runs with the `sqlite3` tool:

```sh
sqlite3 /path/to/data/chek.db ".backup '/backups/chek.db'"
```

To restore, put `chek.db` back in an empty data folder before the server starts.
