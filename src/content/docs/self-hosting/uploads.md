---
title: Uploads
description: Let admins add files to a folder library over HTTP.
---

Admins can upload a file into a folder library by path:

```sh
curl -X PUT "$SERVER/api/v1/libraries/1/files/Saga/Saga%20001.cbz" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'content-type: application/octet-stream' \
  --data-binary @"Saga 001.cbz"
```

- Files must end in `.epub`, `.pdf`, `.cbz`, `.cbr`, `.cb7` or `.cbt`. Missing folders on the path are created.
- The library's folder must be mounted read-write. Otherwise uploads answer `409 library_read_only`.
- `CHEK_MAX_UPLOAD_BYTES` caps each file, 2 GiB by default; larger files answer `413`. Raise your [proxy's body limit](/self-hosting/reverse-proxy/) to match.
- The file streams to a hidden temporary file beside its destination, so a scan never sees half a file. It must match its extension, and is then moved into place and added to the library.
- Uploads never replace a file. A path that's taken answers `409 file_exists`.
- Every part of the path must be a plain name, with no `.`, `..` or names starting with `.`. Folders that lead outside it through a link are refused.
- If a scan of the library is running, the upload waits up to 20 seconds for it, then answers `202` and finishes recording the file in the background.
