import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { optimizeImages } from "../scripts/optimize-images.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "portfolio-images-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "public/images"), { recursive: true });
  await mkdir(path.join(root, "src/data"), { recursive: true });
  await writeFile(path.join(root, "package.json"), '{"type":"module"}');
  const image = (name) => path.join(root, "public/images", name);
  async function content(works = [], siteContent = {}) {
    await writeFile(
      path.join(root, "src/data/works.js"),
      `export const works = ${JSON.stringify(works)};\n`,
    );
    await writeFile(
      path.join(root, "src/data/site.js"),
      `export const siteContent = ${JSON.stringify(siteContent)};\n`,
    );
  }
  await content();
  return { root, image, content };
}

function raster(width, height, background = "#926dd0") {
  return sharp({ create: { width, height, channels: 3, background } });
}

function variants(asset) {
  return asset.srcSet.split(", ").map((candidate) => {
    const [src, width] = candidate.split(" ");
    return { src, width: Number.parseInt(width, 10) };
  });
}

async function published(root) {
  const source = await readFile(path.join(root, "src/data/images.js"), "utf8");
  return (
    await import(
      `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
    )
  ).imageAssets;
}

async function metadata(root, src) {
  return sharp(path.join(root, "public", src)).metadata();
}

test("raster variants use actual dimensions, retain aspect, cap width, and never upscale", async (t) => {
  const { root, image, content } = await fixture(t);
  const cases = [
    {
      name: "tiny.png",
      width: 123,
      height: 77,
      format: "png",
      expected: [123],
    },
    {
      name: "wide.jpg",
      width: 3000,
      height: 1500,
      format: "jpeg",
      expected: [480, 960, 1600, 2400],
    },
    {
      name: "medium.webp",
      width: 1800,
      height: 900,
      format: "webp",
      expected: [480, 960, 1600, 1800],
    },
    {
      name: "still.avif",
      width: 700,
      height: 350,
      format: "avif",
      expected: [480, 700],
    },
  ];
  for (const item of cases)
    await raster(item.width, item.height)
      .toFormat(item.format)
      .toFile(image(item.name));
  await content(cases.map(({ name }) => ({ thumbnail: `/images/${name}` })));
  await optimizeImages({ root });
  const assets = await published(root);
  for (const item of cases) {
    const asset = assets[`/images/${item.name}`];
    assert.deepEqual(
      variants(asset).map(({ width }) => width),
      item.expected,
    );
    for (const variant of variants(asset)) {
      const output = await metadata(root, variant.src);
      assert.equal(output.format, "webp");
      assert.equal(output.width, variant.width);
      assert.ok(output.width <= item.width);
      assert.ok(
        Math.abs(output.height - (output.width * item.height) / item.width) <=
          1,
      );
    }
    const fallback = await metadata(root, asset.src);
    assert.equal(asset.width, fallback.width);
    assert.equal(asset.height, fallback.height);
  }
});

test("EXIF rotation is applied before responsive width selection and dimensions", async (t) => {
  const { root, image, content } = await fixture(t);
  await raster(1200, 1800)
    .jpeg()
    .withMetadata({ orientation: 6 })
    .toFile(image("rotated.jpg"));
  await content([{ thumbnail: "/images/rotated.jpg" }]);
  const assets = await optimizeImages({ root });
  const asset = assets["/images/rotated.jpg"];
  assert.deepEqual(
    variants(asset).map(({ width }) => width),
    [480, 960, 1600, 1800],
  );
  for (const variant of variants(asset)) {
    const output = await metadata(root, variant.src);
    assert.equal(output.width, variant.width);
    assert.ok(Math.abs(output.height - (variant.width * 1200) / 1800) <= 1);
    assert.ok(output.orientation === undefined || output.orientation === 1);
  }
  assert.equal(asset.width, 960);
  assert.equal(asset.height, 640);
});

test("stable inputs reuse immutable variants, duplicate content shares URLs, and edits invalidate them", async (t) => {
  const { root, image, content } = await fixture(t);
  const original = await raster(64, 32, "red").png().toBuffer();
  await writeFile(image("one.png"), original);
  await writeFile(image("two.png"), original);
  await content([
    {
      thumbnail: "/images/one.png",
      images: ["/images/one.png", "/images/two.png"],
    },
  ]);
  const first = await optimizeImages({ root });
  assert.deepEqual(first["/images/one.png"], first["/images/two.png"]);
  const target = path.join(root, "public", first["/images/one.png"].src);
  const before = await stat(target);
  assert.deepEqual(await optimizeImages({ root }), first);
  assert.equal((await stat(target)).mtimeMs, before.mtimeMs);
  assert.equal((await readdir(image("optimized"))).length, 1);
  await raster(64, 32, "blue").png().toFile(image("one.png"));
  const changed = await optimizeImages({ root });
  assert.notEqual(changed["/images/one.png"].src, first["/images/one.png"].src);
  assert.deepEqual(changed["/images/two.png"], first["/images/two.png"]);
  assert.deepEqual(await readFile(image("two.png")), original);
  assert.ok((await stat(target)).isFile());
});

test("only referenced images are optimized across galleries and recursive Works and Site Content bodies", async (t) => {
  const { root, image, content } = await fixture(t);
  const names = [
    "cover.png",
    "gallery.png",
    "nested.png",
    "site.png",
    "same photo.png",
    "film-still.png",
  ];
  for (let index = 0; index < names.length; index++) {
    await raster(30 + index, 20)
      .png()
      .toFile(image(names[index]));
  }
  const pixels = Buffer.alloc(12 * 24 * 3);
  pixels.fill(255, 0, 12 * 12 * 3);
  await sharp(pixels, {
    raw: { width: 12, height: 24, channels: 3, pageHeight: 12 },
  })
    .webp({ loop: 0, delay: [100, 100] })
    .toFile(image("animated.webp"));
  assert.equal((await sharp(image("animated.webp")).metadata()).pages, 2);
  const unsupported = [
    "/images/animated.webp",
    "/images/animation.gif",
    "/images/vector.svg",
    "/images/clip.mp4",
    "https://example.com/photo.png",
    "//example.com/photo.jpg",
    "/other/photo.png",
  ];
  await writeFile(
    image("vector.svg"),
    '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
  );
  await writeFile(
    image("animation.gif"),
    Buffer.from("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", "base64"),
  );
  await writeFile(image("clip.mp4"), "unchanged video");
  const works = [
    {
      thumbnail: "/images/cover.png",
      images: [
        "/images/gallery.png",
        "/images/same%20photo.png",
        "/images/same photo.png",
        ...unsupported,
      ],
      body: [
        {
          type: "column_list",
          children: [
            {
              type: "column",
              children: [
                { type: "image", url: "/images/nested.png" },
                { type: "video", url: "/images/film-still.png" },
              ],
            },
          ],
        },
      ],
    },
  ];
  const siteContent = {
    "about.intro": {
      body: [
        {
          type: "toggle",
          children: [{ type: "image", url: "/images/site.png" }],
        },
      ],
    },
  };
  await content(works, siteContent);
  const worksBefore = await readFile(path.join(root, "src/data/works.js"));
  const siteBefore = await readFile(path.join(root, "src/data/site.js"));
  const assets = await optimizeImages({ root });
  assert.deepEqual(
    Object.keys(assets).sort(),
    [
      "/images/cover.png",
      "/images/gallery.png",
      "/images/nested.png",
      "/images/same photo.png",
      "/images/same%20photo.png",
      "/images/site.png",
    ].sort(),
  );
  assert.deepEqual(
    assets["/images/same photo.png"],
    assets["/images/same%20photo.png"],
  );
  assert.equal((await readdir(image("optimized"))).length, 5);
  assert.deepEqual(
    await readFile(path.join(root, "src/data/works.js")),
    worksBefore,
  );
  assert.deepEqual(
    await readFile(path.join(root, "src/data/site.js")),
    siteBefore,
  );
  for (const url of unsupported) assert.equal(assets[url], undefined);
  assert.ok((await stat(image("film-still.png"))).isFile());
});

test("unsafe paths and symlink escapes never become optimized mappings", async (t) => {
  const { root, image, content } = await fixture(t);
  const outside = path.join(root, "public/outside.png");
  await raster(20, 10).png().toFile(outside);
  await symlink(outside, image("escape.png"));
  const unsafe = [
    "/images/../outside.png",
    "/images/%2e%2e/outside.png",
    "/images/%252e%252e/outside.png",
    "/images/escape.png",
    "/images/..\\outside.png",
    "/images//outside.png",
    "/images/%00.png",
    "/images/photo.png?download=1",
    "/images/photo.png#fragment",
    "/images/%zz.png",
  ];
  await content([{ images: unsafe }]);
  assert.deepEqual(await optimizeImages({ root }), {});
  assert.deepEqual(await published(root), {});
  assert.deepEqual(await readdir(image("optimized")), []);
});

test("a failed source cannot publish a partial manifest or leave staging files", async (t) => {
  const { root, image, content } = await fixture(t);
  await raster(24, 12).png().toFile(image("a-valid.png"));
  const original = await readFile(image("a-valid.png"));
  await content([{ thumbnail: "/images/a-valid.png" }]);
  await optimizeImages({ root });
  const manifest = await readFile(path.join(root, "src/data/images.js"));
  const existingFiles = await readdir(image("optimized"));
  await raster(32, 16).png().toFile(image("b-new.png"));
  await writeFile(image("z-broken.png"), "not an image");
  await content([
    {
      images: [
        "/images/a-valid.png",
        "/images/b-new.png",
        "/images/z-broken.png",
      ],
    },
  ]);
  await assert.rejects(optimizeImages({ root }));
  assert.deepEqual(
    await readFile(path.join(root, "src/data/images.js")),
    manifest,
  );
  assert.deepEqual(await readdir(image("optimized")), existingFiles);
  assert.deepEqual(await readFile(image("a-valid.png")), original);
  assert.ok(
    !(await readdir(path.join(root, "src/data"))).some((name) =>
      name.startsWith(".images-"),
    ),
  );
});
