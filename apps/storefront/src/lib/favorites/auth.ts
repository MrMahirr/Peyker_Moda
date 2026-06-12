export const hasFavoriteAccess = () => {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("accessToken"));
};
