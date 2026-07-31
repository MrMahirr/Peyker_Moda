import { API_BASE_URL } from "./config";
import { Category } from "./types";

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/store/categories`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/store/categories/${slug}`);
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error("Failed to fetch category:", error);
      return null;
    }
  },
};
