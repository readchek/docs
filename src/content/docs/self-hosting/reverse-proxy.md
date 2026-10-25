---
title: Serve Chek over HTTPS
description: Put Chek server behind Caddy, nginx, or Cloudflare, and tell the server which proxy to trust.
---

Chek server speaks plain HTTP. Before the server is reachable from outside your home network, put a reverse proxy with HTTPS in front of it. Off your local network, the Chek app and the web app connect only to HTTPS servers.

## Tell the server which proxy to trust

Behind a proxy, every request comes from the proxy's address. The server limits wrong passwords per address, so without this setting all your users share one limit.

Set `CHEK_TRUSTED_PROXIES` to your proxy's addresses:

```sh
CHEK_TRUSTED_PROXIES=172.16.0.0/12
```

The server then reads the client address from `X-Forwarded-For`, but only on requests from those addresses. A client that connects directly can't choose its address by sending the header.

If the proxy runs in another container on the same Docker network, these ranges cover it: `10.0.0.0/8,172.16.0.0/12,192.168.0.0/16`.

## Use Caddy

Caddy gets and renews the certificate and sends `X-Forwarded-For` by default.

```caddy title="Caddyfile"
chek.example.org {
	reverse_proxy chek:8080
}
```

## Use nginx

```nginx
server {
	listen 443 ssl;
	server_name chek.example.org;
	# Add ssl_certificate and ssl_certificate_key here.

	# Admins can upload files up to CHEK_MAX_UPLOAD_BYTES.
	client_max_body_size 2g;

	location / {
		proxy_pass http://127.0.0.1:8080;
		proxy_set_header Host $host;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		# Send pages and files to the client as they arrive.
		proxy_buffering off;
	}
}
```

If nginx runs on the host and Chek listens on `127.0.0.1`, set `CHEK_TRUSTED_PROXIES=127.0.0.1`.

## Use Cloudflare

Behind Cloudflare, through a Tunnel or a proxied DNS record, also set this variable:

```sh
CHEK_CLIENT_IP_HEADER=CF-Connecting-IP
```

A tunnel can replace `X-Forwarded-For`, so the server reads the client address from Cloudflare's header instead. The server reads the header only on requests from `CHEK_TRUSTED_PROXIES`. Set that variable to the address of your `cloudflared` container or your proxy.

The header is reliable only if every request comes through Cloudflare. If clients can reach your proxy directly, they can send any value in the header.

Cloudflare limits the size of a request body. On the Free and Pro plans, the limit is 100 MB, so larger uploads must not go through Cloudflare.

## Check the setup

- The server has HTTPS on a domain that you control, such as `chek.example.org`.
- `CHEK_TRUSTED_PROXIES` names the proxy. Behind Cloudflare, `CHEK_CLIENT_IP_HEADER` is set too.
- If you use [sign-in providers](/self-hosting/sign-in-providers/), `CHEK_PUBLIC_URL` is the HTTPS address, such as `https://chek.example.org`.
- Port `8080` isn't published to the internet. In Compose, the service uses `expose` instead of `ports`.
