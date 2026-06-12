export function resolveImageUrl(src: unknown): string {
  if (!src) return "";
  if (typeof src === "string") return src;
  if (typeof src === "object" && src !== null && "url" in src) {
    return (src as { url: string }).url || "";
  }
  return "";
}

export function resolveProductImages(images: unknown): string[] {
  if (!Array.isArray(images)) return [];
  return images.map(resolveImageUrl).filter(Boolean);
}
