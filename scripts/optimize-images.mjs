import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const widths = [480, 960, 1600, 2400];
const encoding = { quality: 84, effort: 4 };
const extensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const formats = new Set(["jpeg", "png", "webp", "heif", "avif"]);

function isAnimatedPng(source, format) {
  if (format !== "png") return false;
  for (let offset = 8; offset + 12 <= source.length; ) {
    const length = source.readUInt32BE(offset);
    if (source.toString("ascii", offset + 4, offset + 8) === "acTL")
      return true;
    offset += length + 12;
  }
  return false;
}

function imageReferences(works, siteContent) {
  const references = new Set();
  const add = (url) => {
    if (typeof url === "string" && url) references.add(url);
  };
  const visit = (blocks = []) => {
    for (const block of blocks) {
      if (block.type === "image") add(block.url);
      if (block.children) visit(block.children);
    }
  };
  for (const work of works) {
    add(work.thumbnail);
    for (const image of work.images ?? []) add(image);
    visit(work.body);
  }
  for (const content of Object.values(siteContent)) visit(content.body);
  return [...references].sort();
}

function isInside(directory, file) {
  const relative = path.relative(directory, file);
  return (
    relative !== "" &&
    relative !== ".." &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

async function sourcePath(url, imagesDirectory) {
  let decoded;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    return null;
  }
  if (!decoded.startsWith("/images/") || /[\\?#%\p{Cc}]/u.test(decoded))
    return null;
  const segments = decoded.slice("/images/".length).split("/");
  if (
    segments.some((segment) => !segment || segment === "." || segment === "..")
  )
    return null;
  if (!extensions.has(path.extname(decoded).toLowerCase())) return null;
  const file = await realpath(path.join(imagesDirectory, ...segments));
  return isInside(imagesDirectory, file) ? file : null;
}

async function loadData(file) {
  const source = await readFile(file);
  const version = createHash("sha256").update(source).digest("hex");
  return import(`${pathToFileURL(file).href}?images=${version}`);
}

export async function optimizeImages({ root = process.cwd() } = {}) {
  root = path.resolve(root);
  const [{ works }, { siteContent }] = await Promise.all([
    loadData(path.join(root, "src/data/works.js")),
    loadData(path.join(root, "src/data/site.js")),
  ]);
  const imagesDirectory = await realpath(path.join(root, "public/images"));
  const outputDirectory = path.join(imagesDirectory, "optimized");
  await mkdir(outputDirectory, { recursive: true });
  if (!isInside(imagesDirectory, await realpath(outputDirectory))) {
    throw new Error("Optimized image directory must stay inside public/images");
  }
  const stagingDirectory = await mkdtemp(path.join(outputDirectory, ".stage-"));
  let manifestDirectory;
  try {
    const imageAssets = {};
    const processed = new Map();
    const pendingFiles = [];
    const cachedVariants = new Map();
    for (const url of imageReferences(works, siteContent)) {
      const file = await sourcePath(url, imagesDirectory);
      if (!file) continue;
      if (processed.has(file)) {
        const asset = processed.get(file);
        if (asset) imageAssets[url] = asset;
        continue;
      }
      const source = await readFile(file);
      const metadata = await sharp(source).metadata();
      if (
        !formats.has(metadata.format) ||
        (metadata.pages ?? 1) > 1 ||
        isAnimatedPng(source, metadata.format)
      ) {
        processed.set(file, null);
        continue;
      }
      const rotated = [5, 6, 7, 8].includes(metadata.orientation);
      const intrinsicWidth = rotated ? metadata.height : metadata.width;
      if (!intrinsicWidth)
        throw new Error(`Image has no intrinsic width: ${url}`);
      const variantWidths = widths.filter((width) => width <= intrinsicWidth);
      if (
        intrinsicWidth <= widths.at(-1) &&
        !variantWidths.includes(intrinsicWidth)
      ) {
        variantWidths.push(intrinsicWidth);
      }
      const variants = [];
      for (const width of variantWidths) {
        const hash = createHash("sha256")
          .update(source)
          .update(
            JSON.stringify({
              width,
              encoding,
              autoOrient: true,
              format: "webp",
              versions: sharp.versions,
            }),
          )
          .digest("hex");
        const name = `${hash}-${width}.webp`;
        const target = path.join(outputDirectory, name);
        let dimensions = cachedVariants.get(name);
        if (!dimensions) {
          try {
            await stat(target);
            dimensions = await sharp(target).metadata();
          } catch (error) {
            // Only a missing variant is a cache miss; corrupt existing files must fail the build.
            if (error.code !== "ENOENT") throw error;
            const { data, info } = await sharp(source)
              .rotate()
              .resize({ width, withoutEnlargement: true })
              .webp(encoding)
              .toBuffer({ resolveWithObject: true });
            const staged = path.join(stagingDirectory, name);
            await writeFile(staged, data);
            pendingFiles.push({ staged, target });
            dimensions = info;
          }
          cachedVariants.set(name, dimensions);
        }
        variants.push({
          src: `/images/optimized/${name}`,
          width: dimensions.width,
          height: dimensions.height,
        });
      }
      // A medium fallback keeps non-srcset consumers small; dimensions describe that exact file.
      const fallback =
        variants.find((variant) => variant.width === 960) ?? variants.at(-1);
      const asset = {
        src: fallback.src,
        srcSet: variants
          .map((variant) => `${variant.src} ${variant.width}w`)
          .join(", "),
        width: fallback.width,
        height: fallback.height,
      };
      processed.set(file, asset);
      imageAssets[url] = asset;
    }
    manifestDirectory = await mkdtemp(path.join(root, "src/data/.images-"));
    const manifest = path.join(manifestDirectory, "images.js");
    await writeFile(
      manifest,
      `export const imageAssets = ${JSON.stringify(imageAssets, null, 2)};\n`,
    );
    for (const { staged, target } of pendingFiles) await rename(staged, target);
    await rename(manifest, path.join(root, "src/data/images.js"));
    return imageAssets;
  } finally {
    await rm(stagingDirectory, { recursive: true, force: true });
    if (manifestDirectory)
      await rm(manifestDirectory, { recursive: true, force: true });
  }
}

if (
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
) {
  try {
    const assets = await optimizeImages();
    console.log(`Optimized ${Object.keys(assets).length} referenced images.`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
