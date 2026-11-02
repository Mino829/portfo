import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "vite";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const dist = resolve(projectRoot, "dist");
const template = await readFile(resolve(dist, "index.html"), "utf8");
const rootMarker = '<div id="root"></div>';
if (!template.includes(rootMarker)) {
  throw new Error(
    "Prerender requires the original Vite dist/index.html. Run vite build first.",
  );
}

function escapeHtml(value) {
  return String(value ?? "").replace(
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

function pageHtml({ html, title, description }, year) {
  const metadata = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
  ].join("\n    ");
  return template
    .replace(/<title>[^]*?<\/title>/gi, "")
    .replace(
      /<meta\s+(?:name|property)=["'](?:description|og:title|og:description)["'][^>]*>/gi,
      "",
    )
    .replace("</head>", () => `    ${metadata}\n  </head>`)
    .replace(
      rootMarker,
      () => `<div id="root" data-render-year="${year}">${html}</div>`,
    );
}

const temp = await mkdtemp(resolve(projectRoot, ".prerender-"));
try {
  await build({
    root: projectRoot,
    build: {
      ssr: resolve(projectRoot, "src/entry-server.jsx"),
      outDir: temp,
      emptyOutDir: true,
      copyPublicDir: false,
      rollupOptions: {
        output: { entryFileNames: "entry-server.mjs" },
      },
    },
  });
  const { render, routes } = await import(
    pathToFileURL(resolve(temp, "entry-server.mjs")).href
  );
  const year = new Date().getFullYear();
  for (const pathname of routes) {
    const destination = resolve(
      dist,
      pathname === "/" ? "index.html" : `${pathname.slice(1)}.html`,
    );
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, pageHtml(render(pathname, year), year));
    console.log(`Prerendered ${pathname}`);
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}
