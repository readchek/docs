---
title: HTTPS and reverse proxies
description: Put Chek server behind Caddy, nginx or a Cloudflare Tunnel, and tell it which proxy to trust.
---

Chek server speaks plain HTTP. Before you open it beyond your home network, put it behind a reverse proxy that serves HTTPS. Away from your local network, the Chek app and the [web app](https://app.chek.page) only reach servers over HTTPS.

## Trust your proxy

Behind a proxy, every request seems to come from the proxy's address. Chek limits wrong passwords per address, so without help everyone would share one limit. Tell the server which addresses are your proxy:

```sh
CHEK_TRUSTED_PROXIES=172.16.0.0/12
```

On requests from those addresses, the client's address is read from `X-Forwarded-For`. Requests from anywhere else are taken at their own address, so clients can't pick an address by sending the header themselves.

For a proxy in another container on the same Docker network, the Docker ranges `10.0.0.0/8,172.16.0.0/12,192.168.0.0/16` cover it.

## Caddy

Caddy gets and renews a certificate by itself and sends `X-Forwarded-For`.

```caddy title="Caddyfile"
chek.example.org {
    reverse_proxy chek:8080
}
```

## nginx

```nginx
server {
    listen 443 ssl;
    server_name chek.example.org;
    # ssl_certificate and ssl_certificate_key as usual

    # Uploads can be large. Match CHEK_MAX_UPLOAD_BYTES if admins upload.
    client_max_body_size 2g;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # Pages and files stream straight through.
        proxy_buffering off;
    }
}
```

With nginx on the host and Chek on `127.0.0.1`, set `CHEK_TRUSTED_PROXIES=127.0.0.1`.

## Cloudflare

Behind Cloudflare, whether through a Tunnel or a proxied DNS record, also set:

```sh
CHEK_CLIENT_IP_HEADER=CF-Connecting-IP
```

A tunnel or proxy in between may replace `X-Forwarded-For`, so the server reads the client from Cloudflare's own header instead. It reads the header only from `CHEK_TRUSTED_PROXIES`, so set that to your `cloudflared` container or proxy too. This only helps if every request comes through Cloudflare: a proxy that can be reached directly lets clients send their own value.

Cloudflare caps request bodies on its plans, 100 MB on Free and Pro, so larger uploads have to go around it.

## Checklist

- HTTPS on a name you control, such as `chek.example.org`.
- `CHEK_TRUSTED_PROXIES` set to the proxy, and `CHEK_CLIENT_IP_HEADER` behind Cloudflare.
- `CHEK_PUBLIC_URL=https://chek.example.org` if you use [sign-in providers](/self-hosting/sign-in-providers/).
- The container's port not published to the internet directly. Use `expose` instead of `ports` in Compose.
