export const categoryLabel = (category) =>
  ({
    app: "Engineering",
    design: "Creative",
    web: "Web",
    experiment: "Experiments",
  })[category] || category;

export function routeForWork(work) {
  return `/work/${encodeURIComponent(work.slug)}`;
}

// Keep externally shared bookmarks working while all new links use clean URLs.
export function legacyPath(hash) {
  if (!hash.startsWith("#/")) return null;
  const [path, query = ""] = hash.slice(1).split("?");
  if (path === "/") return "/";
  if (path === "/apps") return "/work?category=app";
  if (path === "/design") return "/work?category=design";
  if (path === "/works") return `/work${query ? `?${query}` : ""}`;
  if (path.startsWith("/works/")) return `/work/${path.slice(7)}`;
  return path;
}
