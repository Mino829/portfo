import React from "react";

export function ContentHeading({ text, animated = false, accentDot = false }) {
  const lines = text.split("\n");
  return lines.map((line, index) => {
    const finalDot =
      accentDot && index === lines.length - 1 && line.endsWith(".");
    const content = finalDot ? (
      <>
        {line.slice(0, -1)}
        <span className="accent-dot">.</span>
      </>
    ) : (
      line
    );
    return animated ? (
      <React.Fragment key={index}>
        {index > 0 && "\n"}
        <span>{content}</span>
      </React.Fragment>
    ) : (
      <React.Fragment key={index}>
        {index > 0 && (
          <>
            <br />{" "}
          </>
        )}
        {content}
      </React.Fragment>
    );
  });
}
