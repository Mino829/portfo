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
    const title =
      work?.title ||
      {
        "/": "Engineering × Creative Expression",
        "/work": "Work Index",
        "/about": "About",
        "/lab": "Lab",
      }[pathname] ||
      "Not Found";
    const description =
      work?.summary ||
      "MINO — ソフトウェアエンジニアリングとクリエイティブ表現。Web、インタラクティブアート、映像、システム設計の制作記録。";
    document.title = `${title} — MINO`;
    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", description);
    document
      .querySelector('meta[property="og:title"]')
      .setAttribute("content", document.title);
    document
      .querySelector('meta[property="og:description"]')
      .setAttribute("content", description);
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
      <Link to="/" className="brand" aria-label="MINO ホーム">
        M<span>/</span>
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
  return (
    <footer id="contact" className="container contact-section">
      <p className="eyebrow section-label">05 / GET IN TOUCH</p>
      <div className="contact-heading">
        <h2>
          LET’S TALK<span className="accent-dot">.</span>
        </h2>
        <span aria-hidden="true">↗</span>
      </div>
      <div className="contact-bottom">
        <p>
          採用・インターン・制作相談など、
          <br />
          GitHubまたはInstagramから。
        </p>
        <div className="contact-links">
          <a href="https://github.com/Mino829" target="_blank" rel="noreferrer">
            GITHUB ↗
          </a>
          <a
            href="https://www.instagram.com/mino_23837/"
            target="_blank"
            rel="noreferrer"
          >
            INSTAGRAM ↗
          </a>
        </div>
      </div>
      <div className="folio">
        <Link to="/">MINO — ENGINEER / CREATOR</Link>
        <span>© {new Date().getFullYear()} MINO</span>
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
