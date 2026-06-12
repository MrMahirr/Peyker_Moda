import {
  clearAuthStorage,
  getAccessToken,
  redirectToLogin,
} from "./authStorage";
import { API_BASE_URL } from "./config";
import { FavoriteResponse } from "./types";

const handleFavoriteAuthError = async (response: Response, context: string) => {
  const text = await response.text();
  console.error(`${context} (Server Error):`, text);

  if (response.status === 401) {
    clearAuthStorage();
    redirectToLogin();
  }
};

export const favoriteService = {
  async getFavorites(): Promise<FavoriteResponse[]> {
    const token = getAccessToken();
    if (!token) return [];
    try {
      const response = await fetch(`${API_BASE_URL}/store/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      return [];
    }
  },

  async addFavorite(productId: string): Promise<boolean> {
    const token = getAccessToken();
    if (!token) return false;
    try {
      const response = await fetch(
        `${API_BASE_URL}/store/favorites/${productId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        await handleFavoriteAuthError(response, "Failed to add favorite");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Failed to add favorite:", error);
      return false;
    }
  },

  async removeFavorite(productId: string): Promise<boolean> {
    const token = getAccessToken();
    if (!token) return false;
    try {
      const response = await fetch(
        `${API_BASE_URL}/store/favorites/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        await handleFavoriteAuthError(response, "Failed to remove favorite");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      return false;
    }
  },
};
