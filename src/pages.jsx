import React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { works } from "./data/works.js";
import { siteContent } from "./data/site.js";
import { categoryLabel, routeForWork } from "./lib/routes.js";
import { WorkCard, WorkImage, SectionLabel } from "./components/Work.jsx";
import { NotionBody } from "./components/NotionBody.jsx";
import { ContentHeading } from "./components/ContentHeading.jsx";

export function Home() {
  const featured = works.filter((work) => work.featured);
  const selected = (featured.length ? featured : works).slice(0, 3);
  const lead = selected[0];
  const identity = siteContent["site.identity"];
  const hero = siteContent["home.hero"];
  const about = siteContent["home.about"];
  return (
    <>
      <section className="hero container">
        <div className="hero-title">
          <h1 aria-label={hero.heading.replace(/\s+/g, " ")}>
            <ContentHeading text={hero.heading} animated accentDot />
          </h1>
          <div className="hero-mark" aria-hidden="true">
            <span />
          </div>
        </div>
        <div className="hero-bottom">
          <div>
            {hero.label && <p className="eyebrow cms-text">{hero.label}</p>}
            {hero.text && (
              <p className="hero-statement cms-text">{hero.text}</p>
            )}
          </div>
          {hero.detail && <p className="hero-aside cms-text">{hero.detail}</p>}
        </div>
      </section>
      <section
        className="container selected-section"
        aria-labelledby="selected-heading"
      >
        <div className="section-top">
          <h2 id="selected-heading" className="eyebrow">
            {featured.length ? "FEATURED WORKS" : "SELECTED PROJECTS"}
          </h2>
          <Link className="text-link" to="/work">
            ALL WORKS <span aria-hidden="true">↗</span>
          </Link>
        </div>
        {lead ? (
          <article className="featured-work">
            <span className="project-number">01</span>
            <Link
              className="featured-image"
              to={routeForWork(lead)}
              aria-label={`${lead.title}の詳細`}
            >
              <WorkImage work={lead} />
            </Link>
            <div className="featured-copy">
              <p className="eyebrow">
                {categoryLabel(lead.category)} / {lead.year}
              </p>
              <h3>
                <Link to={routeForWork(lead)}>{lead.title}</Link>
              </h3>
              <p className="eyebrow muted">{lead.stack.join(" / ")}</p>
              <p className="japanese">{lead.summary}</p>
              <Link className="text-link" to={routeForWork(lead)}>
                VIEW PROJECT ↗
              </Link>
            </div>
          </article>
        ) : (
          <p className="empty-message">公開されている作品はありません。</p>
        )}
        {selected.slice(1).map((work, index) => (
          <Link className="project-row" key={work.slug} to={routeForWork(work)}>
            <span className="eyebrow">
              {String(index + 2).padStart(2, "0")}
            </span>
            <h3>{work.title}</h3>
            <span className="eyebrow">{categoryLabel(work.category)}</span>
            <span className="eyebrow">{work.year}</span>
            <span aria-hidden="true">↗</span>
          </Link>
        ))}
        <div className="folio">
          <span className="cms-text">
            {identity.heading}
            {identity.label && ` — ${identity.label}`}
          </span>
          <span>01 / 04</span>
        </div>
      </section>
      <Practice />
      {about && (
        <section className="container about-section">
          {about.label && (
            <SectionLabel number="03">
              <span className="cms-text">{about.label}</span>
            </SectionLabel>
          )}
          {about.heading && (
            <h2 className="section-heading">
              <ContentHeading text={about.heading} />
            </h2>
          )}
          {(about.text || about.linkLabel) && (
            <div className="about-copy">
              {about.text && <p className="cms-text">{about.text}</p>}
              {about.linkLabel && (
                <Link className="text-link cms-text" to="/about">
                  {about.linkLabel} ↗
                </Link>
              )}
            </div>
          )}
          {about.detail && (
            <div className="signature cms-text">
              <span />
              {about.detail}
            </div>
          )}
        </section>
      )}
    </>
  );
}

export function Practice() {
  const intro = siteContent["practice.intro"];
  const cards = [
    ["practice.engineering", "engineering", "/work?category=app"],
    ["practice.creative", "creative", "/work?category=design"],
  ].filter(([key]) => siteContent[key]);
  if (!intro && cards.length === 0) return null;
  return (
    <section className="container practice-section">
      {intro && (
        <>
          {intro.label && (
            <SectionLabel number="02">
              <span className="cms-text">{intro.label}</span>
            </SectionLabel>
          )}
          {intro.heading && (
            <h2 className="section-heading">
              <ContentHeading text={intro.heading} />
            </h2>
          )}
          {intro.text && <p className="section-deck cms-text">{intro.text}</p>}
        </>
      )}
      {cards.length > 0 && (
        <div className="practice-grid">
          {cards.map(([key, className, destination]) => {
            const card = siteContent[key];
            return (
              <article key={key} className={`practice-card ${className}`}>
                {card.label && <p className="eyebrow cms-text">{card.label}</p>}
                {card.heading && (
                  <h3>
                    <ContentHeading text={card.heading} />
                  </h3>
                )}
                {card.detail && (
                  <p className="eyebrow cms-text">{card.detail}</p>
                )}
                {card.text && <p className="cms-text">{card.text}</p>}
                {card.linkLabel && (
                  <Link className="text-link cms-text" to={destination}>
                    {card.linkLabel} ↗
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function WorkIndex() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "all";
  const categories = [...new Set(works.map((work) => work.category))];
  const filtered =
    category === "all"
      ? works
      : works.filter((work) => work.category === category);
  return (
    <section className="container archive page-section">
      <SectionLabel number="01">WORK INDEX</SectionLabel>
      <div className="page-title-row">
        <h1>
          SELECTED
          <br />
          WORKS<span className="accent-dot">.</span>
        </h1>
        <p className="cms-text">
          {siteContent["site.identity"].detail}
          <br />
          制作の意図と、実装の記録。
        </p>
      </div>
      <div className="filter-bar">
        <div
          className="category-filters"
          role="group"
          aria-label="作品カテゴリ"
        >
          {["all", ...categories].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={value === category}
              onClick={() =>
                setParams(value === "all" ? {} : { category: value })
              }
            >
              {value === "all" ? "All" : categoryLabel(value)}
            </button>
          ))}
        </div>
        <p className="eyebrow" role="status">
          {String(filtered.length).padStart(2, "0")} PROJECTS
        </p>
      </div>
      {filtered.length ? (
        <div className="work-grid">
          {filtered.map((work, index) => (
            <WorkCard key={work.slug} work={work} index={index} />
          ))}
        </div>
      ) : (
        <div className="empty-message">
          <p>このカテゴリの公開作品はありません。</p>
          <Link className="text-link" to="/work">
            すべての作品を見る ↗
          </Link>
        </div>
      )}
    </section>
  );
}

export function WorkDetail() {
  const { slug } = useParams();
  const work = works.find((item) => item.slug === slug);
  if (!work) return <NotFound work />;
  const related = works
    .filter((item) => item.slug !== slug && item.category === work.category)
    .slice(0, 2);
  const metadata = [
    ["ROLE", work.role],
    ["TECHNOLOGIES", work.stack.join(" / ")],
    ["YEAR", work.year],
    ["STATUS", work.status],
  ].filter(([, value]) => value);
  const links = Object.entries(work.links).filter(([, value]) => value);
  return (
    <article className="container project-detail page-section">
      <Link className="text-link back-link" to="/work">
        ↖ BACK TO WORK
      </Link>
      <div className="detail-title">
        <p className="eyebrow">
          {categoryLabel(work.category)} / {work.type} / {work.year}
        </p>
        <h1>{work.title}</h1>
        {work.summary && <p className="detail-summary">{work.summary}</p>}
      </div>
      <WorkImage work={work} priority className="detail-cover" />
      {metadata.length > 0 && (
        <dl className="project-metadata">
          {metadata.map(([label, value]) => (
            <div key={label}>
              <dt className="eyebrow">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {work.images?.length > 0 && (
        <section className="gallery" aria-label="作品ギャラリー">
          {work.images.map((image, index) => (
            <figure key={`${image}-${index}`}>
              <img
                src={image}
                alt={`${work.title} — 制作資料 ${index + 1}`}
                loading="lazy"
                decoding="async"
                width="1200"
                height="800"
              />
            </figure>
          ))}
        </section>
      )}
      {work.body?.length > 0 && (
        <div className="notion-body">
          <NotionBody blocks={work.body} />
        </div>
      )}
      {work.points?.length > 0 && (
        <section className="project-points">
          <SectionLabel number="↳">IMPLEMENTATION NOTES</SectionLabel>
          <ul>
            {work.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      )}
      {links.length > 0 && (
        <div className="project-links">
          {links.map(([label, href]) => (
            <a
              className="text-link"
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
            >
              {label.toUpperCase()} ↗
            </a>
          ))}
        </div>
      )}
      {related.length > 0 && (
        <section className="related">
          <div className="section-top">
            <h2 className="eyebrow">RELATED WORKS</h2>
            <Link className="text-link" to="/work">
              ALL WORKS ↗
            </Link>
          </div>
          <div className="work-grid">
            {related.map((item, index) => (
              <WorkCard key={item.slug} work={item} index={index} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

export function About() {
  const intro = siteContent["about.intro"];
  const credits = Object.values(siteContent).filter((row) =>
    row.key.startsWith("about.credit."),
  );
  return (
    <section className="container page-section about-page">
      {intro.label && (
        <SectionLabel number="03">
          <span className="cms-text">{intro.label}</span>
        </SectionLabel>
      )}
      <h1>
        <ContentHeading text={intro.heading} accentDot />
      </h1>
      {intro.text && <p className="about-intro cms-text">{intro.text}</p>}
      {intro.detail && (
        <p className="about-description cms-text">{intro.detail}</p>
      )}
      {intro.body?.length > 0 && (
        <div className="notion-body">
          <NotionBody blocks={intro.body} />
        </div>
      )}
      {credits.length > 0 && (
        <dl className="credit-list">
          {credits.map((credit) => (
            <div key={credit.key}>
              <dt className="eyebrow cms-text">{credit.label}</dt>
              <dd className="cms-text">{credit.text}</dd>
            </div>
          ))}
        </dl>
      )}
      <Practice />
    </section>
  );
}

export function Lab() {
  const experiments = works.filter(
    (work) =>
      ["lab", "experiment", "research"].includes(work.category.toLowerCase()) ||
      work.type.toLowerCase() === "experiment",
  );
  return (
    <section className="container page-section lab-page">
      <SectionLabel number="04">RESEARCH / EXPERIMENTS</SectionLabel>
      <h1>
        THE LAB<span className="accent-dot">.</span>
      </h1>
      <p className="about-intro">
        仕組みを観察し、
        <br />
        つくりながら理解する。
      </p>
      <p className="about-description">
        分散システム、ネットワーク、Go、Linux。技術実験と研究ノートのための場所。Notionで公開した実験作品をここに記録します。
      </p>
      {experiments.length > 0 ? (
        <div className="work-grid">
          {experiments.map((work, index) => (
            <WorkCard key={work.slug} work={work} index={index} />
          ))}
        </div>
      ) : (
        <div className="lab-empty">
          <span className="status-dot" aria-hidden="true" />
          <p>公開済みの実験ノートはまだありません。</p>
          <Link className="text-link" to="/work?category=app">
            ENGINEERING WORKS ↗
          </Link>
        </div>
      )}
    </section>
  );
}

export function NotFound({ work = false }) {
  return (
    <section className="container page-section not-found">
      <SectionLabel number="404">
        {work ? "WORK NOT FOUND" : "PAGE NOT FOUND"}
      </SectionLabel>
      <h1>
        NOT HERE<span className="accent-dot">.</span>
      </h1>
      <p>
        {work
          ? "この作品は公開されていないか、URLが変更されています。"
          : "ページが見つかりません。"}
      </p>
      <Link className="text-link" to={work ? "/work" : "/"}>
        {work ? "WORK INDEX" : "BACK TO HOME"} ↗
      </Link>
    </section>
  );
}
