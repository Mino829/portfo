import React from "react";
import { imageAssets } from "../data/images.js";

export const CONTENT_IMAGE_SIZES =
  "(min-width: 1408px) 1296px, (max-width: 640px) calc(100vw - 40px), (max-width: 1000px) calc(100vw - 64px), calc(100vw - 112px)";
export const CARD_IMAGE_SIZES =
  "(min-width: 1408px) 632px, (max-width: 640px) calc(100vw - 40px), (max-width: 1000px) calc((100vw - 96px) / 2), calc((100vw - 144px) / 2)";

export function ResponsiveImage({
  src,
  alt,
  sizes = CONTENT_IMAGE_SIZES,
  width = 1200,
  height = 800,
  loading = "lazy",
  fetchPriority = "auto",
  decoding = "async",
  ...attributes
}) {
  const image = Object.hasOwn(imageAssets, src) ? imageAssets[src] : null;
  return (
    <img
      {...attributes}
      src={image?.src || src}
      srcSet={image?.srcSet}
      sizes={image ? sizes : undefined}
      alt={alt}
      width={image?.width || width}
      height={image?.height || height}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding={decoding}
    />
  );
}
