import React from "react";
import { Link } from "react-router-dom";
import { categoryLabel, routeForWork } from "../lib/routes.js";
import {
  ResponsiveImage,
  CARD_IMAGE_SIZES,
  CONTENT_IMAGE_SIZES,
} from "./ResponsiveImage.jsx";

export function WorkImage({ work, priority = false, className = "" }) {
  return (
    <div className={`work-image ${className}`}>
      {work.thumbnail ? (
        <ResponsiveImage
          src={work.thumbnail}
          alt={`${work.title} — 作品ビジュアル`}
          width="1200"
          height="800"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          sizes={priority ? CONTENT_IMAGE_SIZES : CARD_IMAGE_SIZES}
          decoding="async"
        />
      ) : (
        <div
          className="typographic-cover"
          aria-label={`${work.title}：カバー画像未登録`}
        >
          <span>{work.type}</span>
          <strong>{work.title}</strong>
          <span>{work.stack.slice(0, 3).join(" / ")}</span>
        </div>
      )}
    </div>
  );
}

export function WorkCard({ work, index }) {
  return (
    <article className="work-card">
      <Link
        className="card-image-link"
        to={routeForWork(work)}
        aria-label={`${work.title}の詳細`}
      >
        <WorkImage work={work} />
        <span className="image-arrow" aria-hidden="true">
          ↗
        </span>
      </Link>
      <div className="card-meta">
        <span>
          {String(index + 1).padStart(2, "0")} / {categoryLabel(work.category)}
        </span>
        <span>{work.year}</span>
      </div>
      <h2>
        <Link to={routeForWork(work)}>{work.title}</Link>
      </h2>
      {work.summary && <p>{work.summary}</p>}
      <div className="tags">
        {work.stack.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
    </article>
  );
}

export function SectionLabel({ number, children }) {
  return (
    <p className="eyebrow section-label">
      <span>{number}</span> / {children}
    </p>
  );
}
