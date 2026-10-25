---
title: Accounts and access
description: Roles, library grants, sessions, sign-in limits, Basic credentials, and demo accounts.
---

## Roles

| Role | Can do |
| --- | --- |
| `admin` | Add and change libraries and accounts. See every library |
| `reader` | See the libraries in the account's `libraryIds` |

A library outside a reader's `libraryIds` answers `404`. So do its series and publications.

The server always keeps one admin. A request to demote or delete the last admin answers `409 last_admin`.

## Names and passwords

- A name is 1 to 64 characters. Sign-in ignores case in names.
- A password is at least 8 characters and at most 1024 bytes.
- The server hashes passwords with Argon2id.

## Sessions

- Sign-in returns a random session token. The server stores only a hash of the token.
- A session ends 90 days after its last use.
- `GET /api/v1/me/sessions` lists a person's sessions. `DELETE /api/v1/me/sessions/{sessionId}` ends one.
- A password change ends the account's other sessions.

## Limits on wrong passwords

After 10 wrong passwords from one address in 15 minutes, password checks from that address answer `429 too_many_attempts`. The block lifts when the oldest failure is 15 minutes old.

- The limit counts per address, not per account. A stranger can't lock a person out by guessing that person's name.
- The limit doesn't affect session tokens.
- Behind a reverse proxy, the limit needs `CHEK_TRUSTED_PROXIES`. Without it, every client shares the proxy's limit. Read [Tell the server which proxy to trust](/self-hosting/reverse-proxy/#tell-the-server-which-proxy-to-trust).

## Basic credentials

A request can send HTTP Basic credentials, a name and a password, instead of a session token. OPDS readers need Basic credentials, because they can't keep a token. An account that a [sign-in provider](/self-hosting/sign-in-providers/) created has no password until its owner sets one.

## Demo accounts

`CHEK_DEMO_USERS` lists the names of accounts that the server treats as shared demos. Create the accounts first. Then list their names:

```sh
CHEK_DEMO_USERS=demo
```

A demo account has these limits:

- Changes to its password, sessions, sign-in providers, extensions, repositories, or annotations answer `403 demo_account`.
- A saved reading position answers as saved, but the server doesn't keep it.
- It sees only its own session, so one visitor never sees another visitor's device.
- It sees only Safe and Suggestive content.
