export const getCollectionLink = (slug?: string) => {
  if (!slug) return "/giyim";

  return `/koleksiyonlar/${encodeURIComponent(slug)}`;
};
