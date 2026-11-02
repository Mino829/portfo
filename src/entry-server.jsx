import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import App from "./App.jsx";
import { works } from "./data/works.js";
import { routeForWork } from "./lib/routes.js";
import { routeMetadata } from "./lib/metadata.js";

export const routes = [
  "/",
  "/work",
  "/about",
  "/lab",
  ...works.map(routeForWork),
];

export function render(pathname, year) {
  return {
    html: renderToString(
      <StaticRouter location={pathname}>
        <App year={year} />
      </StaticRouter>,
    ),
    ...routeMetadata(pathname),
  };
}
