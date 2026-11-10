---
title: Add Chek Reader to an Apple app
description: Add the Chek Reader Swift package to an iPhone, iPad or Mac app, show a book or comic, and save the reading position.
---

Chek Reader is the Swift package that the Chek app reads with. It has no account and no server of its own, so your app can use it too. This page shows how to add the package, show a publication, and keep the reader's place.

To use the reader in a web app, read [Add Chek Reader to a web app](/reader/web/).

## Before you start

- You build with Xcode 27 and Swift 6.4.
- Your app deploys to iOS 26, iPadOS 26 or macOS 26, or later. Mac Catalyst is not supported.

## Add the package

To add Chek Reader with Swift Package Manager, add this dependency:

```swift
dependencies: [
	.package(url: "https://github.com/readchek/chek-reader.git", from: "0.3.1"),
],
```

Then choose a product. Each format is its own product, so your app compiles only the formats that it includes.

| Product | What it adds |
| --- | --- |
| `ChekReader` | The default set: every format below, the navigator and the standard controls |
| `ChekReaderCore` | The publication model, positions, limits, errors and format detection. Every other product needs it |
| `ChekReaderEPUB` | EPUB 2 and 3, reflowable and fixed layout |
| `ChekReaderPDF` | PDF |
| `ChekReaderComics` | CBZ, CBT and webtoons |
| `ChekReaderText` | Plain text and Markdown |
| `ChekReaderMOBI` | MOBI and AZW3 without DRM |
| `ChekReaderFB2` | FictionBook, plain and zipped |
| `ChekReaderNavigator` | `ReaderController` and the content views, for an app that draws its own controls |
| `ChekReaderUI` | `ReaderView` with the standard controls |
| `ChekReaderArchives` | CBR and CB7. This product links libarchive and is not part of `ChekReader` |

## Show a publication

Register the formats once at launch. Then show a `ReaderView` with a source:

```swift
import ChekReader
import SwiftUI

@main
struct MyApp: App {
	init() {
		ReaderFormats.registerDefaults()
	}

	var body: some Scene {
		WindowGroup {
			ReaderView(source: .file(bookURL))
		}
	}
}
```

`ReaderView` draws the standard controls. A tap in the middle of the page shows the title bar and a slider through the book. The title bar holds the table of contents, search and appearance settings.

If your app links only some format products, register those modules instead:

```swift
import ChekReaderEPUB
import ChekReaderPDF

ReaderFormats.register(EPUBModule.self, PDFModule.self)
```

To read CBR and CB7, register `ArchivesModule` from `ChekReaderArchives` after the defaults.

If the reader opens a format that your app did not include, it fails with `ReaderError.formatNotIncluded`. The error's recovery suggestion names the product to add.

## Save the reading position

A reading position is a `Locator`. Its JSON matches the Readium Locator model, so you can store it as it is.

To come back to the same place, pass the saved location and keep what the reader reports:

```swift
ReaderView(
	source: .file(bookURL),
	initialLocation: savedLocation,
	preferences: savedPreferences,
	onLocationChange: { save($0) },
	onPreferencesChange: { savePreferences($0) }
)
```

A location carries the text at the start of the page. A saved location opens on the same passage after the text size or the screen changes.

## Open from other sources

A publication can come from a file, from memory, from an HTTP server, or from your own code:

```swift
.file(url)
.data(data, fileName: "book.epub")
.remote(url, RemoteOptions { request in
	var request = request
	request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
	return request
})
.remote(url, RemoteOptions(load: myLoader))
.provider(myProvider)
.pages(myPageSource)
```

- `.remote` reads EPUB and CBZ with range requests, so the reader downloads only the parts that it shows. PDF and MOBI download whole.
- `.provider` asks your code for each resource. Use it for content that your app decrypts.
- `.pages` streams page images one at a time, for a comic that a server sends page by page.

Chek Reader does not remove DRM. A protected book fails with `ReaderError.drmProtected`.

## Read a publication without showing it

To read a publication's title and structure, for example when you import a library, open it directly:

```swift
let publication = try await Publication.open(.file(bookURL))
publication.metadata.title
publication.readingOrder
publication.tableOfContents
```

A damaged file that is still readable opens. `publication.warnings` lists what the reader repaired or left out.

## Draw your own controls

To control the reader yourself, keep a `ReaderController` and show it with `NavigatorView`:

```swift
let controller = ReaderController(preferences: ReaderPreferences(fontScale: 1.2, theme: .sepia))
try await controller.open(.file(bookURL), at: savedLocation)

controller.location?.locations.totalProgression
await controller.goForward()
```

You can reuse the standard parts one at a time. `ReaderControls`, `TableOfContentsView`, `SearchView` and `AppearanceView` each take a `ReaderController`.

## Search a book

To search, call `search(for:options:)` on the controller. Each result is a `Locator` with the matched text and the words around it.

```swift
let results = try await controller.search(for: "lighthouse", options: SearchOptions(caseSensitive: false, limit: 100))
await controller.go(to: results[0])
```

A search reads every chapter, so run it away from work that the reader waits on. Comics return no results.

## Read on into the next chapter

To give the end of a chapter a page of its own, add `readerEdgePages(start:end:content:)` around `NavigatorView`:

```swift
NavigatorView(controller: controller)
	.readerEdgePages(start: hasPrevious ? .through : .none, end: hasNext ? .through : .stop) { edge in
		ChapterEndView(edge: edge)
	}
	.onChange(of: controller.turnsPastEnd) {
		openNextChapter()
	}
	.onChange(of: controller.turnsPastStart) {
		Task { try await controller.open(previousChapter, fromEnd: true) }
	}
```

- With `.through`, one more turn goes past the end page and adds one to `turnsPastEnd` or `turnsPastStart`.
- With `.stop`, the end page is as far as the reader goes.
- `open(_:fromEnd:)` with `fromEnd: true` opens a chapter at its last page, for a reader who turns back into it.

PDFs do not have end pages or report these turns. Your app handles the ends of a PDF itself.
