import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const NOTION_VERSION = "2022-06-28";
const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID;
const siteDatabaseId = process.env.NOTION_SITE_DATABASE_ID;
const outFile = path.resolve("src/data/works.js");
const siteOutFile = path.resolve("src/data/site.js");
const mediaDirectory = path.resolve("public/images/notion");
const downloadedMedia = new Map();
const stagedMedia = new Set();
let stagingDirectory;

if (!token || !databaseId || !siteDatabaseId) {
  throw new Error(
    "Missing NOTION_TOKEN, NOTION_DATABASE_ID, or NOTION_SITE_DATABASE_ID. See .env.example for the required values.",
  );
}

try {
  const database = await notion(`databases/${encodeURIComponent(databaseId)}`);
  const hasFeatured = database.properties?.Featured?.type === "checkbox";
  if (!hasFeatured) {
    console.warn(
      "Notion Featured checkbox is absent; featured defaults to false. No schema changes were made.",
    );
  }

  const siteDatabase = await notion(
    `databases/${encodeURIComponent(siteDatabaseId)}`,
  );
  const sitePropertyTypes = {
    Name: "title",
    Section: "select",
    Key: "rich_text",
    Heading: "rich_text",
    Label: "rich_text",
    Text: "rich_text",
    Detail: "rich_text",
    LinkLabel: "rich_text",
    URL: "url",
    Order: "number",
    Published: "checkbox",
  };
  for (const [name, type] of Object.entries(sitePropertyTypes)) {
    if (siteDatabase.properties?.[name]?.type !== type) {
      throw new Error(`Site Content property ${name} must have type ${type}.`);
    }
  }

  const pages = await paginate(
    `databases/${encodeURIComponent(databaseId)}/query`,
    {
      sorts: [{ property: "Order", direction: "ascending" }],
      filter: { property: "Published", checkbox: { equals: true } },
    },
  );
  assertPublished(pages);
  pages.sort(comparePages);
  const sitePages = await paginate(
    `databases/${encodeURIComponent(siteDatabaseId)}/query`,
    {
      sorts: [{ property: "Order", direction: "ascending" }],
      filter: { property: "Published", checkbox: { equals: true } },
    },
  );
  assertPublished(sitePages);
  sitePages.sort(comparePages);
  const siteKeys = new Set();
  const siteSections = new Set([
    "Site",
    "Home",
    "Practice",
    "About",
    "Contact",
  ]);
  const siteEntries = sitePages.map((page) => {
    const props = page.properties;
    for (const [name, type] of Object.entries(sitePropertyTypes)) {
      const property = props[name];
      if (
        property?.type !== type ||
        (["title", "rich_text"].includes(type) &&
          (!Array.isArray(property[type]) ||
            property[type].some(
              (item) =>
                typeof (item.plain_text ?? item.text?.content) !== "string",
            ))) ||
        (type === "checkbox" && typeof property.checkbox !== "boolean") ||
        (type === "number" &&
          property.number !== null &&
          !Number.isFinite(property.number)) ||
        (type === "url" &&
          property.url !== null &&
          typeof property.url !== "string")
      ) {
        throw new Error(`Invalid Site Content property ${name}.`);
      }
    }
    const key = readText(props.Key).trim();
    if (!key || siteKeys.has(key)) {
      throw new Error(
        "Published Site Content must have nonempty, unique Keys.",
      );
    }
    siteKeys.add(key);
    const section = readSelect(props.Section);
    if (!siteSections.has(section)) {
      throw new Error("Published Site Content must have a valid Section.");
    }
    return {
      page,
      content: {
        key,
        section,
        heading: readText(props.Heading),
        label: readText(props.Label),
        text: readText(props.Text),
        detail: readText(props.Detail),
        linkLabel: readText(props.LinkLabel),
        url: safeExternalUrl(props.URL.url),
        order: props.Order.number,
        body: [],
      },
    };
  });
  const siteContent = Object.fromEntries(
    siteEntries.map(({ content }) => [content.key, content]),
  );
  for (const key of ["site.identity", "home.hero", "about.intro"]) {
    if (!Object.hasOwn(siteContent, key) || !siteContent[key].heading.trim()) {
      throw new Error(
        `Required Site Content ${key} needs a published heading.`,
      );
    }
  }

  const slugs = new Set();
  const entries = pages.map((page, index) => {
    const props = page.properties;
    const title = readText(props.Name).trim();
    const slug = makeSlug(readText(props.Slug));
    if (!slug || slugs.has(slug)) {
      throw new Error(
        "Published works must have nonempty, unique normalized slugs.",
      );
    }
    slugs.add(slug);
    return {
      page,
      work: {
        id: (readText(props.Order) || String(index + 1)).padStart(2, "0"),
        slug,
        title,
        category: readSelect(props.Category),
        type: readSelect(props.Type),
        stack: props.Stack?.multi_select?.map((item) => item.name) ?? [],
        summary: readText(props.Summary),
        role: readText(props.Role),
        year: readText(props.Year),
        status: readSelect(props.Status),
        links: {
          demo: safeExternalUrl(props.Demo?.url),
          github: safeExternalUrl(props.GitHub?.url),
          figma: safeExternalUrl(props.Figma?.url),
        },
        thumbnail: "",
        images: [],
        points: readText(props.Points)
          .split("\n")
          .map((point) => point.trim())
          .filter(Boolean),
        featured: hasFeatured && props.Featured?.checkbox === true,
        body: [],
      },
    };
  });

  // Stage all downloads and data before replacing any published output.
  await mkdir(path.dirname(mediaDirectory), { recursive: true });
  stagingDirectory = await mkdtemp(
    path.join(path.dirname(mediaDirectory), ".notion-sync-"),
  );
  for (const { page, work } of entries) {
    work.thumbnail = (await readImages(page.properties.Thumbnail))[0] ?? "";
    work.images = await readImages(page.properties.Images);
    work.body = await readBlocks(page.id);
  }
  for (const { page, content } of siteEntries) {
    content.body = await readBlocks(page.id);
  }
  const works = entries.map(({ work }) => work);
  const categories = [
    { id: "all", label: "ALL", route: "/work" },
    ...[...new Set(works.map((work) => work.category).filter(Boolean))]
      .sort(compare)
      .map((id) => ({
        id,
        label: id === "app" ? "APPS" : id.toUpperCase(),
        route: `/work?category=${encodeURIComponent(id)}`,
      })),
  ];
  const output = `export const categories = ${JSON.stringify(categories, null, 2)};\n\nexport const works = ${JSON.stringify(works, null, 2)};\n`;
  const siteOutput = `export const siteContent = Object.fromEntries(${JSON.stringify(Object.entries(siteContent), null, 2)});\n`;
  const stagedOutput = path.join(stagingDirectory, "works.js");
  const stagedSiteOutput = path.join(stagingDirectory, "site.js");
  await writeFile(stagedOutput, output);
  await writeFile(stagedSiteOutput, siteOutput);
  if (stagedMedia.size > 0) {
    await mkdir(mediaDirectory, { recursive: true });
    for (const name of stagedMedia) {
      await rename(
        path.join(stagingDirectory, name),
        path.join(mediaDirectory, name),
      );
    }
  }
  await mkdir(path.dirname(outFile), { recursive: true });
  await rename(stagedOutput, outFile);
  await rename(stagedSiteOutput, siteOutFile);
  console.log(
    `Synced ${works.length} published works and ${siteEntries.length} Site Content records from Notion.`,
  );
} finally {
  if (stagingDirectory)
    await rm(stagingDirectory, { recursive: true, force: true });
}

async function notion(endpoint, body) {
  let response;
  try {
    response = await fetch(`https://api.notion.com/v1/${endpoint}`, {
      method: body ? "POST" : "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new Error(
      "Notion request failed; existing generated content was preserved.",
    );
  }
  if (!response.ok) {
    // API error bodies can contain private page content or signed URLs.
    throw new Error(
      `Notion API error ${response.status}; existing generated content was preserved.`,
    );
  }
  return response.json();
}

async function paginate(endpoint, query) {
  const results = [];
  let cursor;
  do {
    const payload = query
      ? await notion(endpoint, {
          ...query,
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        })
      : await notion(
          `${endpoint}?page_size=100${cursor ? `&start_cursor=${encodeURIComponent(cursor)}` : ""}`,
        );
    if (
      !Array.isArray(payload.results) ||
      (payload.has_more && !payload.next_cursor)
    ) {
      throw new Error(
        "Invalid Notion pagination response; refusing partial output.",
      );
    }
    results.push(...payload.results);
    cursor = payload.has_more ? payload.next_cursor : null;
  } while (cursor);
  return results;
}

async function readBlocks(parentId) {
  const blocks = await paginate(
    `blocks/${encodeURIComponent(parentId)}/children`,
  );
  const normalized = [];
  for (const block of blocks) {
    if (block.archived || block.in_trash) continue;
    const data = block[block.type] ?? {};
    const item = { id: block.id, type: block.type };
    if (Array.isArray(data.rich_text)) item.richText = richText(data.rich_text);
    if (Array.isArray(data.caption)) item.caption = richText(data.caption);
    if (block.type === "code") item.language = data.language ?? "plain text";
    if (block.type === "to_do") item.checked = data.checked === true;
    if (block.type === "callout" && data.icon?.type === "emoji")
      item.icon = data.icon.emoji;
    if (["image", "video"].includes(block.type)) {
      item.url = await mediaUrl(
        data.file?.url ?? data.external?.url ?? "",
        data.type === "file",
      );
    } else if (["bookmark", "link_preview", "embed"].includes(block.type)) {
      item.url = safeExternalUrl(data.url);
    } else if (block.type === "link_to_page") {
      const pageId = data.page_id ?? data.database_id;
      item.url = pageId
        ? safeExternalUrl(
            `https://www.notion.so/${encodeURIComponent(pageId.replaceAll("-", ""))}`,
          )
        : "";
    }
    if (block.has_children) item.children = await readBlocks(block.id);
    normalized.push(item);
  }
  return normalized;
}

function richText(items) {
  return items.map((item) => {
    const annotations = item.annotations ?? {};
    const color =
      /^(default|gray|brown|orange|yellow|green|blue|purple|pink|red)(_background)?$/.test(
        annotations.color ?? "",
      )
        ? annotations.color
        : "default";
    return {
      text:
        item.plain_text ??
        item.text?.content ??
        item.equation?.expression ??
        "",
      href: safeExternalUrl(item.href ?? item.text?.link?.url) || null,
      annotations: {
        bold: annotations.bold === true,
        italic: annotations.italic === true,
        strikethrough: annotations.strikethrough === true,
        underline: annotations.underline === true,
        code: annotations.code === true,
        color,
      },
    };
  });
}

function readText(property) {
  if (property?.type === "number" && property.number != null)
    return String(property.number);
  const items = property?.title ?? property?.rich_text ?? [];
  return items
    .map((item) => item.plain_text ?? item.text?.content ?? "")
    .join("");
}

function readSelect(property) {
  return property?.select?.name ?? "";
}
function assertPublished(pages) {
  if (pages.some((page) => page.properties?.Published?.checkbox !== true)) {
    throw new Error(
      "Notion returned an unpublished page; refusing to generate public data.",
    );
  }
}

function comparePages(a, b) {
  const difference = orderOf(a) - orderOf(b);
  return (Number.isNaN(difference) ? 0 : difference) || compare(a.id, b.id);
}

function orderOf(page) {
  const value = page.properties?.Order?.number;
  return typeof value === "number" && Number.isFinite(value) ? value : Infinity;
}

function compare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function makeSlug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function httpUrl(value) {
  if (typeof value !== "string" || !/^https?:\/\//i.test(value.trim()))
    return null;
  try {
    const url = new URL(value.trim());
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url
      : null;
  } catch {
    return null;
  }
}

function hasSigningParameters(url) {
  return [...url.searchParams.keys()].some((key) =>
    /^(x-amz-|x-goog-|signature$|awsaccesskeyid$|googleaccessid$|expires$|policy$|key-pair-id$)/i.test(
      key,
    ),
  );
}

function safeExternalUrl(value) {
  const url = httpUrl(value);
  return url && !hasSigningParameters(url) ? url.href : "";
}

function localImagePath(value) {
  try {
    const decoded = decodeURIComponent(value);
    if (!decoded.startsWith("/images/") || /[\\?#%\p{Cc}]/u.test(decoded))
      return "";
    if (
      decoded
        .split("/")
        .slice(1)
        .some((part) => !part || part === "." || part === "..")
    )
      return "";
    return encodeURI(decoded);
  } catch {
    return "";
  }
}

async function readImages(property) {
  const sources =
    property?.type === "files"
      ? property.files.map((file) => ({
          url: file.file?.url ?? file.external?.url ?? "",
          uploaded: file.type === "file",
        }))
      : (property?.type === "url"
          ? [property.url]
          : readText(property).split("\n")
        )
          .filter(Boolean)
          .map((url) => ({ url, uploaded: false }));
  const images = [];
  for (const source of sources) {
    const url = await mediaUrl(source.url, source.uploaded);
    if (url) images.push(url);
  }
  return images;
}

async function mediaUrl(value, uploaded = false) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("/")) return localImagePath(trimmed);
  const url = httpUrl(trimmed);
  if (!url) return "";
  const notionHost =
    /(^|\.)(notion\.so|notion\.site|notionusercontent\.com|amazonaws\.com)$/.test(
      url.hostname,
    );
  if (!uploaded && !notionHost && !hasSigningParameters(url)) return url.href;
  if (downloadedMedia.has(url.href)) return downloadedMedia.get(url.href);
  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  } catch {
    throw new Error(
      "Notion media download failed; existing generated content was preserved.",
    );
  }
  if (!response.ok)
    throw new Error(
      `Notion media download failed (${response.status}); refusing partial output.`,
    );
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers
    .get("content-type")
    ?.split(";")[0]
    .trim()
    .toLowerCase();
  const extensions = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/svg+xml": ".svg",
    "image/heic": ".heic",
    "image/heif": ".heif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov",
    "video/ogg": ".ogv",
  };
  const pathnameExtension = path.extname(url.pathname).toLowerCase();
  const extension =
    extensions[contentType] ??
    (Object.values(extensions).includes(pathnameExtension)
      ? pathnameExtension
      : "");
  if (!extension || !bytes.length)
    throw new Error(
      "Notion media is empty or has an unsupported format; refusing partial output.",
    );
  const filename = `${createHash("sha256").update(bytes).digest("hex")}${extension}`;
  if (!stagedMedia.has(filename)) {
    await writeFile(path.join(stagingDirectory, filename), bytes);
    stagedMedia.add(filename);
  }
  const result = `/images/notion/${filename}`;
  downloadedMedia.set(url.href, result);
  return result;
}
