import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { siteContent } from "./src/data/site.js";

function escapeHtml(value) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "notion-site-metadata",
      transformIndexHtml: {
        order: "pre",
        handler(html) {
          const identity = siteContent["site.identity"];
          const title = identity.detail
            ? `${identity.detail} — ${identity.heading}`
            : identity.heading;
          const metadata = [
            `<title>${escapeHtml(title)}</title>`,
            `<meta name="description" content="${escapeHtml(identity.text)}" />`,
            '<meta property="og:type" content="website" />',
            `<meta property="og:title" content="${escapeHtml(title)}" />`,
            `<meta property="og:description" content="${escapeHtml(identity.text)}" />`,
          ].join("\n    ");
          return html.replace("</head>", `    ${metadata}\n  </head>`);
        },
      },
    },
  ],
});
