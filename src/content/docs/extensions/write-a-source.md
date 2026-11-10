---
title: Write a source
description: Start a source extension with the chek command, implement search, series, chapters and pages, and build it into a repository folder.
---

A source extension teaches Chek server to read series from one site. You write it in Rust and build it to a WebAssembly component. The server runs the component in a sandbox. The component reaches only the sites that it declares.

This page takes you from an empty folder to a built source. To put the result online, read [Publish a repository](/extensions/publish-a-repository/). To run extensions on a server, read [Run extensions](/self-hosting/extensions/).

## Before you start

You need these tools:

- Rust, with the `wasm32-wasip2` target. To add the target, run `rustup target add wasm32-wasip2`.
- The `chek` command. To install it, run this command:

```sh
cargo install --git https://github.com/readchek/chek chek-cli
```

## Start a source

To make a source crate, run `chek ext new` with a name:

```sh
chek ext new my-source
cd my-source
```

The crate builds as it stands. It depends on `chek-extension`, the SDK that holds the contract's types and request helpers. Its `src/lib.rs` implements `Guest` for one type and exports it with `export_source!`.

## Describe the source

`manifest` tells the server what the source is. The server reads it without network access.

```rust
fn manifest() -> Manifest {
	Manifest {
		id: "com.example.my-source".into(),
		name: "My Source".into(),
		version: env!("CARGO_PKG_VERSION").into(),
		sites: vec!["example.com".into(), "images.example.com".into()],
		languages: vec!["en".into()],
		capabilities: vec![],
	}
}
```

- Give `id` in reverse-DNS form, with a domain that you own. The id must be unique across every repository.
- List in `sites` every host that the source fetches from, image hosts included. A request to any other host fails.
- To read a site behind a browser challenge, add `Capability::Browser` to `capabilities`. The server's admin sets up [how challenges are solved](/self-hosting/extensions/#let-extensions-get-past-site-challenges).

## Read the site

Implement these four functions. Each one returns the site's own ids, which the server passes back to you later.

| Function | What it returns |
| --- | --- |
| `search(query, page, content_ratings)` | One page of series that match `query`, and whether more pages exist |
| `series(id)` | One series: its title, cover and details |
| `chapters(series_id)` | Every chapter of the series |
| `pages(chapter_id)` | The chapter's page images, in reading order |

Return each image as a URL, with any headers that the site needs. The server fetches and caches the images. The app never contacts the site.

To fetch and parse a response, use `Get`:

```rust
let found: Value = Get::new(format!(
	"https://example.com/api/search?q={}&page={page}",
	encode(&query)
))
.cache(600)
.json()?;
```

`cache` takes seconds. The server answers a repeated request from its cache for that long. Cache listings. Don't cache a response that holds a short-lived token.

Two stores keep values between calls, and both survive a server restart. `cache` holds values that you choose. `cookies` holds the cookie jar that every request sends.

### List every release of a chapter

Each `Chapter` that you return is one release. When a site has several releases of chapter 12, return all of them. The server groups releases by `number` and shows one chapter with a choice of releases.

- Set `language` to the release's BCP 47 tag, not the series' original language.
- Set `release_group` to who released it, where the site says.
- Set `official` when the publisher released it.
- Keep `version` for a revision of the content, which changes when the pages change. A group's name doesn't belong there.

### Honor content ratings

`search` receives the content ratings that the reader chose to see. The list runs from `Safe` through `Suggestive` and `Erotica` to `Pornographic`, and it is never empty.

- If the site can filter by rating, ask it for only those ratings. Then each page of results stays full.
- Set `content_rating` on each `SeriesItem` and `Series` where the site rates its series.
- If the site doesn't rate a series, leave `content_rating` as `None`. The server keeps unrated results and drops results rated outside the reader's choice.

### Leave images as they are

`transform_image` lets a source change an image after the server fetches it. If your source doesn't change images, return `Ok(None)`, as the new crate does.

## Serve books instead of pages

If the source's chapters are books, such as EPUB or PDF files, also implement `chek_extension::ChapterContent`. Export it with `chek_extension::export_chapter_content!(YourSource)` next to `export_source!`.

- `formats` lists what the chapters come in: `ContentFormat::Images`, `Epub` or `Pdf`. The server reads it without network access.
- `read(chapter_id)` returns a `Reading`. For a book, its content is `Content::File` with an `Asset`. For image chapters, its content is `Content::Pages`.
- An `Asset` holds the URL and headers that the server downloads the file with, and the file's format. Its `id` stays the same on every call and changes when the file changes.
- For an openly licensed publication, fill `rights` with the license, an H		PS link to it, the credit it asks for, and an H		PS link to the publication's page. Readers see them with the chapter.

The server downloads a file only from the manifest's sites. A file can be up to 128 MiB and must arrive within five minutes. The server refuses a file that doesn't start as its format does, such as a sign-in page.

Respect each site's terms for automated downloads. Prefer the catalogs and mirrors that the site offers for them.

## Build the source

To build every source in the folder, run this command:

```sh
chek ext build
```

The command writes a repository to `dist`: each component, and an `index.json` that lists them. It fails if a source doesn't build or doesn't answer `manifest`.

Raise the crate's version in `Cargo.toml` for every change. A server offers an update only when the index lists a new version.

## Next steps

- To put `dist` online, read [Publish a repository](/extensions/publish-a-repository/).
- For readers' comments, chapter lists that arrive in pages, interactive pages and image transforms, read the [extension README](https://github.com/readchek/chek/blob/main/extensions/README.md).
