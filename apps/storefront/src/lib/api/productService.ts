import { API_BASE_URL } from "./config";
import { mapProduct } from "./productMapper";
import {
  AttributeResponse,
  CollectionData,
  CollectionSummary,
  Product,
  ProductListResult,
  ProductQueryParams,
} from "./types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const buildProductSearchParams = (params?: ProductQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params?.categorySlug) {
    if (UUID_PATTERN.test(params.categorySlug)) {
      searchParams.append("categoryId", params.categorySlug);
    } else {
      searchParams.append("categorySlug", params.categorySlug);
    }
  }

  if (params?.search) searchParams.append("search", params.search);
  if (params?.page) searchParams.append("page", String(params.page));
  if (params?.limit) searchParams.append("limit", String(params.limit));
  if (params?.sortBy) searchParams.append("sort", params.sortBy);
  if (params?.onSale) searchParams.append("onSale", "true");
  if (params?.sizes?.length)
    searchParams.append("sizes", params.sizes.join(","));
  if (params?.colors?.length)
    searchParams.append("colors", params.colors.join(","));
  if (params?.minPrice)
    searchParams.append("minPrice", String(params.minPrice));
  if (params?.maxPrice)
    searchParams.append("maxPrice", String(params.maxPrice));

  return searchParams;
};

const fetchProductList = async (url: string): Promise<Product[]> => {
  const response = await fetch(url);
  const data = await response.json();
  return (data.data || []).map(mapProduct);
};

export const productService = {
  async getProducts(params?: ProductQueryParams): Promise<ProductListResult> {
    try {
      const searchParams = buildProductSearchParams(params);
      const response = await fetch(
        `${API_BASE_URL}/store/products?${searchParams}`,
      );
      const data = await response.json();

      return {
        products: (data.data || []).map(mapProduct),
        total: data.meta?.total || 0,
        page: data.meta?.page || 1,
        totalPages: data.meta?.totalPages || 1,
      };
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return { products: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/store/products/${slug}`);
      const data = await response.json();
      return data.data ? mapProduct(data.data) : null;
    } catch (error) {
      console.error("Failed to fetch product:", error);
      return null;
    }
  },

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      return await fetchProductList(
        `${API_BASE_URL}/store/products?featured=true&limit=8`,
      );
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
      return [];
    }
  },

  async getSaleProducts(): Promise<Product[]> {
    try {
      return await fetchProductList(
        `${API_BASE_URL}/store/products?onSale=true&limit=8`,
      );
    } catch (error) {
      console.error("Failed to fetch sale products:", error);
      return [];
    }
  },

  async getTopProducts(limit = 10): Promise<Product[]> {
    try {
      return await fetchProductList(
        `${API_BASE_URL}/store/products?sort=popular&limit=${limit}`,
      );
    } catch (error) {
      console.error("Failed to fetch top products:", error);
      return [];
    }
  },

  async getNewArrivals(limit = 8): Promise<Product[]> {
    try {
      return await fetchProductList(
        `${API_BASE_URL}/store/products?sort=newest&limit=${limit}`,
      );
    } catch (error) {
      console.error("Failed to fetch new arrivals:", error);
      return [];
    }
  },

  async getCollections(): Promise<CollectionSummary[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/store/collections`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Failed to fetch collections:", error);
      return [];
    }
  },

  async getCollectionBySlug(slug: string): Promise<CollectionData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/store/collections/${slug}`);
      const data = await response.json();

      if (data.data?.products) {
        data.data.products = data.data.products.map(mapProduct);
      }

      return data.data || null;
    } catch (error) {
      console.error("Failed to fetch collection:", error);
      return null;
    }
  },

  async getAttributes(categorySlug?: string): Promise<AttributeResponse> {
    try {
      const url = categorySlug
        ? `${API_BASE_URL}/store/attributes?categorySlug=${categorySlug}`
        : `${API_BASE_URL}/store/attributes`;
      const response = await fetch(url);
      const data = await response.json();
      return data.data || { sizes: [], colors: [] };
    } catch (error) {
      console.error("Failed to fetch attributes:", error);
      return { sizes: [], colors: [] };
    }
  },
};
