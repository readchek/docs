---
title: Troubleshooting
description: Fix common problems with Chek server.
---

## The server doesn't start

Read the log with `docker logs chek`. If a setting is wrong, the log names the variable and the reason, such as `CHEK_SETUP_TOKEN: use at least 32 characters`. Fix the variable and start the server again.

## The setup token isn't in the log

The server writes the token only while it has no accounts. Look further back in `docker logs chek`. Or set your own token in `CHEK_SETUP_TOKEN` and restart the server.

If setup answers `409 already_set_up`, an admin account exists already. Sign in with it instead.

## A library is empty

1. Check that the library's path is the path inside the container, such as `/library/comics`, not the path on the host.
2. Check that the container can read the files. The image runs as uid 10001, so that user or everyone needs read access.
3. Wait for the scan to finish. `GET /api/v1/libraries` shows the `scan` state of each library.

The server skips files that aren't a format it reads. It reads EPUB, PDF, CBZ, CBR, CB7, CBT, MOBI, AZW3, FB2, plain text, and Markdown.

## A page or file answers `409 content_changed`

The file changed on disk after the last scan, so the server's page offsets no longer match it. The server has already started a rescan. Try again after the scan.

## Every user gets `429 too_many_attempts`

The server sees all clients at your proxy's address. Set `CHEK_TRUSTED_PROXIES`, as [Tell the server which proxy to trust](/self-hosting/reverse-proxy/#tell-the-server-which-proxy-to-trust) describes. Behind Cloudflare, also set `CHEK_CLIENT_IP_HEADER`.

## The app or the web app can't connect

- Off your local network, the app needs an `https://` address.
- The web app at app.chek.page connects only to HTTPS servers. Its origin must be in `CHEK_WEB_ORIGINS`, which it is by default.
- On the device, open `https://<your server>/health`. It should show `{"status":"ok"}`.

## A Komga or Kavita library isn't added

When you add the library, the server checks the address and the credentials. If the check fails, it answers `400 source_check_failed` with the reason from Komga or Kavita.

- Check that the Chek container can reach the URL. Your browser reaching it isn't enough.
- Check that the account has the roles that [Read Komga and Kavita libraries](/self-hosting/komga-and-kavita/) lists.

## An extension's site keeps failing

The site may show a browser challenge. Follow [Let extensions get past site challenges](/self-hosting/extensions/#let-extensions-get-past-site-challenges). If verification works but requests still fail, the site may block your server's outbound address.

## Report a problem

Open an issue on [readchek/chek](https://github.com/readchek/chek/issues). Include the server version, how you run the server, and the log lines around the problem. Remove tokens and passwords from the logs first.
