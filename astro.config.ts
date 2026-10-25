import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"
import starlightOpenAPI, { openAPISidebarGroups } from "starlight-openapi"

// The server release these pages describe. The API reference is built from
// that release's openapi.yaml, so raise this when the guides catch up with a
// new release, not before.
const chekRelease = "0.3.0"

export default defineConfig({
  site: "https://docs.chek.page",
  integrations: [
    starlight({
      title: "Chek Docs",
      description:
        "Run your own Chek server, build on its API, write source extensions and embed Chek Reader.",
      logo: { src: "./src/assets/mark.svg", alt: "Chek" },
      favicon: "/favicon.svg",
      customCss: ["./src/styles/brand.css"],
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/readchek" }],
      editLink: { baseUrl: "https://github.com/readchek/docs/edit/main/" },
      plugins: [
        starlightOpenAPI([
          {
            base: "api/reference",
            schema: `https://raw.githubusercontent.com/readchek/chek/${chekRelease}/openapi.yaml`,
            sidebar: { label: "Reference", operations: { badges: true } },
          },
        ]),
      ],
      sidebar: [
        {
          label: "Get started",
          items: ["get-started/introduction", "get-started/quick-start"],
        },
        {
          label: "Self-hosting",
          items: [
            "self-hosting/install",
            "self-hosting/first-steps",
            "self-hosting/configuration",
            "self-hosting/reverse-proxy",
            "self-hosting/users",
            "self-hosting/sign-in-providers",
            "self-hosting/komga-and-kavita",
            "self-hosting/opds",
            "self-hosting/uploads",
            "self-hosting/extensions",
            "self-hosting/updating-and-backups",
            "self-hosting/logs",
            "self-hosting/troubleshooting",
          ],
        },
        {
          label: "API",
          items: ["api/overview", "api/reading", ...openAPISidebarGroups],
        },
      ],
    }),
  ],
})
