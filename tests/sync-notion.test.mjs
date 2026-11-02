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
const sitePage = (id, key, overrides = {}) => ({
  id,
  properties: {
    Name: { type: "title", title: [{ plain_text: id }] },
    Section: { type: "select", select: { name: "About" } },
    Key: text(key),
    Heading: text(`Heading for ${id}`),
    Label: text(""),
    Text: text(""),
    Detail: text(""),
    LinkLabel: text(""),
    URL: { type: "url", url: null },
    Order: { type: "number", number: 1 },
    Published: { type: "checkbox", checkbox: true },
    ...overrides,
  },
});
const requiredSitePages = () => [
  sitePage("identity", "site.identity"),
  sitePage("hero", "home.hero"),
  sitePage("intro", "about.intro"),
];

async function runSync(t, fixtures) {
  const directory = await mkdtemp(path.join(tmpdir(), "portfolio-cms-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(path.join(directory, "src/data"), { recursive: true });
  await writeFile(
    path.join(directory, "src/data/works.js"),
    "original snapshot",
  );
  await writeFile(
    path.join(directory, "src/data/site.js"),
    "original site snapshot",
  );
  const source = `
    const fixtures = ${JSON.stringify({
      ...fixtures,
      sitePages: fixtures.sitePages ?? [requiredSitePages()],
    })};
    const sitePropertyTypes = ${JSON.stringify(sitePropertyTypes)};
    globalThis.fetch = async (input, options = {}) => {
      const url = String(input);
      if (fixtures.failEndpoint && url.includes(fixtures.failEndpoint)) return new Response(null, {status:503});
      if (!url.startsWith('https://api.notion.com/')) return new Response(new Uint8Array([137,80,78,71]), {headers:{'content-type':'image/png'}});
      const body = options.body ? JSON.parse(options.body) : null;
      if (url.endsWith('/databases/db')) return Response.json({properties:{Featured:{type:'checkbox'}}});
      if (url.endsWith('/databases/site-db')) return Response.json({properties:{
        ...Object.fromEntries(Object.entries(sitePropertyTypes).map(([name,type]) => [name,{type}])),
        ...fixtures.siteSchema,
      }});
      if (url.endsWith('/query')) {
        if (body.filter?.property !== 'Published' || body.filter?.checkbox?.equals !== true) throw Error('missing publishing gate');
        const index = body.start_cursor ? 1 : 0;
        const site = url.endsWith('/databases/site-db/query');
        const batches = site ? fixtures.sitePages : fixtures.pages;
        let results = batches[index] || [];
        if (site && !fixtures.siteReturnsUnpublished) results = results.filter(page => page.properties.Published.checkbox === true);
        return Response.json({results,has_more:index===0 && batches.length>1,next_cursor:index===0 && batches.length>1?'next':null});
      }
      const blockId = decodeURIComponent(new URL(url).pathname.split('/')[3]);
      return Response.json({results:fixtures.blocksById?.[blockId] ?? fixtures.blocks ?? [],has_more:false});
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
      NOTION_SITE_DATABASE_ID: fixtures.omitSiteDatabaseId ? "" : "site-db",
    },
  });
  const output = await readFile(
    path.join(directory, "src/data/works.js"),
    "utf8",
  );
  const siteOutput = await readFile(
    path.join(directory, "src/data/site.js"),
    "utf8",
  );
  const generated =
    result.status === 0
      ? await import(
          `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`
        )
      : null;
  const generatedSite =
    result.status === 0
      ? await import(
          `data:text/javascript;base64,${Buffer.from(siteOutput).toString("base64")}`
        )
      : null;
  return {
    result,
    output,
    siteOutput,
    works: generated?.works,
    siteContent: generatedSite?.siteContent,
    directory,
  };
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

test("Site Content paginates, orders unset values last, and excludes unpublished rows", async (t) => {
  const contact = sitePage("z-contact", "contact.mastodon", {
    Order: { type: "number", number: 10 },
  });
  const credit = sitePage("a-credit", "about.credit.research", {
    Order: { type: "number", number: 10 },
  });
  const hidden = sitePage("private", "contact.private", {
    Published: { type: "checkbox", checkbox: false },
    Text: text("DO NOT PUBLISH"),
  });
  const unordered = sitePage("unordered", "contact.unordered", {
    Order: { type: "number", number: null },
  });
  const { result, siteContent, siteOutput } = await runSync(t, {
    pages: [[]],
    sitePages: [
      [contact, hidden, ...requiredSitePages()],
      [unordered, credit],
    ],
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(Object.keys(siteContent), [
    "home.hero",
    "site.identity",
    "about.intro",
    "about.credit.research",
    "contact.mastodon",
    "contact.unordered",
  ]);
  assert.equal(Object.hasOwn(siteContent, "contact.private"), false);
  assert.equal(siteOutput.includes("DO NOT PUBLISH"), false);
});

test("duplicate and empty Site Content Keys preserve both snapshots", async (t) => {
  for (const key of ["home.hero", " \n "]) {
    const { result, output, siteOutput } = await runSync(t, {
      pages: [[page("work", "work")]],
      sitePages: [[...requiredSitePages(), sitePage("invalid", key)]],
    });
    assert.notEqual(result.status, 0);
    assert.equal(output, "original snapshot");
    assert.equal(siteOutput, "original site snapshot");
  }
});

test("each required record must be published and have a nonblank heading", async (t) => {
  for (const key of ["site.identity", "home.hero", "about.intro"]) {
    for (const mode of ["missing", "unpublished", "blank"]) {
      const records = requiredSitePages();
      const record = records.find(
        (item) => item.properties.Key.rich_text[0].plain_text === key,
      );
      if (mode === "missing") records.splice(records.indexOf(record), 1);
      if (mode === "unpublished") record.properties.Published.checkbox = false;
      if (mode === "blank") record.properties.Heading = text(" \n ");
      const { result, output, siteOutput } = await runSync(t, {
        pages: [[page("work", "work")]],
        sitePages: [records],
      });
      assert.notEqual(result.status, 0, `${key}: ${mode}`);
      assert.equal(output, "original snapshot");
      assert.equal(siteOutput, "original site snapshot");
    }
  }
});

test("an unpublished Site Content response fails closed", async (t) => {
  const { result, output, siteOutput } = await runSync(t, {
    pages: [[]],
    sitePages: [
      [
        ...requiredSitePages(),
        sitePage("private", "contact.private", {
          Published: { type: "checkbox", checkbox: false },
        }),
      ],
    ],
    siteReturnsUnpublished: true,
  });
  assert.notEqual(result.status, 0);
  assert.equal(output, "original snapshot");
  assert.equal(siteOutput, "original site snapshot");
});

test("Site Content schema and malformed Key types fail without replacing snapshots", async (t) => {
  const cases = [
    { siteSchema: { Heading: { type: "title" } } },
    {
      sitePages: [
        [
          ...requiredSitePages(),
          sitePage("bad-key", "unused", {
            Key: { type: "number", number: 123 },
          }),
        ],
      ],
    },
  ];
  for (const invalid of cases) {
    const { result, output, siteOutput } = await runSync(t, {
      pages: [[]],
      ...invalid,
    });
    assert.notEqual(result.status, 0);
    assert.equal(output, "original snapshot");
    assert.equal(siteOutput, "original site snapshot");
  }
});

test("unsafe contact URLs are excluded without blocking published content", async (t) => {
  const urls = [
    "javascript:alert(1)",
    "data:text/html,unsafe",
    "/contact",
    "https://user:secret@example.com",
    "https://example.com/?X-Amz-Signature=private",
    "https://example.com/profile",
  ];
  const { result, siteContent, siteOutput } = await runSync(t, {
    pages: [[]],
    sitePages: [
      [
        ...requiredSitePages(),
        ...urls.map((url, index) =>
          sitePage(`contact-${index}`, `contact.profile-${index}`, {
            URL: { type: "url", url },
          }),
        ),
      ],
    ],
  });
  assert.equal(result.status, 0, result.stderr);
  for (let index = 0; index < urls.length - 1; index++) {
    assert.equal(siteContent[`contact.profile-${index}`].url, "");
  }
  assert.equal(siteContent["contact.profile-5"].url, urls[5]);
  assert.equal(siteOutput.includes("secret"), false);
  assert.equal(siteOutput.includes("private"), false);
});

test("Site Content uses recursive normalized body and staged local media", async (t) => {
  const { result, siteContent, directory } = await runSync(t, {
    pages: [[]],
    blocksById: {
      intro: [
        {
          id: "toggle",
          type: "toggle",
          has_children: true,
          toggle: {
            rich_text: [{ plain_text: "Notes", annotations: { bold: true } }],
          },
        },
        {
          id: "image",
          type: "image",
          image: {
            type: "file",
            file: {
              url: "https://files.notion.so/photo.png?X-Amz-Signature=private",
            },
            caption: [{ plain_text: "Caption" }],
          },
        },
      ],
      toggle: [
        {
          id: "paragraph",
          type: "paragraph",
          paragraph: {
            rich_text: [
              { plain_text: "Nested text", href: "javascript:alert(1)" },
            ],
          },
        },
      ],
    },
  });
  assert.equal(result.status, 0, result.stderr);
  const body = siteContent["about.intro"].body;
  assert.equal(body[0].richText[0].text, "Notes");
  assert.equal(body[0].richText[0].annotations.bold, true);
  assert.equal(body[0].children[0].richText[0].text, "Nested text");
  assert.equal(body[0].children[0].richText[0].href, null);
  assert.equal(body[1].caption[0].text, "Caption");
  assert.match(body[1].url, /^\/images\/notion\/[a-f0-9]{64}\.png$/);
  const bytes = await readFile(path.join(directory, "public", body[1].url));
  assert.deepEqual([...bytes], [137, 80, 78, 71]);
});

test("a late Site Content block fetch failure keeps both prior outputs", async (t) => {
  const work = page("work", "work");
  work.properties.Thumbnail = text(
    "https://files.notion.so/photo.png?X-Amz-Signature=private",
  );
  const { result, output, siteOutput } = await runSync(t, {
    pages: [[work]],
    failEndpoint: "/blocks/intro/children",
  });
  assert.notEqual(result.status, 0);
  assert.equal(output, "original snapshot");
  assert.equal(siteOutput, "original site snapshot");
});

test("prototype-like Keys remain safe own records", async (t) => {
  const { result, siteContent } = await runSync(t, {
    pages: [[]],
    sitePages: [
      [
        ...requiredSitePages(),
        sitePage("proto", "__proto__"),
        sitePage("constructor", "constructor"),
      ],
    ],
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(Object.getPrototypeOf(siteContent), Object.prototype);
  assert.equal(Object.hasOwn(siteContent, "__proto__"), true);
  assert.equal(siteContent.__proto__.key, "__proto__");
  assert.equal(Object.hasOwn(siteContent, "constructor"), true);
  assert.equal(siteContent.constructor.key, "constructor");
  assert.equal({}.key, undefined);
});

test("Site Content database environment is required even when Works is configured", async (t) => {
  const { result, output, siteOutput } = await runSync(t, {
    pages: [[]],
    omitSiteDatabaseId: true,
  });
  assert.notEqual(result.status, 0);
  assert.equal(output, "original snapshot");
  assert.equal(siteOutput, "original site snapshot");
});
