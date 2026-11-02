import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { works } from "./data/works.js";
import { siteContent } from "./data/site.js";
import { ContentHeading } from "./components/ContentHeading.jsx";
import { legacyPath } from "./lib/routes.js";
import { Home, WorkIndex, WorkDetail, About, Lab, NotFound } from "./pages.jsx";
import "./styles.css";

const redirect = legacyPath(window.location.hash);
if (redirect) window.history.replaceState(null, "", redirect);

function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const work = pathname.startsWith("/work/")
      ? works.find(
          (item) => `/work/${encodeURIComponent(item.slug)}` === pathname,
        )
      : null;
    const identity = siteContent["site.identity"];
    const title =
      work?.title ||
      (pathname === "/"
        ? identity.detail
        : {
            "/work": "Work Index",
            "/about": "About",
            "/lab": "Lab",
          }[pathname] || "Not Found");
    const description = work?.summary || identity.text;
    document.title = title
      ? `${title} — ${identity.heading}`
      : identity.heading;
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
    ]) {
      const meta = document.querySelector(selector);
      if (description) meta.setAttribute("content", description);
      else meta.removeAttribute("content");
    }
    document
      .querySelector('meta[property="og:title"]')
      .setAttribute("content", document.title);
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else {
      window.scrollTo({ top: 0, behavior: "instant" });
      document.getElementById("main-content")?.focus({ preventScroll: true });
    }
  }, [pathname, hash]);
  return null;
}

function Header() {
  return (
    <header className="topbar container">
      <Link
        to="/"
        className="brand"
        aria-label={`${siteContent["site.identity"].heading} ホーム`}
      >
        {siteContent["site.identity"].heading.slice(0, 1)}
        <span>/</span>
      </Link>
      <nav aria-label="メインナビゲーション">
        <NavLink to="/" end>
          INDEX
        </NavLink>
        <NavLink to="/work">WORK</NavLink>
        <NavLink to="/about">ABOUT</NavLink>
        <NavLink to="/lab">LAB</NavLink>
        <a href="#contact">
          CONTACT <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  );
}

function Footer() {
  const identity = siteContent["site.identity"];
  const intro = siteContent["contact.intro"];
  const contacts = Object.values(siteContent).filter(
    (row) =>
      row.key.startsWith("contact.") &&
      row.key !== "contact.intro" &&
      /^https?:\/\//i.test(row.url) &&
      (row.heading || row.label),
  );
  return (
    <footer id="contact" className="container contact-section">
      {intro && (
        <>
          {intro.label && (
            <p className="eyebrow section-label cms-text">05 / {intro.label}</p>
          )}
          {intro.heading && (
            <div className="contact-heading">
              <h2>
                <ContentHeading text={intro.heading} accentDot />
              </h2>
              <span aria-hidden="true">↗</span>
            </div>
          )}
        </>
      )}
      {(intro?.text || contacts.length > 0) && (
        <div className="contact-bottom">
          {intro?.text && <p className="cms-text">{intro.text}</p>}
          {contacts.length > 0 && (
            <div className="contact-links">
              {contacts.map((contact) => (
                <a
                  className="cms-text"
                  key={contact.key}
                  href={contact.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {contact.heading || contact.label}{" "}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="folio">
        <Link className="cms-text" to="/">
          {identity.heading}
          {identity.label && ` — ${identity.label}`}
        </Link>
        <span className="cms-text">
          © {new Date().getFullYear()} {identity.heading}
        </span>
        <a href="#top">BACK TO TOP ↑</a>
      </div>
    </footer>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RouteEffects />
      <a className="skip-link" href="#main-content">
        本文へスキップ
      </a>
      <div id="top" />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<WorkIndex />} />
          <Route path="/work/:slug" element={<WorkDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/lab" element={<Lab />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
