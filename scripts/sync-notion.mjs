import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const NOTION_VERSION = "2022-06-28";
const token = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_DATABASE_ID;

if (!token || !databaseId) {
  throw new Error(
    "Missing NOTION_TOKEN or NOTION_DATABASE_ID. See .env.example for the required values.",
  );
}

const response = await fetch(
  `https://api.notion.com/v1/databases/${databaseId}/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    },
    body: JSON.stringify({
      sorts: [{ property: "Order", direction: "ascending" }],
      filter: {
        property: "Published",
        checkbox: { equals: true },
      },
    }),
  },
);

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Notion API error ${response.status}: ${body}`);
}

const payload = await response.json();
const works = payload.results.map((page, index) => {
  const props = page.properties;
  return {
    id: readRichText(props.Order) || String(index + 1).padStart(2, "0"),
    slug: readRichText(props.Slug),
    title: readTitle(props.Name),
    category: readSelect(props.Category) || "app",
    type: readSelect(props.Type) || "CASE STUDY",
    stack: readMultiSelect(props.Stack),
    summary: readRichText(props.Summary),
    role: readRichText(props.Role),
    year: readRichText(props.Year),
    status: readSelect(props.Status) || "Draft",
    links: {
      demo: readUrl(props.Demo),
      github: readUrl(props.GitHub),
      figma: readUrl(props.Figma),
    },
    points: readRichText(props.Points)
      .split("\n")
      .map((point) => point.trim())
      .filter(Boolean),
  };
});

const output = `export const categories = [
  { id: "all", label: "ALL", route: "#/works" },
  { id: "app", label: "APPS", route: "#/apps" },
  { id: "design", label: "DESIGN", route: "#/design" },
];

export const works = ${JSON.stringify(works, null, 2)};

export const credits = [
  ["ROLE", "Student / Frontend Developer / UI-minded Builder"],
  ["STACK", "JavaScript, TypeScript, React, Next.js, HTML, CSS"],
  ["DESIGN", "Figma, responsive layout, interaction, information design"],
  ["METHOD", "Git, accessibility, API integration, writing, documentation"],
  ["VOICE", "見た目の強さと、採用で読まれる情報の順序を両立させる。"],
];
`;

const outFile = path.resolve("src/data/works.js");
await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, output);
console.log(`Synced ${works.length} works from Notion to ${outFile}`);

function readTitle(property) {
  return property?.title?.map((item) => item.plain_text).join("") ?? "";
}

function readRichText(property) {
  if (property?.type === "rich_text") {
    return property.rich_text.map((item) => item.plain_text).join("");
  }
  if (property?.type === "number" && property.number != null) {
    return String(property.number).padStart(2, "0");
  }
  return "";
}

function readSelect(property) {
  return property?.select?.name ?? "";
}

function readMultiSelect(property) {
  return property?.multi_select?.map((item) => item.name) ?? [];
}

function readUrl(property) {
  return property?.url ?? "";
}
