import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const script = pathToFileURL(path.resolve("scripts/sync-notion.mjs")).href;
const text = (value) => ({
  type: "rich_text",
  rich_text: [{ plain_text: value }],
});
const page = (id, slug, published = true) => ({
  id,
  properties: {
    Name: { type: "title", title: [{ plain_text: id }] },
    Slug: text(slug),
    Order: { type: "number", number: 1 },
    Category: { select: { name: "app" } },
    Year: { type: "number", number: 2026 },
    Published: { checkbox: published },
  },
});

async function runSync(t, fixtures) {
  const directory = await mkdtemp(path.join(tmpdir(), "portfolio-cms-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(path.join(directory, "src/data"), { recursive: true });
  await writeFile(
    path.join(directory, "src/data/works.js"),
    "original snapshot",
  );
  const source = `
    const fixtures = ${JSON.stringify(fixtures)};
    globalThis.fetch = async (input, options = {}) => {
      const url = String(input);
      if (!url.startsWith('https://api.notion.com/')) return new Response(new Uint8Array([137,80,78,71]), {headers:{'content-type':'image/png'}});
      const body = options.body ? JSON.parse(options.body) : null;
      if (url.endsWith('/databases/db')) return Response.json({properties:{Featured:{type:'checkbox'}}});
      if (url.endsWith('/query')) {
        if (body.filter?.property !== 'Published' || body.filter?.checkbox?.equals !== true) throw Error('missing publishing gate');
        const index = body.start_cursor ? 1 : 0;
        return Response.json({results:fixtures.pages[index] || [],has_more:index===0 && fixtures.pages.length>1,next_cursor:index===0 && fixtures.pages.length>1?'next':null});
      }
      return Response.json({results:fixtures.blocks || [],has_more:false});
    };
    await import(${JSON.stringify(script)});
  `;
  const result = spawnSync(process.execPath, ["--input-type=module"], {
    cwd: directory,
    input: source,
    encoding: "utf8",
    env: {
      ...process.env,
      NOTION_TOKEN: "test-private-token",
      NOTION_DATABASE_ID: "db",
    },
  });
  const output = await readFile(
    path.join(directory, "src/data/works.js"),
    "utf8",
  );
  const works =
    result.status === 0
      ? JSON.parse(
          output.match(
            /export const works = ([\s\S]*?);\n\nexport const credits/,
          )[1],
        )
      : null;
  return { result, output, works, directory };
}

test("pagination publishes later pages, optional featured and actual body content", async (t) => {
  const first = page("one", "one");
  first.properties.Featured = { checkbox: true };
  const { result, works } = await runSync(t, {
    pages: [[first], [page("two", "two")]],
    blocks: [
      {
        id: "heading",
        type: "heading_2",
        heading_2: { rich_text: [{ plain_text: "System architecture" }] },
      },
    ],
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    works.map((work) => work.slug),
    ["one", "two"],
  );
  assert.equal(works[0].featured, true);
  assert.equal(works[1].featured, false);
  assert.equal(works[0].year, "2026");
  assert.equal(works[0].body[0].richText[0].text, "System architecture");
});

test("an unpublished record from API fails closed without replacing existing snapshot", async (t) => {
  const { result, output } = await runSync(t, {
    pages: [[page("private", "private", false)]],
  });
  assert.notEqual(result.status, 0);
  assert.equal(output, "original snapshot");
});

test("colliding normalized slugs cannot silently replace another work", async (t) => {
  const { result, output } = await runSync(t, {
    pages: [[page("one", "Same Slug"), page("two", "same-slug")]],
  });
  assert.notEqual(result.status, 0);
  assert.equal(output, "original snapshot");
});

test("expiring media is copied locally and unsafe links cannot reach browser data", async (t) => {
  const item = page("media", "media");
  item.properties.Thumbnail = text(
    "https://files.notion.so/image.png?X-Amz-Signature=private-signature",
  );
  item.properties.GitHub = { url: "javascript:alert(1)" };
  item.properties.Images = text("/images/%2e%2e/private.png");
  const { result, works, output, directory } = await runSync(t, {
    pages: [[item]],
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(works[0].thumbnail, /^\/images\/notion\/[a-f0-9]{64}\.png$/);
  assert.deepEqual(works[0].images, []);
  assert.equal(works[0].links.github, "");
  assert.equal(output.includes("private-signature"), false);
  assert.equal(output.includes("test-private-token"), false);
  const bytes = await readFile(
    path.join(directory, "public", works[0].thumbnail),
  );
  assert.deepEqual([...bytes], [137, 80, 78, 71]);
});
