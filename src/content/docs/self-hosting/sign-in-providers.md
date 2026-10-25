---
title: Add sign-in providers
description: Let people sign in to Chek with OpenID Connect providers such as Authentik, Authelia, Keycloak, Pocket ID, or Google.
---

People can sign in with a password or with an OpenID Connect provider. You set up each provider with environment variables. The [configuration reference](/self-hosting/configuration/#provider-settings) lists every provider setting.

## Set up a provider

1. Set `CHEK_PUBLIC_URL` to the address that people use to reach the server, such as `https://chek.example.org`.
2. In your provider, create a client. Register this redirect URI for it:

   ```
   https://chek.example.org/api/v1/auth/callback
   ```

   The server also writes this URI to its log when it starts.
3. Set `CHEK_OIDC_PROVIDERS` to an id for the provider, and set the provider's variables. In each name, write the id in upper case.

   ```sh
   CHEK_PUBLIC_URL=https://chek.example.org
   CHEK_OIDC_PROVIDERS=authentik
   CHEK_OIDC_AUTHENTIK_ISSUER=https://auth.example.org/application/o/chek/
   CHEK_OIDC_AUTHENTIK_CLIENT_ID=<client id>
   CHEK_OIDC_AUTHENTIK_CLIENT_SECRET=<client secret>
   CHEK_OIDC_AUTHENTIK_NAME=Authentik
   ```

4. Restart the server.

The server fetches the provider's discovery document the first time someone uses the provider. If the provider is down, the server still starts.

## Create accounts at first sign-in

By default, a person needs a Chek account before signing in with a provider. To create accounts for new people at their first sign-in, set `_CREATE_USERS`:

```sh
CHEK_OIDC_AUTHENTIK_CREATE_USERS=true
CHEK_OIDC_AUTHENTIK_ADMIN_GROUPS=chek-admins
```

- The server takes the new account's name from `preferred_username`, `name`, or `email`. If the name is taken, it adds a number.
- A person in one of `_ADMIN_GROUPS` becomes an admin. Everyone else becomes a reader.
- A new reader has no libraries until an admin adds some.
- Later sign-ins don't change the role.

The server matches people by the provider's subject id. It never matches by email or name.

## Link a provider to an existing account

Without `_CREATE_USERS`, a person signs in with a password once. Then the person links the provider from their account. A person can't unlink a provider that is the account's only way to sign in.

An account that a provider created has no password. OPDS readers sign in with a password, so the account's owner must set one before using an OPDS reader.

## Allow your own app's redirect URI

An app starts a sign-in with a PKCE challenge and its own redirect URI. The server sends back a one-time code, which only that app can exchange for a session. The redirect URI must start with `CHEK_PUBLIC_URL` or with a prefix in `CHEK_OIDC_REDIRECTS`. The default prefix is `chek://`, for the Chek app.

If you build your own app, add its scheme:

```sh
CHEK_OIDC_REDIRECTS=chek://,myapp://
```

The server keeps sign-ins in progress in memory for 10 minutes. A restart cancels them.
