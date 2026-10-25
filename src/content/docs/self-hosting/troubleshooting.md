---
title: Troubleshooting
description: Common problems running Chek server and what to do about them.
---

## The server won't start

It names the variable it couldn't read and why, such as `CHEK_SETUP_TOKEN: use at least 32 characters`. Fix that variable. `docker logs chek` shows the message.

## I can't find the setup token

It's logged only while the server has no accounts. Look further back in `docker logs chek`, or set your own with `CHEK_SETUP_TOKEN` and restart. Once an admin exists, setup answers `409 already_set_up`.

## A library is empty

- Check the path is the one **inside the container**, such as `/library/comics`, not the one on your host.
- Check the container can read it. The image runs as uid 10001, so the files need to be readable by that user or by everyone.
- Wait for the scan to finish. `GET /api/v1/libraries` shows each library's `scan` state.
- Files whose format the server can't tell are skipped. Supported formats are EPUB, PDF, CBZ, CBR, CB7, CBT, MOBI, AZW3, FB2, plain text and Markdown.

## A page or file answers `409 content_changed`

The file changed on disk since it was scanned, so its stored page offsets no longer match. The server has already started a rescan; try again when it's done.

## Everyone gets `429 too_many_attempts`

The server sees every client at your proxy's address. Set [`CHEK_TRUSTED_PROXIES`](/self-hosting/reverse-proxy/#trust-your-proxy), and `CHEK_CLIENT_IP_HEADER` behind Cloudflare.

## The app or web app can't connect

- Away from your local network, the app needs an `https://` address.
- The web app at app.chek.page reaches only HTTPS servers, and only if its origin is in `CHEK_WEB_ORIGINS`. It is by default.
- Check `https://<your server>/health` answers from the device.

## A Komga or Kavita library won't add

Adding one checks the address and credentials first, and answers `400 source_check_failed` with Komga's or Kavita's reason. Check the URL is reachable from the Chek container, not just from your browser, and that the account has the [roles it needs](/self-hosting/komga-and-kavita/).

## An extension's site keeps failing

Some sites put a challenge in front of their pages. See [Sites behind a challenge](/self-hosting/extensions/#sites-behind-a-challenge). If verification passes but requests still fail, the site may be refusing your server's outbound address.

## Still stuck

Open an issue on [readchek/chek](https://github.com/readchek/chek/issues) with the server version, how you run it, and the log lines around the problem. Leave out tokens and passwords.
