---
title: Read Komga and Kavita libraries
description: Add a Komga or Kavita server as a Chek library, and write reading progress back to it.
---

An admin can add a [Komga](https://komga.org) or [Kavita](https://www.kavitareader.com) server as a library. Everyone who has the library reads what one Komga or Kavita account can see. Chek fetches pages and files from that server on each request, so the files stay only on the Komga or Kavita server.

Create an account in Komga or Kavita for Chek to use. Chek checks the credentials before it adds the library. It stores them on the server and never returns them from the API.

To add the library in the admin panel, open **Libraries** and click **Add library**. Then choose **A Komga server** or **A Kavita server**, and fill in the same details that the steps below send to the API.

## Add a Komga library

The Komga account needs the page streaming role and the file download role.

1. Create an API key for the account in Komga.
2. Add the library:

   ```sh
   curl -X POST $SERVER/api/v1/libraries \
   	-H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
   	-d '{"name": "Komga", "komga": {"url": "http://komga:25600", "apiKey": "<key>"}}'
   ```

The `url` is the address of Komga as the Chek container sees it, including any path that Komga is served under.

- To sign in with the account's email and password instead of a key, send `username` and `password`.
- To read only some Komga libraries, send their ids in `libraryIds`.

Chek reads Komga's series and the books that Komga has finished analyzing. Komga always sends whole files, even when a reader asks for a byte range.

## Add a Kavita library

The Kavita account needs the download role.

1. Copy the account's API key from its settings page in Kavita.
2. Add the library:

   ```sh
   curl -X POST $SERVER/api/v1/libraries \
   	-H "Authorization: Bearer $TOKEN" -H 'content-type: application/json' \
   	-d '{"name": "Kavita", "kavita": {"url": "http://kavita:5000", "apiKey": "<key>"}}'
   ```

To read only some Kavita libraries, send their numeric ids in `libraryIds`.

Chek makes one publication for each Kavita chapter. If the file's own metadata has no title, Chek names it by its kind. A file that holds a whole volume is "Volume 1", a single chapter is "Chapter 12", and a special keeps its name.

## Sync a library

Komga and Kavita can't tell Chek about changes, so Chek syncs on its own. A sync runs in three cases:

- When the server starts.
- Every `CHEK_SOURCE_SYNC_MINUTES` minutes. The default is 60. A value of `0` turns off the timer.
- When an admin sends `POST /api/v1/libraries/{libraryId}/scan`.

A sync reads a book again only if the book, its file, or its series changed. A book that has gone from Komga or Kavita becomes unavailable, but Chek doesn't delete it. If the book comes back, its reading position is still there. Chek keeps progress, bookmarks, highlights, and metadata edits, so a sync doesn't change them.

## Write progress back

Chek writes the reading progress of the admin who added the library back to the Komga or Kavita account. Then Komga's or Kavita's own apps resume where Chek stopped. Chek writes back only that admin's progress, because every reader of the library shares the one account.

To turn this off, send `"writeProgress": false` when you add the library.

- For Komga, Chek sends EPUB positions as Readium locators. It sends comics and PDFs as a page number.
- For Kavita, Chek sends comics and PDFs as a page number. Kavita stores a book's position in a form that a Readium locator can't express. So Chek writes a book back only when the book is finished.

When the reader reaches the last page, Chek marks the book as read. If Komga or Kavita refuses a write, Chek logs it and doesn't try again.
