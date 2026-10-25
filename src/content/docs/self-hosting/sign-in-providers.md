---
title: Sign-in providers
description: Let people sign in with OpenID Connect providers such as Authentik, Authelia, Keycloak, Pocket ID or Google.
---

Besides a password, people can sign in through any OpenID Connect provider. Each provider is set up with environment variables.

## Set up

1. Set `CHEK_PUBLIC_URL` to the address people reach the server at, such as `https://chek.example.org`.
2. In your provider, create a client and register this redirect URI. The server also logs it at startup.

   ```
   https://chek.example.org/api/v1/auth/callback
   ```

3. List your providers' ids, and give each one its settings. In variable names the id is upper-cased, with `-` written as `_`.

```sh
CHEK_PUBLIC_URL=https://chek.example.org
CHEK_OIDC_PROVIDERS=authentik
CHEK_OIDC_AUTHENTIK_ISSUER=https://auth.example.org/application/o/chek/
CHEK_OIDC_AUTHENTIK_CLIENT_ID=<client id>
CHEK_OIDC_AUTHENTIK_CLIENT_SECRET=<client secret>
CHEK_OIDC_AUTHENTIK_NAME=Authentik
CHEK_OIDC_AUTHENTIK_CREATE_USERS=true
CHEK_OIDC_AUTHENTIK_ADMIN_GROUPS=chek-admins
```

| Setting | Default | What it does |
| --- | --- | --- |
| `_ISSUER` | required | The provider's issuer URL, over HTTPS (plain HTTP only on loopback, for testing) |
| `_CLIENT_ID` | required | The client's id |
| `_CLIENT_SECRET` | none | The client's secret. Leave it out for a public client |
| `_NAME` | the id | The label on the sign-in button |
| `_SCOPES` | `openid profile email` | Scopes to ask for |
| `_CREATE_USERS` | `false` | Whether someone unknown gets a new account |
| `_ADMIN_GROUPS` | none | Comma-separated groups whose members become admins when their account is created |
| `_GROUPS_CLAIM` | `groups` | The claim that lists a person's groups |

The server fetches each provider's discovery document the first time it's used, so a provider that's down never stops the server from starting.

## Who gets in

People are matched by the provider's subject id, never by email or name.

- **With `_CREATE_USERS=true`**, someone the server doesn't know gets an account named from `preferred_username`, `name` or `email`, with a number added if the name is taken. They're an admin if they're in one of `_ADMIN_GROUPS` and a reader otherwise. Roles aren't changed on later sign-ins, and new readers start with no libraries until an admin grants some.
- **Otherwise**, people sign in with their password once and link the provider from their account.

Accounts made by a provider have no password. [OPDS readers](/self-hosting/opds/) sign in with a password, so those people set one first. A provider can't be unlinked while it's someone's only way to sign in.

## Apps

Apps start a sign-in with a PKCE challenge and a redirect URI of their own, and get back a one-time code that only they can trade for a session. Redirect URIs must start with `CHEK_PUBLIC_URL` or a prefix in `CHEK_OIDC_REDIRECTS`, which is `chek://` by default for the Chek app. If you build your own app, add its scheme:

```sh
CHEK_OIDC_REDIRECTS=chek://,myapp://
```

Sign-ins in progress are kept in memory for 10 minutes, so restarting the server cancels them.
