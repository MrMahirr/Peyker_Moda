export const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export const clearAuthStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};

export const getAuthHeaders = (
  includeContentType = false,
): Record<string, string> => {
  const token = getAccessToken();
  const headers: Record<string, string> = {};

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const redirectToLogin = () => {
  if (typeof window !== "undefined") {
    window.location.href = "/giris";
  }
};
