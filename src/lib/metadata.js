import { works } from "../data/works.js";
import { siteContent } from "../data/site.js";
import { routeForWork } from "./routes.js";

export function routeMetadata(pathname) {
  const identity = siteContent["site.identity"];
  const work = works.find((item) => routeForWork(item) === pathname);
  const title =
    work?.title ||
    (pathname === "/"
      ? identity.detail
      : {
          "/work": "Work Index",
          "/about": "About",
          "/lab": "Lab",
        }[pathname] || "Not Found");
  return {
    title: title ? `${title} — ${identity.heading}` : identity.heading,
    description: work?.summary || identity.text,
  };
}
