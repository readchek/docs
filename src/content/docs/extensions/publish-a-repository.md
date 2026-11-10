---
title: Publish a repository
description: Put a built extension repository on Cloudflare Workers behind a token with chek ext deploy, add it to a server, and publish updates.
---

An extension repository is an `index.json` file and the components that it lists, served over HTTPS. A server installs extensions from repositories. This page puts a repository that you built on Cloudflare Workers, behind a token.

You need a built repository in `dist`. To make one, read [Write a source](/extensions/write-a-source/). You also need Node.js, because the deploy runs Cloudflare's `wrangler`.

## Deploy the repository

To deploy `dist`, run this command in the source's folder:

```sh
chek ext deploy cloudflare
```

The first deploy does three things:

1. It signs you in to Cloudflare, if you aren't signed in.
2. It makes a Worker named after the current folder, and sets a random token on it.
3. It prints the repository's address and the token.

The command prints the token once. Save it. The Worker's files are in `.chek/cloudflare`.

These options change the deploy:

| Option | What it does |
| --- | --- |
| `--dir <folder>` | Deploys another folder. The default is `dist` |
| `--worker <name>` | Names the Worker. The default is the current folder's name |
| `--public` | Serves the repository without a token, to anyone with the address |
| `--rotate-token` | Replaces the token. Every server that uses the old token loses access |

## Add the repository to a server

Add the address and the token to your server as a repository. An admin adds a server-wide repository in the admin panel, under **Extensions**. [Add an extension repository](/self-hosting/extensions/#add-an-extension-repository) explains the two kinds of repository and who can add them.

The server sends the token only to the repository's own origin.

## Publish an update

To publish a change, follow these steps:

1. Raise the source's version in its `Cargo.toml`.
2. Run `chek ext build`.
3. Run `chek ext deploy cloudflare`.

Deploying again keeps the token. Each server reads the repository's index every six hours and then offers the new version as an update.

## Host the repository elsewhere

A repository is static files, so any HTTPS host can serve `dist`. A private repository can sit behind a bearer token, a user name and password, or a header of its own. To write `index.json` for a folder of components that you built another way, run `chek ext index <folder>`.

[Extension repositories](https://github.com/readchek/chek/blob/main/docs/extension-repositories.md) describes the format of `index.json` and how to keep builds for older servers.
