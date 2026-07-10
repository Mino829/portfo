export function getRoute(hash) {
  const value = hash.replace(/^#/, "") || "/";
  const segments = value.split("/").filter(Boolean);

  if (segments[0] === "works" && segments[1]) {
    return { view: "detail", slug: segments[1], category: "all" };
  }

  if (segments[0] === "apps") {
    return { view: "archive", slug: null, category: "app" };
  }

  if (segments[0] === "design") {
    return { view: "archive", slug: null, category: "design" };
  }

  if (segments[0] === "works") {
    return { view: "archive", slug: null, category: "all" };
  }

  return { view: "home", slug: null, category: "all" };
}

export function routeForWork(work) {
  return `#/works/${work.slug}`;
}
