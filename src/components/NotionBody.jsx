import React from "react";
import { ResponsiveImage } from "./ResponsiveImage.jsx";

function RichText({ spans = [] }) {
  return spans.map((span, index) => {
    let content = span.text;
    const a = span.annotations || {};
    if (a.code) content = <code>{content}</code>;
    if (a.bold) content = <strong>{content}</strong>;
    if (a.italic) content = <em>{content}</em>;
    if (a.strikethrough) content = <s>{content}</s>;
    if (a.underline) content = <u>{content}</u>;
    return (
      <React.Fragment key={index}>
        {span.href ? (
          <a href={span.href} target="_blank" rel="noreferrer">
            {content}
          </a>
        ) : (
          content
        )}
      </React.Fragment>
    );
  });
}

function Block({ block }) {
  const text = <RichText spans={block.richText} />;
  const children = block.children?.length ? (
    <NotionBody blocks={block.children} />
  ) : null;
  switch (block.type) {
    case "paragraph":
      return (
        <>
          <p>{text}</p>
          {children}
        </>
      );
    case "heading_1":
      return (
        <>
          <h2>{text}</h2>
          {children}
        </>
      );
    case "heading_2":
      return (
        <>
          <h3>{text}</h3>
          {children}
        </>
      );
    case "heading_3":
      return (
        <>
          <h4>{text}</h4>
          {children}
        </>
      );
    case "bulleted_list_item":
    case "numbered_list_item":
      return (
        <li>
          {text}
          {children}
        </li>
      );
    case "to_do":
      return (
        <div className="notion-todo">
          <span aria-label={block.checked ? "完了" : "未完了"}>
            {block.checked ? "☑" : "☐"}
          </span>
          <div>
            {text}
            {children}
          </div>
        </div>
      );
    case "quote":
      return (
        <blockquote>
          {text}
          {children}
        </blockquote>
      );
    case "callout":
      return (
        <aside className="notion-callout">
          {block.icon && <span aria-hidden="true">{block.icon}</span>}
          <div>
            {text}
            {children}
          </div>
        </aside>
      );
    case "code":
      return (
        <figure className="notion-code">
          <figcaption>{block.language}</figcaption>
          <pre>
            <code>{block.richText?.map((span) => span.text).join("")}</code>
          </pre>
        </figure>
      );
    case "image":
      return block.url ? (
        <figure className="notion-image">
          <ResponsiveImage
            src={block.url}
            alt={
              block.caption?.map((span) => span.text).join("") ||
              "作品の制作資料"
            }
            loading="lazy"
            decoding="async"
            width="1200"
            height="800"
          />
          {block.caption?.length > 0 && (
            <figcaption>
              <RichText spans={block.caption} />
            </figcaption>
          )}
        </figure>
      ) : null;
    case "video":
      return block.url ? (
        <figure>
          {/\.(mp4|webm|mov)(\?|$)/i.test(block.url) ? (
            <video src={block.url} controls preload="metadata" />
          ) : (
            <a href={block.url} target="_blank" rel="noreferrer">
              映像を見る ↗
            </a>
          )}
          <figcaption>
            <RichText spans={block.caption} />
          </figcaption>
        </figure>
      ) : null;
    case "embed":
    case "link_to_page":
    case "bookmark":
    case "link_preview":
      return block.url ? (
        <p>
          <a href={block.url} target="_blank" rel="noreferrer">
            {block.url} ↗
          </a>
        </p>
      ) : null;
    case "divider":
      return <hr />;
    case "toggle":
      return (
        <details>
          <summary>{text}</summary>
          {children}
        </details>
      );
    case "column_list":
      return <div className="notion-columns">{children}</div>;
    case "column":
      return <div>{children}</div>;
    default:
      return children;
  }
}

export function NotionBody({ blocks = [] }) {
  const groups = [];
  for (const block of blocks) {
    const listType =
      block.type === "bulleted_list_item"
        ? "ul"
        : block.type === "numbered_list_item"
          ? "ol"
          : null;
    const previous = groups[groups.length - 1];
    if (listType && previous?.type === listType) previous.blocks.push(block);
    else groups.push({ type: listType, blocks: [block] });
  }
  return groups.map((group) => {
    const content = group.blocks.map((block) => (
      <Block key={block.id} block={block} />
    ));
    if (group.type === "ul") return <ul key={group.blocks[0].id}>{content}</ul>;
    if (group.type === "ol") return <ol key={group.blocks[0].id}>{content}</ol>;
    return <React.Fragment key={group.blocks[0].id}>{content}</React.Fragment>;
  });
}
