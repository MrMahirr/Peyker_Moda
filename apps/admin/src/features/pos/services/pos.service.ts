import api from "../../../lib/axios";

export interface PosProduct {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  image?: string;
  stock: number;
  categoryName?: string;
}

export interface PosSession {
  id: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference?: number;
  totalSales?: number;
  totalTransactions?: number;
  notes?: string;
  openedAt: string;
  closedAt?: string;
}

export type PaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "OTHER";

export type ReturnStatus = "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";

export interface CreateReturnDto {
  orderId: string;
  reason: string;
  notes?: string;
  items: {
    orderItemId?: string;
    variantId: string;
    quantity: number;
    reason?: string;
  }[];
}

export interface PosReturn {
  id: string;
  orderId: string;
  status: ReturnStatus;
  reason: string;
  refundAmount: number | string;
  notes?: string | null;
  createdAt: string;
  items: {
    id: string;
    variantId: string;
    quantity: number;
    reason?: string | null;
  }[];
}

export interface ReturnQueryParams {
  orderNumber?: string;
  status?: ReturnStatus;
  page?: number;
  limit?: number;
}

export interface CreateSaleDto {
  customerId?: string;
  items: {
    variantId: string;
    quantity: number;
    price: number;
    discount?: number;
  }[];
  discountAmount?: number;
  couponCode?: string;
  payments: {
    method: PaymentMethod;
    amount: number;
  }[];
  notes?: string;
}

export interface SaleResult {
  order?: {
    orderNumber?: string;
  };
  change?: number;
  receipt?: {
    orderNumber?: string;
  };
}

export const posService = {
  // Products
  async getProducts(
    search?: string,
    categoryId?: string,
  ): Promise<PosProduct[]> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (categoryId) params.append("categoryId", categoryId);
    params.append("limit", "50");

    const response = await api.get(`/pos/products?${params}`);
    return response.data.data;
  },

  async getProductByBarcode(barcode: string): Promise<PosProduct | null> {
    try {
      const response = await api.get(`/pos/products/barcode/${barcode}`);
      return response.data.data;
    } catch {
      return null;
    }
  },

  // Sessions
  async getCurrentSession(): Promise<PosSession | null> {
    try {
      const response = await api.get("/pos/sessions/current");
      return response.data.data;
    } catch {
      return null;
    }
  },

  async openSession(openingBalance: number): Promise<PosSession> {
    const response = await api.post("/pos/sessions/open", { openingBalance });
    return response.data.data;
  },

  async closeSession(closingBalance: number): Promise<PosSession> {
    const response = await api.post("/pos/sessions/close", { closingBalance });
    return response.data.data;
  },

  // Sales
  async createSale(data: CreateSaleDto): Promise<SaleResult> {
    const response = await api.post("/pos/sale", data);
    return response.data.data;
  },

  async getSales(sessionId?: string) {
    const params = sessionId ? `?sessionId=${sessionId}` : "";
    const response = await api.get(`/pos/sales${params}`);
    return response.data.data;
  },

  // Returns
  async getReturns(params?: ReturnQueryParams): Promise<PosReturn[]> {
    const queryParams = new URLSearchParams();
    if (params?.orderNumber)
      queryParams.append("orderNumber", params.orderNumber);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));

    const response = await api.get(`/returns?${queryParams}`);
    return response.data?.data || [];
  },

  async createReturn(data: CreateReturnDto): Promise<PosReturn> {
    const response = await api.post("/returns", data);
    return response.data.data;
  },

  async approveReturn(id: string, notes?: string): Promise<PosReturn> {
    const response = await api.patch(`/returns/${id}/approve`, {
      restock: true,
      notes,
    });
    return response.data.data;
  },

  async completeReturn(id: string, notes?: string): Promise<PosReturn> {
    const response = await api.patch(`/returns/${id}/complete`, {
      restock: true,
      notes,
    });
    return response.data.data;
  },

  async refundReturn(
    id: string,
    data: {
      method: PaymentMethod;
      amount?: number;
      reference?: string;
      notes?: string;
      restock?: boolean;
    },
  ): Promise<PosReturn> {
    const response = await api.post(`/returns/${id}/refund`, data);
    return response.data.data;
  },

  // Categories for filtering
  async getCategories() {
    const response = await api.get("/categories?isActive=true");
    return response.data.data;
  },
};
