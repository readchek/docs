---
title: Add Chek Reader to a web app
description: Install the @readchek/reader package, show a comic, a book or a PDF in an element, and save the reading position.
---

`@readchek/reader` is Chek Reader for the web. It draws pages into an element that you give it. Your app draws the controls, fetches the content and stores the positions. The package has no framework and no dependencies, apart from pdf.js for PDFs.

To use the reader in an iPhone, iPad or Mac app, read [Add Chek Reader to an Apple app](/reader/apple/).

## Install the package

The package is not on npm. To install it, name the repository and a release tag:

```sh
bun add github:readchek/chek-reader#0.3.1
```

## Show a comic

To show a comic, make a `ComicView` with an element, the pages and your event handlers:

```ts
import { ComicView } from "@readchek/reader"

const view = new ComicView(
	element,
	{ count, load: (index, signal) => fetchPage(index, signal) },
	{
		location: (place) => save(place.locator),
		tap: () => toggleControls(),
	},
)
```

- `count` is the number of pages.
- `load` fetches one page. Pass `signal` to your request, so the view can cancel a page that it no longer needs.
- `location` fires when the reader moves. `place.locator` is the position to save.
- `tap` fires when the reader taps the middle of the page.

Position the element and give it a size. The view fills it.

`ComicView` shows one page or a spread at a time, left to right or right to left. It can also show one scrolling column, for webtoons. To let the view choose, pass `{ flow: "automatic" }` as the options. The view then scrolls a comic whose first pages look like a strip.

## Show a book

A book needs the frame files. Each part of a book opens in a sandboxed frame, which keeps the book away from your app's origin, storage and cookies.

1. Copy the files in the package's `Web/dist/frame` folder to a path on your app's origin, such as `/reader-frame/`.
2. Serve that path with this content security policy:

	```
	default-src 'none'; script-src 'self'; style-src 'unsafe-inline' blob:; img-src blob: data:; font-src blob: data:; media-src blob:; base-uri 'none'; form-action 'none'; frame-ancestors 'self'
	```

3. Open the EPUB and make a `BookView`:

	```ts
	import { BookView, Epub } from "@readchek/reader"

	const epub = await Epub.open(await response.blob())
	const view = new BookView(
		element,
		epub,
		{
			location: (place) => save(place.locator),
			tap: () => toggleControls(),
			externalLink: (url) => open(url, "_blank", "noopener"),
			error: (error) => show(error),
		},
		{ frameUrl: "/reader-frame/frame.html" },
		savedLocator,
	)
	```

`Epub.open` reads an EPUB from a `Blob`. It throws `DrmError` for an encrypted book. The reader removes a book's scripts before the book opens.

While a page has focus, your document does not see key presses or mouse moves. `BookView` passes the keys that it does not use, such as Escape, to the `key` event. It reports mouse moves over the page to the `pointer` event.

To read plain text or Markdown, open the file with `TextBook.plainText(file, fileName)` or `TextBook.markdown(file, fileName)`. Then pass the result to `BookView` in place of the EPUB.

## Show a PDF

PDFs use [pdf.js](https://github.com/mozilla/pdf.js), which the package loads only from its `@readchek/reader/pdf` entry.

1. Install `pdfjs-dist` at the version in the package's `peerDependencies`.
2. Serve the pdf.js worker from your app's origin. For PDFs that do not embed their fonts, also serve the `cmaps` and `standard_fonts` folders.
3. Open the PDF and show it in a `ComicView`:

	```ts
	const { PdfDocument } = await import("@readchek/reader/pdf")
	const pdf = await PdfDocument.open(file, {
		worker: "/pdfjs/pdf.worker.min.mjs",
		cMaps: "/pdfjs/cmaps/",
		standardFonts: "/pdfjs/standard_fonts/",
	})
	const view = new ComicView(element, pdf, events, { flow: "paged" }, savedLocator)
	```

## Save the reading position

Every view reports its place through the `location` event. `place.locator` is a `Locator`, the same JSON that the Swift package uses. A position that you save in a browser opens at the same place on iPhone.

To open at a saved position, pass the locator when you make the view. It is the fifth argument of both `ComicView` and `BookView`.

Chek server stores these locators as they are. To sync positions with a server, read [Read and sync from a client](/api/reading/).

## Read on into the next chapter

To carry the reader from one chapter into the next, give the view an element for each end:

```ts
const after = document.createElement("div")
after.textContent = `Next: ${next.title}`

const view = new ComicView(
	element,
	pages,
	{ leave: (toward) => open(toward === "after" ? next : previous) },
	{ flow: "automatic" },
	savedLocator,
	{ after },
)
```

- `ComicView` takes `{ before, after }` as its last argument. `BookView` takes the same object as its `ends` option.
- The view places `after` one turn past the last page, and `before` one turn ahead of the first page.
- When the reader turns on through an end, the `leave` event fires with `"after"` or `"before"`.
- To open a chapter at its last page, pass `"end"` as the saved position of a `ComicView`.
