---
title: Update and back up the server
description: Move to a new release, and keep a copy of the data that you can't rebuild.
---

## Update to a new release

Each release is a tag on `main`, such as `0.5.1`, with an image of the same name. The `latest` tag follows releases, and `edge` follows `main`. Read the [release notes](https://github.com/readchek/chek/releases) before you update.

To update with Docker, pull the image and run the container again with the same volumes:

```sh
docker pull ghcr.io/readchek/chek:latest
docker stop chek && docker rm chek
# Run the same docker run command as before.
```

- With Compose, run `docker compose pull && docker compose up -d`.
- With Dokploy, deploy the application again.

Keep the data volume. The server migrates the database when a new version starts. If a release changes how the server reads files, the migration starts a full rescan. So the first start after an update can scan every library again.

To stay on one release, use its tag, such as `ghcr.io/readchek/chek:0.5.1`. Change the tag when you are ready to update.

## Know what to back up

The data folder holds these files. Your books stay in your own folders, which the server only reads.

| Path | Contents | If you lose it |
| --- | --- | --- |
| `chek.db` | Accounts, libraries, reading positions, bookmarks, highlights, metadata edits, and settings | It's gone. Back it up |
| `extensions/state.db` | The caches and cookies of extensions | Extensions start again from empty. People may need to verify sites again |
| `extensions/*.wasm` | Installed extensions | The server downloads them again on the next install |
| `extensions/images/` | Cached covers and pages from extensions | The server fetches them again |
| `covers/` | Cover thumbnails | The next scan makes them again |

## Back up the database

The database uses SQLite's WAL mode. If you copy `chek.db` while the server writes to it, the copy can be incomplete. Use one of these two ways.

To back up with the server stopped, stop it and copy the files:

```sh
docker stop chek
docker run --rm -v chek-data:/data -v "$PWD":/backup debian:trixie-slim \
	tar czf /backup/chek-data.tgz -C /data chek.db extensions/state.db
docker start chek
```

To back up while the server runs, use the `sqlite3` tool on the host:

```sh
sqlite3 /path/to/data/chek.db ".backup '/backups/chek.db'"
```

To restore, put `chek.db` in an empty data folder before the server starts.
