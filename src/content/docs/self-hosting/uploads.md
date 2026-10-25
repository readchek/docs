---
title: Upload files
description: Add a file to a folder library over HTTP.
---

An admin can upload a file into a folder library. The library's folder must be mounted read-write.

```sh
curl -X PUT "$SERVER/api/v1/libraries/1/files/Saga/Saga%20001.cbz" \
	-H "Authorization: Bearer $TOKEN" \
	-H 'content-type: application/octet-stream' \
	--data-binary @"Saga 001.cbz"
```

The path after `files/` is where the file goes, relative to the library's folder. The server creates any folder in the path that doesn't exist.

## Rules for uploads

- The file must end in `.epub`, `.pdf`, `.cbz`, `.cbr`, `.cb7`, or `.cbt`, and its contents must match that format.
- Each part of the path must be a plain name. The server refuses `.`, `..`, names that start with `.`, and folders that link outside the library.
- An upload never replaces a file. If a file is already at the path, the server answers `409 file_exists`.
- If the server can't write to the folder, it answers `409 library_read_only`.
- `CHEK_MAX_UPLOAD_BYTES` limits each file. The default is 2 GiB. A larger file answers `413`. Set your [proxy's body limit](/self-hosting/reverse-proxy/#use-nginx) to the same size.

## What happens to the file

The server writes the upload to a hidden temporary file next to its destination, so a scan never reads a partial file. When the upload is complete, the server checks the format, moves the file into place, and adds it to the library.

If a scan of the library is running, the server waits up to 20 seconds for it to finish. After 20 seconds, it answers `202` and adds the file when the scan ends.
