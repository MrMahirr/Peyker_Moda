export const getCategoryLink = (slug?: string) => {
  if (!slug) return "/giyim";

  const normalized = slug.toLowerCase().trim();

  if (
    normalized === "aksesuar" ||
    normalized === "aksesuarlar" ||
    normalized === "accessories"
  ) {
    return "/aksesuar";
  }

  if (
    normalized === "indirim" ||
    normalized === "firsat" ||
    normalized === "sale"
  ) {
    return "/indirim";
  }

  if (
    normalized === "giyim" ||
    normalized === "clothing" ||
    normalized === "elbise"
  ) {
    return "/giyim";
  }

  return `/giyim?category=${encodeURIComponent(slug)}`;
};
