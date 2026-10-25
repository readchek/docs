---
title: Users and access
description: Roles, library grants, sessions, sign-in limits and demo accounts.
---

## Roles and libraries

- **Admins** add and change libraries and accounts, and see every library.
- **Readers** see only the libraries an admin granted them. Other libraries, and the series and publications in them, answer `404`, so a reader can't tell they exist.

Create accounts with `POST /api/v1/users`, and change a role, password or grants with `PATCH /api/v1/users/{userId}`. Names are 1 to 64 characters and not case-sensitive at sign-in. Passwords are at least 8 characters.

The server always keeps one admin. Demoting or deleting the last one answers `409 last_admin`.

## Sessions

- Signing in returns a random session token. The server stores only its hash.
- A session lasts 90 days after it was last used.
- People can list their own signed-in devices with `GET /api/v1/me/sessions` and sign any of them out.
- Changing a password signs out the account's other sessions.

Passwords are hashed with Argon2id.

## Wrong passwords

After 10 wrong passwords from one address within 15 minutes, password checks from that address answer `429 too_many_attempts` until the oldest failure is 15 minutes old. The limit is per address, not per account, so nobody can lock someone else out by guessing their name. Signed-in sessions aren't affected.

Behind a reverse proxy, set [`CHEK_TRUSTED_PROXIES`](/self-hosting/reverse-proxy/) or every client shares the proxy's limit.

## Basic credentials

Requests may send HTTP Basic credentials, a name and password, instead of a session token. [OPDS readers](/self-hosting/opds/) need this, since they can't hold a token. Accounts made by a [sign-in provider](/self-hosting/sign-in-providers/) have no password until their owner sets one.

## Demo accounts

`CHEK_DEMO_USERS` names accounts to treat as shared demos, whose password you publish. Create the accounts first, then list their names:

```sh
CHEK_DEMO_USERS=demo
```

Demo accounts can't change their password, sessions, sign-in providers, extensions, repositories or annotations; those answer `403 demo_account`. Their reading positions answer as saved but aren't kept, and they see only their own session, so visitors never see each other's places or devices. They see Safe and Suggestive content only.
