import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { categories, credits, works } from "./data/works.js";
import { getRoute, routeForWork } from "./lib/routes.js";
import "./styles.css";

function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return progress;
}

function useHashRoute() {
  const [route, setRoute] = useState(() => getRoute(window.location.hash));

  useEffect(() => {
    const update = () => setRoute(getRoute(window.location.hash));
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  return route;
}

function App() {
  const route = useHashRoute();
  const progress = useScrollProgress();
  const selectedWork = useMemo(() => {
    if (route.view === "detail") {
      return works.find((work) => work.slug === route.slug) ?? works[0];
    }
    return works[0];
  }, [route]);

  return (
    <main>
      <div
        className="scroll-progress"
        style={{ transform: `scaleX(${progress})` }}
      />
      <GridTexture />
      <Header />

      {route.view === "detail" ? (
        <WorkPage work={selectedWork} />
      ) : (
        <>
          <HomeHero />
          <WorksSection initialCategory={route.category} />
          <CreditSection />
          <ContactSection />
        </>
      )}
    </main>
  );
}

function Header() {
  return (
    <header className="topbar" aria-label="Site navigation">
      <a href="#/" className="brand">
        MINO
      </a>
      <nav>
        <a href="#/works">WORKS</a>
        <a href="#/apps">APPS</a>
        <a href="#/design">DESIGN</a>
        <a href="#contact">CONTACT</a>
      </nav>
    </header>
  );
}

function HomeHero() {
  return (
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="kicker">
          CAREER PORTFOLIO &nbsp; ISSUE 02 &nbsp; WEB / UI / FRONTEND
        </p>
        <h1>
          PORTFOLIO
          <br />
          INDEX
        </h1>
      </div>
      <FilmStill className="hero-still" />
      <div className="hero-strip">
        <strong>MINO / CREATIVE DEVELOPER</strong>
        <p>作る理由、設計する視点、実装する手つき。プロフィールは短く、作品を主役にする。</p>
        <b>
          NOTION
          <br />
          MANAGED
        </b>
      </div>
    </section>
  );
}

function WorksSection({ initialCategory }) {
  const [selectedSlug, setSelectedSlug] = useState(works[0].slug);
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  const filteredWorks = useMemo(() => {
    if (category === "all") return works;
    return works.filter((work) => work.category === category);
  }, [category]);

  useEffect(() => {
    if (!filteredWorks.some((work) => work.slug === selectedSlug)) {
      setSelectedSlug(filteredWorks[0]?.slug ?? works[0].slug);
    }
  }, [filteredWorks, selectedSlug]);

  const selectedWork =
    filteredWorks.find((work) => work.slug === selectedSlug) ??
    filteredWorks[0] ??
    works[0];

  return (
    <section className="works-section section" id="works">
      <SectionLabel number="01" label="WORKS" />
      <div className="section-intro">
        <h2>
          SELECTED
          <br />
          WORKS
        </h2>
        <div>
          <p>
            採用担当が最初に見たいのは、何を作ったか。Notionで作品を管理し、サイト側ではカテゴリと詳細ページに展開する。
          </p>
          <CategoryNav category={category} onChange={setCategory} />
        </div>
      </div>

      <div className="works-layout">
        <div className="work-list" role="list" aria-label="Selected works">
          {filteredWorks.map((work, index) => (
            <button
              className={`work-item ${work.slug === selectedWork.slug ? "is-active" : ""}`}
              key={work.slug}
              onClick={() => setSelectedSlug(work.slug)}
              type="button"
              aria-pressed={work.slug === selectedWork.slug}
            >
              <FilmStill image={work.thumbnail} variant={index} />
              <span>{work.id}</span>
              <strong>{work.title}</strong>
              <small>{work.stack.join(" / ")}</small>
              <em>{work.type}</em>
            </button>
          ))}
        </div>

        <WorkPreview work={selectedWork} />
      </div>
    </section>
  );
}

function CategoryNav({ category, onChange }) {
  return (
    <div className="category-nav" aria-label="Work categories">
      {categories.map((item) => (
        <a
          className={category === item.id ? "is-active" : ""}
          href={item.route}
          key={item.id}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}

function WorkPreview({ work }) {
  return (
    <article className="work-detail" aria-live="polite">
      <FilmStill className="work-detail-still" image={work.thumbnail} />
      <span>
        {work.id} / {work.type} / {work.category.toUpperCase()}
      </span>
      <h3>{work.title}</h3>
      <p>{work.summary}</p>
      <dl>
        <div>
          <dt>ROLE</dt>
          <dd>{work.role}</dd>
        </div>
        <div>
          <dt>STACK</dt>
          <dd>{work.stack.join(" / ")}</dd>
        </div>
        <div>
          <dt>STATUS</dt>
          <dd>{work.status}</dd>
        </div>
      </dl>
      <a className="detail-link" href={routeForWork(work)}>
        OPEN DETAIL
      </a>
    </article>
  );
}

function WorkPage({ work }) {
  return (
    <section className="work-page section">
      <a className="back-link" href="#/works">
        BACK TO WORKS
      </a>
      <div className="work-page-hero">
        <div>
          <p className="kicker">
            {work.id} / {work.type} / {work.category.toUpperCase()}
          </p>
          <h1>{work.title}</h1>
          <p>{work.summary}</p>
        </div>
        <FilmStill className="work-page-still" image={work.thumbnail} />
      </div>

      {work.images?.length > 0 && (
        <div className="case-gallery" aria-label={`${work.title} images`}>
          {work.images.map((image, index) => (
            <FilmStill
              className="case-gallery-still"
              image={image}
              key={`${image}-${index}`}
              variant={index}
            />
          ))}
        </div>
      )}

      <div className="case-grid">
        <CaseBlock label="ROLE" value={work.role} />
        <CaseBlock label="STACK" value={work.stack.join(" / ")} />
        <CaseBlock label="YEAR" value={work.year} />
        <CaseBlock label="STATUS" value={work.status} />
      </div>

      <div className="case-body">
        <section>
          <h2>POINTS</h2>
          <ul>
            {work.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>LINKS</h2>
          <div className="case-links">
            {Object.entries(work.links)
              .filter(([, href]) => href)
              .map(([label, href]) => (
                <a href={href} key={label} rel="noreferrer" target="_blank">
                  {label.toUpperCase()} ↗
                </a>
              ))}
            {!Object.values(work.links).some(Boolean) && (
              <span>Links will be added from Notion.</span>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function CaseBlock({ label, value }) {
  return (
    <div className="case-block">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function CreditSection() {
  return (
    <section className="credit-section section" id="credit">
      <SectionLabel number="02" label="CREDIT" />
      <div className="section-intro">
        <h2>
          CREDIT
          <br />
          LIST
        </h2>
        <p className="red-note">
          人物紹介はここに圧縮。スキルは作品説明で証明する。
        </p>
      </div>
      <div className="credit-list">
        {credits.map(([key, value]) => (
          <div className="credit-row" key={key}>
            <span>{key}</span>
            <p>{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="contact-section section" id="contact">
      <SectionLabel number="03" label="CONTACT" />
      <h2>CONTACT</h2>
      <div className="contact-panel">
        <p>採用・インターン・制作相談など、まずはメールまたはGitHubから。</p>
        <div className="contact-links">
          <a href="mailto:hello@example.com">MAIL</a>
          <a href="https://github.com/" target="_blank" rel="noreferrer">
            GITHUB
          </a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
            LINKEDIN
          </a>
          <a href="https://x.com/" target="_blank" rel="noreferrer">
            X
          </a>
        </div>
        <span aria-hidden="true">↗</span>
      </div>
    </section>
  );
}

function SectionLabel({ number, label }) {
  return (
    <p className="section-label">
      <span>{number}</span>
      {label}
    </p>
  );
}

function FilmStill({ className = "", image = "", variant = 0 }) {
  const src = image || "/images/film-still.png";

  return (
    <div className={`film-still variant-${variant} ${className}`}>
      <img src={src} alt="" aria-hidden="true" />
      <div className="still-lines" aria-hidden="true" />
    </div>
  );
}

function GridTexture() {
  return (
    <div className="grid-texture" aria-hidden="true">
      {Array.from({ length: 36 }, (_, index) => (
        <i key={index} style={{ "--i": index }} />
      ))}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
