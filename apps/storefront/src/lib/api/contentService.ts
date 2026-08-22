import { API_BASE_URL } from "./config";
import { BannerContent, PageHeaderContent } from "./types";

export const contentService = {
  async getBanners(position?: string): Promise<BannerContent[]> {
    try {
      const params = position ? `?position=${position}` : "";
      const response = await fetch(`${API_BASE_URL}/store/banners${params}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch banners:", error);
      return [];
    }
  },

  async getPageHeader(slug: string): Promise<PageHeaderContent | null> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/store/page-headers/${slug}`,
      );
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error("Failed to fetch page header:", error);
      return null;
    }
  },

};
