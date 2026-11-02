import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";

const root = document.getElementById("root");
const year = Number(root.dataset.renderYear) || new Date().getFullYear();
const app = (
  <BrowserRouter>
    <App year={year} />
  </BrowserRouter>
);

if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
