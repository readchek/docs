// Turns Astro's static build into the output `cf deploy --prebuilt` reads,
// the same way chek.page does.
import { resolve } from "node:path"
import {
  cleanBuildOutputDir,
  writeAssets,
  writeRootConfig,
  writeWorkerConfig,
} from "@cloudflare/build-output-utils"
import config from "../cloudflare.config.ts"

const root = resolve(import.meta.dir, "..")
const dist = resolve(root, "dist")

// Astro names its bundles by content hash and the fonts carry theirs, so
// both can be cached for good. Pages always check for updates.
await Bun.write(
  resolve(dist, "_headers"),
  ["/_astro/*", "/fonts/*.woff2"]
    .map((path) => `${path}\n  Cache-Control: public, max-age=31536000, immutable\n`)
    .join("\n"),
)

await cleanBuildOutputDir(root)
await writeRootConfig(root, { accountId: config.accountId }, { isPreview: false, mode: undefined })
await writeWorkerConfig({ root, config: config.worker })
await writeAssets({ root, sourceDirectory: dist })
